import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // must be set in Vercel
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { csvData } = req.body;

  if (!csvData || !Array.isArray(csvData)) {
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

    console.log("OpenAI Response:", response.choices[0].message.content);

    res.status(200).json({ summary: response.choices[0].message.content });
  } catch (err) {
    console.error("OpenAI API Error:", err);
    res.status(500).json({ error: "AI analysis failed" });
  }
}
