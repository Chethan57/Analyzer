import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { csvData } = req.body;

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

      res.status(200).json({ summary: response.choices[0].message.content });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "AI analysis failed" });
    }
  } else {
    res.status(405).send("Method Not Allowed");
  }
}
