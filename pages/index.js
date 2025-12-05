import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");

  const upload = async () => {
    if (!file) {
      alert("Upload a CSV");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/analyze", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    setResult(JSON.stringify(data, null, 2));
  };

  return (
    <div>
      <h1>CSV Analyzer</h1>

      <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} />

      <button onClick={upload} style={{ marginTop: "10px" }}>
        Analyze
      </button>

      <pre style={{ marginTop: "20px", whiteSpace: "pre-wrap" }}>
        {result}
      </pre>
    </div>
  );
}
