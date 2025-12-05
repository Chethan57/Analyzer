import { useState } from 'react';

export default function Home() {
  const [result, setResult] = useState('');

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert('Please select a CSV file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      analyzeCSV(text);
    };
    reader.readAsText(file);
  };

  const analyzeCSV = (text) => {
    const rows = text.split('\n').filter((r) => r.trim() !== '');
    if (rows.length < 2) {
      setResult('CSV has no data');
      return;
    }

    const headers = rows[0].split(',');
    const dataRows = rows.slice(1).map((r) => r.split(','));

    const resultObj = {
      totalRows: dataRows.length,
      totalColumns: headers.length,
      columns: headers,
      numericSummary: {},
    };

    headers.forEach((header, idx) => {
      const nums = dataRows
        .map((row) => parseFloat(row[idx]))
        .filter((v) => !isNaN(v));
      if (nums.length > 0) {
        const sum = nums.reduce((a, b) => a + b, 0);
        resultObj.numericSummary[header] = {
          count: nums.length,
          min: Math.min(...nums),
          max: Math.max(...nums),
          average: sum / nums.length,
        };
      }
    });

    setResult(JSON.stringify(resultObj, null, 2));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-blue-400 mb-6">CSV Analyzer</h1>

      <input
        type="file"
        accept=".csv"
        onChange={handleFile}
        className="mb-4 p-2 rounded border border-blue-400 bg-gray-700 cursor-pointer"
      />

      <div className="bg-gray-800 p-6 rounded shadow-lg w-full max-w-3xl whitespace-pre-wrap">
        {result || 'Upload a CSV file to see analysis here...'}
      </div>
    </div>
  );
}
