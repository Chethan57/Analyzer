export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { csvData } = req.body;

  if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
    return res.status(400).json({ error: "Invalid CSV data" });
  }

  // Basic analysis logic
  const numericColumns = {};
  const columnNames = Object.keys(csvData[0] || {});

  columnNames.forEach((col) => {
    numericColumns[col] = csvData
      .map((row) => row[col])
      .filter((val) => typeof val === "number");
  });

  let summary = `CSV has ${csvData.length} rows and ${columnNames.length} columns.\n\n`;

  columnNames.forEach((col) => {
    const nums = numericColumns[col];
    if (nums.length > 0) {
      const avg = (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2);
      const min = Math.min(...nums);
      const max = Math.max(...nums);
      summary += `Column '${col}': Avg=${avg}, Min=${min}, Max=${max}\n`;
    } else {
      summary += `Column '${col}': Non-numeric or cannot calculate stats\n`;
    }
  });

  res.status(200).json({ summary });
}
