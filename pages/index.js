import { useState } from "react";
import Papa from "papaparse";

export default function Home() {
  const [csvFile, setCsvFile] = useState(null);
  const [summary, setSummary] = useState("");

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleAnalyze = () => {
    if (!csvFile) return;

    Papa.parse(csvFile, {
      header: true,
      complete: async (results) => {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csvData: results.data }),
        });
        const data = await response.json();
        setSummary(data.summary);
      },
    });
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>CSV Analyzer</h1>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleAnalyze} style={{ marginLeft: "1rem" }}>
        Analyze
      </button>
      {summary && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Analysis Summary:</h2>
          <pre>{summary}</pre>
        </div>
      )}
    </div>
  );
}
