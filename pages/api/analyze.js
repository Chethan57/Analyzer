// pages/api/analyze.js
// Advanced CSV analyzer: returns KPIs, pandas-like summary, freq tables, correlation, and chart data
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { csvData, options } = req.body; // csvData: array of objects (parsed by PapaParse). options optional.

  if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
    return res.status(400).json({ error: "Invalid CSV data" });
  }

  try {
    // Basic helpers
    const isNumber = (v) => v !== null && v !== "" && !isNaN(Number(v));
    const toNumber = (v) => (isNumber(v) ? Number(v) : NaN);

    const parseDate = (v) => {
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? null : d;
    };

    // Collect column names
    const columns = Object.keys(csvData[0]);

    // Type detection
    const colInfo = {};
    columns.forEach((col) => {
      let numCount = 0, dateCount = 0, total = 0;
      for (let i = 0; i < csvData.length; i++) {
        const raw = csvData[i][col];
        if (raw === null || raw === undefined || raw === "") { total++; continue; }
        if (isNumber(raw)) numCount++;
        else if (parseDate(raw)) dateCount++;
        total++;
      }
      // heuristics: numeric if >60% numeric, date if >60% parseable date
      if (total === 0) colInfo[col] = { type: "unknown" };
      else if (numCount / total >= 0.6) colInfo[col] = { type: "numeric" };
      else if (dateCount / total >= 0.6) colInfo[col] = { type: "date" };
      else colInfo[col] = { type: "categorical" };
    });

    // Aggregate column values
    const numericCols = columns.filter(c => colInfo[c].type === "numeric");
    const dateCols = columns.filter(c => colInfo[c].type === "date");
    const categoricalCols = columns.filter(c => colInfo[c].type === "categorical");

    // Basic stats functions
    const mean = (arr) => arr.reduce((a, b) => a + b, 0) / (arr.length || 1);
    const std = (arr) => {
      if (arr.length <= 1) return 0;
      const m = mean(arr);
      return Math.sqrt(arr.reduce((s, v) => s + (v - m) * (v - m), 0) / (arr.length - 1));
    };
    const quantile = (arr, q) => {
      if (!arr.length) return null;
      const s = [...arr].sort((a, b) => a - b);
      const pos = (s.length - 1) * q;
      const lower = Math.floor(pos), upper = Math.ceil(pos), weight = pos - lower;
      if (upper >= s.length) return s[lower];
      return s[lower] * (1 - weight) + s[upper] * weight;
    };

    // Build numeric column stats and histograms
    const summaries = {};
    const charts = []; // chart payloads
    const kpis = [];

    numericCols.forEach((col) => {
      const vals = csvData.map(r => toNumber(r[col])).filter(v => !Number.isNaN(v));
      const missing = csvData.length - vals.length;
      const cnt = vals.length;
      const avg = cnt ? mean(vals) : null;
      const sd = cnt ? std(vals) : null;
      const mn = cnt ? Math.min(...vals) : null;
      const mx = cnt ? Math.max(...vals) : null;
      const q1 = cnt ? quantile(vals, 0.25) : null;
      const q2 = cnt ? quantile(vals, 0.5) : null;
      const q3 = cnt ? quantile(vals, 0.75) : null;

      summaries[col] = {
        column: col,
        type: "numeric",
        count: cnt,
        missing,
        mean: avg,
        std: sd,
        min: mn,
        "25%": q1,
        "50%": q2,
        "75%": q3,
        max: mx,
      };

      // KPI pick: top numeric columns by mean or max (simple)
      kpis.push({ label: `Avg ${col}`, value: avg, column: col });

      // Build histogram buckets (10 by default)
      const buckets = [];
      if (cnt) {
        const bucketCount = options?.histBuckets || 10;
        const binWidth = (mx - mn) / bucketCount || 1;
        // initialize
        for (let i = 0; i < bucketCount; i++) buckets.push({ x0: mn + i * binWidth, x1: mn + (i + 1) * binWidth, count: 0 });
        vals.forEach(v => {
          let idx = Math.floor((v - mn) / binWidth);
          if (idx < 0) idx = 0;
          if (idx >= bucketCount) idx = bucketCount - 1;
          buckets[idx].count++;
        });
      }
      charts.push({ type: "histogram", column: col, data: buckets });
    });

    // Categorical columns: unique counts and top frequencies
    const freq_tables = {};
    categoricalCols.forEach((col) => {
      const freq = {};
      let missing = 0;
      for (const row of csvData) {
        const v = row[col];
        if (v === null || v === undefined || v === "") { missing++; continue; }
        const key = String(v);
        freq[key] = (freq[key] || 0) + 1;
      }
      const freqArray = Object.entries(freq).map(([value, count]) => ({ value, count })).sort((a,b)=>b.count-a.count);
      freq_tables[col] = { column: col, unique: freqArray.length, missing, top: freqArray.slice(0, 10) };
      // chart for top categories
      charts.push({ type: "bar_top", column: col, data: freqArray.slice(0, 10) });
    });

    // Correlation matrix for numeric columns (Pearson)
    const correlation = {};
    if (numericCols.length >= 2) {
      const numericVals = {};
      numericCols.forEach(col => {
        numericVals[col] = csvData.map(r => toNumber(r[col])).filter(v => !Number.isNaN(v));
      });

      // Helper pearson function (uses pairwise matching by index - best effort)
      const pearson = (a, b) => {
        const n = Math.min(a.length, b.length);
        if (n === 0) return null;
        const a2 = a.slice(0, n), b2 = b.slice(0, n);
        const ma = mean(a2), mb = mean(b2);
        const num = a2.reduce((s, v, i) => s + (v - ma) * (b2[i] - mb), 0);
        const den = Math.sqrt(a2.reduce((s,v)=>s+(v-ma)*(v-ma),0) * b2.reduce((s,v)=>s+(v-mb)*(v-mb),0));
        if (den === 0) return 0;
        return num / den;
      };

      numericCols.forEach(c1 => {
        correlation[c1] = {};
        numericCols.forEach(c2 => {
          correlation[c1][c2] = pearson(numericVals[c1], numericVals[c2]);
        });
      });
    }

    // Time series: if a date column exists pick the first date column
    let timeseries = null;
    if (dateCols.length > 0) {
      const dateCol = dateCols[0];
      // try to aggregate by day, produce count and numeric aggregations if numeric present
      const byDay = {};
      csvData.forEach((r) => {
        const d = parseDate(r[dateCol]);
        if (!d) return;
        const dayKey = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0,10);
        byDay[dayKey] = byDay[dayKey] || { count: 0 };
        byDay[dayKey].count++;
        // numeric columns: sum
        numericCols.forEach(nc => {
          const v = toNumber(r[nc]);
          if (!Number.isNaN(v)) {
            byDay[dayKey][nc] = (byDay[dayKey][nc] || 0) + v;
          }
        });
      });
      const series = Object.keys(byDay).sort().map(day => ({ date: day, ...byDay[day] }));
      timeseries = { dateColumn: dateCol, series, numericColumns: numericCols };
      // add a timeseries chart for counts
      charts.push({ type: "timeseries_count", column: dateCol, data: series.map(s => ({ x: s.date, y: s.count })) });
    }

    // Build the final response schema
    const responsePayload = {
      meta: {
        rows: csvData.length,
        columns: columns.length,
        numericColumns,
        categoricalCols,
        dateCols
      },
      kpis: kpis.sort((a,b)=> (b.value||0) - (a.value||0)).slice(0, 6),
      summaries,
      freq_tables,
      correlation,
      timeseries,
      charts
    };

    return res.status(200).json(responsePayload);
  } catch (err) {
    console.error("Analysis error:", err);
    return res.status(500).json({ error: "Analysis failed", details: err.message });
  }
}
