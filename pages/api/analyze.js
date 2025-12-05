export const config = {
  api: {
    bodyParser: false,
  },
};

import Papa from "papaparse";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const buffers = [];

  req.on("data", (chunk) => buffers.push(chunk));
  req.on("end", () => {
    const csvData = Buffer.concat(buffers).toString();

    if (!csvData) {
      return res.status(400).json({ error: "No CSV received" });
    }

    // Parse CSV
    const parsed = Papa.parse(csvData, { header: true });

    if (parsed.errors.length > 0) {
      return res.status(400).json({ error: "Invalid CSV" });
    }

    const rows = parsed.data.filter((r) => Object.keys(r).length > 1);

    const summary = {
      totalRows: rows.length,
      totalColumns: rows.length ? Object.keys(rows[0]).length : 0,
      columns: rows.length ? Object.keys(rows[0]) : [],
      sample: rows.slice(0, 5)
    };

    res.status(200).json(summary);
  });
}
