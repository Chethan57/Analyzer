import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) {
      alert('Please upload a CSV file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (data.error) {
      setResult('Error: ' + data.error);
    } else {
      setResult(data.summary);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-blue-400 mb-6">CSV Analyzer</h1>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-4 p-2 rounded border border-blue-400 bg-gray-700 cursor-pointer"
      />

      <button
        onClick={handleAnalyze}
        className="mb-6 px-6 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 transition-colors"
      >
        Analyze
      </button>

      <div className="bg-gray-800 p-6 rounded shadow-lg w-full max-w-3xl whitespace-pre-wrap">
        {result || 'Analysis output will appear here...'}
      </div>
    </div>
  );
}
