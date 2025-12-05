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
      body: JSON.stringify({ csvData: text }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.error) {
      alert(data.error);
    } else {
      setResult(data);
    }
  };

  return (
    <div className="min-h-screen bg-black text-blue-400 flex flex-col items-center py-16">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Smart CSV Analyzer
      </h1>

      <div className="bg-gray-900 p-6 rounded-xl shadow-lg w-96 text-center">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4 bg-gray-800 p-2 rounded text-white w-full"
        />

        <button
          onClick={handleUpload}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded w-full"
        >
          {loading ? "Analyzing..." : "Analyze CSV"}
        </button>
      </div>

      {/* RESULT OUTPUT */}
      {result && (
        <div className="mt-10 w-3/4 bg-gray-900 p-6 rounded-xl shadow-xl">
          <h2 className="text-2xl font-semibold mb-4">📊 Analysis Result</h2>

          {/* Show KPIs */}
          {result.kpis && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {Object.keys(result.kpis).map((key) => (
                <div
                  key={key}
                  className="bg-gray-800 p-4 rounded-lg text-center border border-blue-400"
                >
                  <p className="text-sm text-gray-300">{key}</p>
                  <p className="text-xl font-bold text-blue-300">
                    {result.kpis[key]}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Show Summary */}
          {result.summary && (
            <div className="mb-6">
              <h3 className="text-xl mb-2 text-blue-300">Summary</h3>
              <p className="text-gray-300 whitespace-pre-line">{result.summary}</p>
            </div>
          )}

          {/* Show Table */}
          {result.table && (
            <>
              <h3 className="text-xl mb-2 text-blue-300">Data Table</h3>
              <div className="overflow-auto max-h-96 border border-gray-800 rounded-lg">
                <table className="w-full text-left text-gray-300">
                  <thead className="bg-gray-800">
                    <tr>
                      {Object.keys(result.table[0]).map((col) => (
                        <th key={col} className="p-2 border-b border-gray-700">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.table.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-800">
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="p-2 border-b border-gray-700">
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
