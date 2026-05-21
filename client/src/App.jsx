import { useState } from "react";
import axios from "axios";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function App() {

  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [severity, setSeverity] = useState("LOW");
  const [dragging, setDragging] = useState(false);

  const [stats, setStats] = useState({
    errors: 0,
    risks: 0,
    warnings: 0,
    uptime: "99.9%",
  });

  // FILE HANDLING

  const handleFileChange = (selectedFile) => {
    setFile(selectedFile);
  };

  // DRAG EVENTS

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {

    e.preventDefault();

    setDragging(false);

    const droppedFile = e.dataTransfer.files[0];

    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  // UPLOAD

  const handleUpload = async () => {

    if (!file) {
      alert("Please select a log file");
      return;
    }

    const formData = new FormData();

    formData.append("logFile", file);

    try {

      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/logs/upload",
        formData
      );

      setAnalysis(response.data.analysis);

      setSource(response.data.source);

      const text = response.data.analysis.toLowerCase();

      const errorCount = (text.match(/error/g) || []).length;

      const riskCount = (text.match(/risk/g) || []).length;

      const warningCount = (text.match(/warning/g) || []).length;

      setStats({
        errors: errorCount,
        risks: riskCount,
        warnings: warningCount,
        uptime: "99.9%",
      });

      // SEVERITY

      if (
        text.includes("critical") ||
        text.includes("crash") ||
        errorCount >= 5
      ) {
        setSeverity("HIGH");
      }

      else if (
        warningCount >= 2 ||
        riskCount >= 1
      ) {
        setSeverity("MEDIUM");
      }

      else {
        setSeverity("LOW");
      }

    } catch (error) {

      console.error(error);

      alert("Upload failed");
    }

    setLoading(false);
  };

  // DOWNLOAD REPORT

  const downloadReport = () => {

    const element = document.createElement("a");

    const fileContent = `
AI DEVOPS LOG ANALYZER REPORT

Severity Level: ${severity}

Source: ${source}

${analysis}
`;

    const fileBlob = new Blob(
      [fileContent],
      { type: "text/plain" }
    );

    element.href = URL.createObjectURL(fileBlob);

    element.download = "AI_DevOps_Report.txt";

    document.body.appendChild(element);

    element.click();
  };

  // CHART DATA

  const chartData = [
    {
      name: "Errors",
      value: stats.errors,
    },
    {
      name: "Risks",
      value: stats.risks,
    },
    {
      name: "Warnings",
      value: stats.warnings,
    },
  ];

  const COLORS = [
    "#ef4444",
    "#facc15",
    "#3b82f6",
  ];

  return (

    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-10">

      <div className="bg-white/10 backdrop-blur-lg border border-gray-700 shadow-2xl rounded-3xl p-8 w-full max-w-7xl text-white">

        {/* TITLE */}

        <h1 className="text-5xl font-extrabold text-center mb-4">
          AI DevOps Log Analyzer
        </h1>

        <p className="text-center text-gray-300 mb-10 text-lg">
          AI-Powered DevOps Monitoring & Infrastructure Intelligence Platform
        </p>

        {/* DRAG & DROP */}

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer
          ${
            dragging
              ? "border-blue-400 bg-blue-500/20"
              : "border-gray-600 bg-white/5"
          }`}
        >

          <input
            type="file"
            id="fileUpload"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files[0])}
          />

          <label
            htmlFor="fileUpload"
            className="cursor-pointer"
          >

            <div className="text-5xl mb-4">
              📂
            </div>

            <p className="text-xl font-semibold">
              Drag & Drop Log Files Here
            </p>

            <p className="text-gray-400 mt-2">
              or click to browse files
            </p>

            {file && (
              <p className="mt-4 text-green-400 font-semibold">
                Selected File: {file.name}
              </p>
            )}

          </label>

        </div>

        {/* ANALYZE */}

        <div className="flex justify-center mt-6">

          <button
            onClick={handleUpload}
            className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 text-white px-8 py-3 rounded-xl font-semibold shadow-lg"
          >
            Analyze Logs
          </button>

        </div>

        {/* LOADING */}

        {loading && (

          <div className="mt-8 text-center">

            <p className="text-blue-400 text-lg animate-pulse">
              AI is analyzing infrastructure logs...
            </p>

          </div>
        )}

        {/* SOURCE */}

        {source && (

          <div className="mt-8 flex justify-center">

            <span className="bg-green-600 px-5 py-2 rounded-full text-sm font-semibold shadow-md">
              {source}
            </span>

          </div>
        )}

        {/* SEVERITY */}

        {analysis && (

          <div className="flex justify-center mt-6">

            <div
              className={`px-6 py-3 rounded-full text-lg font-bold shadow-xl
              ${
                severity === "HIGH"
                  ? "bg-red-600 text-white"
                  : severity === "MEDIUM"
                  ? "bg-yellow-500 text-black"
                  : "bg-green-600 text-white"
              }`}
            >

              Severity Level: {severity}

            </div>

          </div>
        )}

        {/* DASHBOARD */}

        {analysis && (

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-10">

            <div className="bg-red-500/20 border border-red-500 rounded-2xl p-5 text-center shadow-lg">

              <h2 className="text-3xl font-bold text-red-400">
                {stats.errors}
              </h2>

              <p className="text-gray-300 mt-2">
                Errors Detected
              </p>

            </div>

            <div className="bg-yellow-500/20 border border-yellow-500 rounded-2xl p-5 text-center shadow-lg">

              <h2 className="text-3xl font-bold text-yellow-300">
                {stats.risks}
              </h2>

              <p className="text-gray-300 mt-2">
                Security Risks
              </p>

            </div>

            <div className="bg-blue-500/20 border border-blue-500 rounded-2xl p-5 text-center shadow-lg">

              <h2 className="text-3xl font-bold text-blue-400">
                {stats.warnings}
              </h2>

              <p className="text-gray-300 mt-2">
                Warnings
              </p>

            </div>

            <div className="bg-green-500/20 border border-green-500 rounded-2xl p-5 text-center shadow-lg">

              <h2 className="text-3xl font-bold text-green-400">
                {stats.uptime}
              </h2>

              <p className="text-gray-300 mt-2">
                System Uptime
              </p>

            </div>

          </div>
        )}

        {/* CHARTS */}

        {analysis && (

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12">

            {/* BAR CHART */}

            <div className="bg-white/5 border border-gray-700 rounded-2xl p-6">

              <h2 className="text-2xl font-bold mb-5">
                Error Analytics
              </h2>

              <ResponsiveContainer width="100%" height={300}>

                <BarChart data={chartData}>

                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />

                  <Bar
                    dataKey="value"
                    fill="#3b82f6"
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

            {/* PIE CHART */}

            <div className="bg-white/5 border border-gray-700 rounded-2xl p-6">

              <h2 className="text-2xl font-bold mb-5">
                Infrastructure Risk Distribution
              </h2>

              <ResponsiveContainer width="100%" height={300}>

                <PieChart>

                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label
                  >

                    {chartData.map((entry, index) => (

                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />

                    ))}

                  </Pie>

                  <Tooltip />

                </PieChart>

              </ResponsiveContainer>

            </div>

          </div>
        )}

        {/* TERMINAL */}

        {analysis && (

          <div className="mt-10 bg-black/40 border border-gray-700 p-6 rounded-2xl whitespace-pre-wrap text-green-400 font-mono overflow-auto max-h-[500px] shadow-inner">

            <div className="flex items-center gap-2 mb-6">

              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>

              <span className="ml-4 text-gray-400 text-sm">
                AI Analysis Terminal
              </span>

            </div>

            {analysis}

          </div>
        )}

        {/* DOWNLOAD */}

        {analysis && (

          <div className="flex justify-center mt-6">

            <button
              onClick={downloadReport}
              className="bg-green-600 hover:bg-green-700 transition-all duration-300 px-6 py-3 rounded-xl font-semibold shadow-lg"
            >
              Download Report
            </button>

          </div>
        )}

        {/* FOOTER */}

        <div className="mt-10 text-center text-gray-400 text-sm">
          Built with React, Node.js, Express, Tailwind CSS, Recharts & AI Integration
        </div>

      </div>

    </div>
  );
}

export default App;