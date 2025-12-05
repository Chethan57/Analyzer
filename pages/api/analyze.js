import Papa from "papaparse";

export default async function handler(req, res) {
  try {
    const { csvData } = req.body;

    if (!csvData || csvData.trim().length < 5)
      return res.status(400).json({ error: "Invalid CSV data" });

    console.log("Sample received:", csvData.slice(0, 150));

    const parsed = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      delimiter: "",       // auto-detect
      transformHeader: (h) => h.trim()
    });

    if (parsed.errors && parsed.errors.length > 0) {
      console.error("CSV ERROR:", parsed.errors);
      return res.status(400).json({ error: "CSV parse failed" });
    }

    const rows = parsed.data;
    const numericCols = {};
    const summaries = {};

    rows.forEach((row) => {
      Object.keys(row).forEach((col) => {
        const val = row[col];
        if (typeof val === "number" && !isNaN(val)) {
          if (!numericCols[col]) numericCols[col] = [];
          numericCols[col].push(val);
        }
      });
    });

    Object.keys(numericCols).forEach((col) => {
      const arr = numericCols[col];
      summaries[col] = {
        count: arr.length,
        min: Math.min(...arr),
        max: Math.max(...arr),
        avg: arr.reduce((a, b) => a + b, 0) / arr.length
      };
    });

    res.json({ summary: summaries });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error", details: e.message });
  }
}
