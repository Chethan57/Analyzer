import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Upload CSV first");

    setLoading(true);

    const text = await file.text();

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csvData: text })
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-blue-400 mb-6">
        CSV Analyzer Dashboard
      </h1>

      <div className="bg-slate-800 p-6 rounded-xl shadow-xl w-full max-w-xl">
        <input
          type="file"
          accept=".csv"
          className="mb-4 text-white"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button
          onClick={handleUpload}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
        >
          {loading ? "Analyzing..." : "Analyze CSV"}
        </button>
      </div>

      {result && (
        <div className="mt-10 w-full max-w-3xl bg-slate-900 p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Analysis Summary</h2>

          {result.error ? (
            <p className="text-red-400">{result.error}</p>
          ) : (
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(result.summary, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
