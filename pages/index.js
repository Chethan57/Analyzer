import { useState } from "react";
import Papa from "papaparse";

export default function Home() {
  const [csvFile, setCsvFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
    setSummary("");
  };

  const handleAnalyze = () => {
    if (!csvFile) {
      alert("Please upload a CSV file first!");
      return;
    }

    setLoading(true);

    Papa.parse(csvFile, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const data = results.data;

        fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csvData: data }),
        })
          .then((res) => res.json())
          .then((data) => setSummary(data.summary))
          .catch((err) => setSummary("Error: " + err.message))
          .finally(() => setLoading(false));
      },
      error: (err) => {
        setSummary("CSV Parse Error: " + err.message);
        setLoading(false);
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl font-bold text-blue-400 mb-6">
        CSV Analyzer
      </h1>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-4 p-2 rounded border border-blue-400 bg-gray-700 text-white cursor-pointer"
      />

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="mb-6 px-6 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 transition-colors"
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {summary && (
        <div className="bg-gray-800 text-blue-200 p-6 rounded shadow-lg max-w-3xl w-full">
          <h2 className="text-xl font-semibold mb-4">Analysis Summary:</h2>
          <pre className="whitespace-pre-wrap text-left">{summary}</pre>
        </div>
      )}

      <footer className="mt-12 text-gray-400">
        Made with 💙 by You
      </footer>
    </div>
  );
}
