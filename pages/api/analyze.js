import formidable from "formidable";
import fs from "fs";
import csv from "csv-parser";

export const config = {
  api: {
    bodyParser: false, // Required for file upload
  },
};

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
    }

  const form = new formidable.IncomingForm();

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "Form parse failed" });
    }

    if (!files.file) {
      return res.status(400).json({ error: "No CSV data received" });
    }

    const filePath = files.file.filepath;

    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => results.push(row))
      .on("end", () => {
        if (results.length === 0) {
          return res.status(400).json({ error: "CSV parse failed" });
        }

        const columns = Object.keys(results[0]);

        const numericSummary = {};
        columns.forEach((col) => {
          let nums = results
            .map((r) => parseFloat(r[col]))
            .filter((n) => !isNaN(n));

          if (nums.length > 0) {
            numericSummary[col] = {
              count: nums.length,
              min: Math.min(...nums),
              max: Math.max(...nums),
              average: nums.reduce((a, b) => a + b, 0) / nums.length,
            };
          }
        });

        res.status(200).json({
          totalRows: results.length,
          totalColumns: columns.length,
          columns,
          sampleRows: results.slice(0, 5),
          numericSummary,
        });
      });
  });
}
