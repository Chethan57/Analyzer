// pages/index.js
import { useState } from "react";

export default function Home() {
  const [csvText, setCsvText] = useState("");
  const [result, setResult] = useState(null);

  async function analyze() {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csvData: csvText }),
    });

    const data = await res.json();
    setResult(data);
  }

  return (
    <div className="min-h-screen bg-black text-blue-400 flex flex-col items-center p-10">

      <h1 className="text-3xl font-bold mb-6 text-center">
        CSV Analyzer (Basic)
      </h1>

      <textarea
        className="w-full max-w-2xl h-48 p-3 bg-gray-900 text-white rounded-md"
        placeholder="Paste CSV here..."
        value={csvText}
        onChange={(e) => setCsvText(e.target.value)}
      />

      <button
        onClick={analyze}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
      >
        Analyze
      </button>

      {result && (
        <div className="mt-10 w-full max-w-2xl bg-gray-900 p-5 rounded-md text-white">

          <h2 className="text-xl font-semibold mb-2">Analysis Summary</h2>

          <pre className="text-sm bg-gray-800 p-3 rounded-md overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>

        </div>
      )}
    </div>
  );
}
