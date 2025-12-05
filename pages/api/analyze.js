import { IncomingForm } from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const form = new IncomingForm();

  form.parse(req, (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'File parse failed' });
    const file = files.file;

    if (!file) return res.status(400).json({ error: 'No CSV file uploaded' });

    const data = fs.readFileSync(file.filepath, 'utf-8');
    const rows = data.split('\n').filter((r) => r.trim() !== '');
    if (rows.length < 2) return res.json({ summary: 'CSV has no data' });

    const headers = rows[0].split(',');
    const result = {
      totalRows: rows.length - 1,
      totalColumns: headers.length,
      columns: headers,
      numericSummary: {},
    };

    const numericCols = headers.filter((h, idx) =>
      rows.slice(1).every((r) => !isNaN(parseFloat(r.split(',')[idx])))
    );

    numericCols.forEach((col) => {
      const idx = headers.indexOf(col);
      const nums = rows.slice(1).map((r) => parseFloat(r.split(',')[idx]));
      const sum = nums.reduce((a, b) => a + b, 0);
      result.numericSummary[col] = {
        count: nums.length,
        min: Math.min(...nums),
        max: Math.max(...nums),
        average: sum / nums.length,
      };
    });

    res.json({ summary: JSON.stringify(result, null, 2) });
  });
}
