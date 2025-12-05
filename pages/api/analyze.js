// pages/api/analyze.js
export default function handler(req, res) {
  try {
    const { csvData } = req.body;

    if (!csvData) {
      return res.status(400).json({ error: "No CSV data received" });
    }

    // Parse CSV manually (simple)
    const lines = csvData.trim().split("\n");
    const headers = lines[0].split(",").map(h => h.trim());

    const rows = lines.slice(1).map(line => {
      const values = line.split(",");
      let obj = {};
      headers.forEach((h, i) => { obj[h] = values[i]?.trim(); });
      return obj;
    });

    // Basic analysis
    const totalRows = rows.length;
    const totalColumns = headers.length;
    const sample = rows.slice(0, 5);

    // Numeric summaries
    let numericSummary = {};

    headers.forEach(col => {
      let nums = rows
        .map(r => parseFloat(r[col]))
        .filter(v => !isNaN(v));

      if (nums.length > 0) {
        const sum = nums.reduce((a, b) => a + b, 0);
        numericSummary[col] = {
          count: nums.length,
          min: Math.min(...nums),
          max: Math.max(...nums),
          average: sum / nums.length
        };
      }
    });

    return res.status(200).json({
      totalRows,
      totalColumns,
      columns: headers,
      sampleRows: sample,
      numericSummary
    });

  } catch (e) {
    return res.status(500).json({ error: "Server error", details: e.message });
  }
}
