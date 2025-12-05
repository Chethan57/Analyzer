import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const analyze = async () => {
    if (!file) return alert("Upload a CSV file first!");

    setLoading(true);
    setResult(null);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "Failed to analyze" });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-10">
      <h1 className="text-4xl font-bold text-blue-400 mb-6">CSV Analyzer</h1>

      {/* Upload Box */}
      <div className="bg-gray-900 p-6 rounded-xl shadow-xl w-full max-w-lg">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="w-full p-3 bg-gray-800 rounded mb-4"
        />

        <button
          onClick={analyze}
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-semibold"
        >
          {loading ? "Analyzing..." : "Analyze CSV"}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="mt-10 w-full max-w-4xl space-y-10">

          {/* Error */}
          {result.error && (
            <div className="text-red-400 text-xl font-semibold">
              Error: {result.error}
            </div>
          )}

          {/* Summary */}
          {!result.error && (
            <>
              {/* Dataset Info */}
              <section>
                <h2 className="text-2xl mb-2 text-blue-300">Dataset Info</h2>
                <table className="w-full border border-gray-700">
                  <tbody>
                    <tr>
                      <td className="border px-3 py-2">Total Rows</td>
                      <td className="border px-3 py-2">{result.totalRows}</td>
                    </tr>
                    <tr>
                      <td className="border px-3 py-2">Total Columns</td>
                      <td className="border px-3 py-2">{result.totalColumns}</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              {/* Columns */}
              <section>
                <h2 className="text-2xl mb-2 text-blue-300">Columns</h2>
                <table className="w-full border border-gray-700">
                  <thead>
                    <tr>
                      <th className="border px-3 py-2">Column Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.columns?.map((col, idx) => (
                      <tr key={idx}>
                        <td className="border px-3 py-2">{col}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              {/* Sample Rows */}
              <section>
                <h2 className="text-2xl mb-2 text-blue-300">Sample Rows</h2>
                <table className="w-full border border-gray-700">
                  <thead>
                    <tr>
                      {result.columns?.map((col, idx) => (
                        <th key={idx} className="border px-3 py-2">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.sampleRows?.map((row, i) => (
                      <tr key={i}>
                        {result.columns.map((col, j) => (
                          <td key={j} className="border px-3 py-2">{row[col]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              {/* Numeric Summary */}
              {result.numericSummary && (
                <section>
                  <h2 className="text-2xl mb-2 text-blue-300">Numeric Summary</h2>
                  <table className="w-full border border-gray-700">
                    <thead>
                      <tr>
                        <th className="border px-3 py-2">Column</th>
                        <th className="border px-3 py-2">Min</th>
                        <th className="border px-3 py-2">Max</th>
                        <th className="border px-3 py-2">Average</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(result.numericSummary).map(([col, stats], idx) => (
                        <tr key={idx}>
                          <td className="border px-3 py-2">{col}</td>
                          <td className="border px-3 py-2">{stats.min}</td>
                          <td className="border px-3 py-2">{stats.max}</td>
                          <td className="border px-3 py-2">{stats.average}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
