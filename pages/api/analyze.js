import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  console.log("----- API Called -----");

  if (req.method !== "POST") {
    console.log("Method not allowed:", req.method);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is missing!");
    return res.status(500).json({ error: "Server misconfiguration: missing API key" });
  }
  console.log("OPENAI_API_KEY exists ✔️");

  const { csvData } = req.body;
  if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
    console.error("Invalid CSV data:", csvData);
    return res.status(400).json({ error: "Invalid CSV data" });
  }
  console.log("Received CSV Data:", csvData);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Analyze this CSV data and summarize key trends in simple language: ${JSON.stringify(csvData)}`,
        },
      ],
    });

    // ✅ Fixed this line
    const summary = response.choices?.[0]?.messa
