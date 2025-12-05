import Papa from "papaparse";

export default function handler(req, res) {
  try {
    const { csvData } = req.body;

    if (!csvData || csvData.trim().length < 5) {
      return res.status(400).json({ error: "Invalid CSV data" });
    }

    const parsed = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false
    });

    if (parsed.errors.length > 0) {
      return res.status(400).json({ error: "CSV parse failed" });
    }

    const rows = parsed.data;
    const numericCols = {};
    const summary = {};

    // Extract numeric columns safely
    rows.forEach((row) => {
