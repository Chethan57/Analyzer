import { useState } from "react";
import Papa from "papaparse";

export default function Home() {
  const [csvFile, setCsvFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
    setSummary(""); // reset previous result
  };

  const handleAnalyze = () => {
    if (!csvFile) {
      alert("Please upload a CSV file first!");
      return;
    }

    setLoading(true);

    Papa.parse(csvFile, {
      header: true,
      complete: async (results) => {
        console.log("Parsed CSV Data:", results.data);

        try {
          const response = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ csvData: results.data }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error("API Error:", errorText);
            setSummary("Error: " + errorText);
            setLoading(false);
            return;
          }

          const data = await response.json();
          console.log("API Response:", data);
          setSummary(data.summary || "No summary returned");
        } catch (err) {
          console.error("Fetch Error:", err);
          setSummary("Error: " + err.message);
        } finally {
          setLoading(false);
        }
      },
      error: (err) => {
        console.error("CSV Parse Error:", err);
        setSummary("Error parsing CSV: " + err.message);
        setLoading(false);
      },
    });
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>CSV Analyzer</h1>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button
        onClick={handleAnalyze}
        style={{ marginLeft: "1rem" }}
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Analyze"}
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
