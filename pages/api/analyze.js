import Papa from "papaparse";

export default async function handler(req, res) {
  try {
    const { csvData } = req.body;

    if (!csvData || csvData.trim().length < 5)
      return res.status(400).json({ error: "Invalid CSV data" });

    const parsed = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // don't auto-type
      delimiter: "",
      transformHeader: (h) => h.trim()
    });

    if (parsed.errors.length > 0) {
      console.error(parsed.errors);
      return res.status(400).json({ error: "CSV parse failed" });
    }

    const rows = parsed.data;
    const numericCols = {};
    const summaries = {};

    // FORCE detect numbers
    rows.forEach((row) => {
      Object.keys(row).forEach((col) => {
        let val = row[col];

        if (typeof val =
