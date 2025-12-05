import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  console.log("----- API Called -----");

  // 1️⃣ Check HTTP method
  if (req.method !== "POST") {
    console.log("Method not allowed:", req.method);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 2️⃣ Check API key
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is missing!");
    return res.status(500).json({ error: "Server misconfiguration: missing API key" });
  }
  console.log("OPENAI_API_KEY exists ✔️");

  // 3️⃣ Validate CSV data
  const { csvData } = req.body;
  if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
    console.error("Invalid CSV data:", csvData);
    return res.status(400).json({ error: "Invalid CSV data" });
  }
  console.log("Received CSV Data:", csvData);

  try {
    // 4️⃣ Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Analyze this CSV data and summarize key trends in simple language: ${JSON.stringify(csvData)}`,
        },
      ],
    });

    // 5️⃣ Safely extract summary
    const summary =
      response?.choices?.[0]?.message?.content ||
      "No summary returned from OpenAI";

    console.log("OpenAI Response:", summary);

    // 6️⃣ Send response to frontend
    res.status(200).json({ summary });
  } catch (err) {
    console.error("OpenAI API Error:", err);
    res
      .status(500)
      .json({ error: "AI analysis failed", details: err.message });
  }
}
