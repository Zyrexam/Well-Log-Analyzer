import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../App";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "./UploadPage.css";

export default function UploadPage({
  onWellUploaded,
  wells,
  selectedWell,
  onSelectWell,
  sidebarOpen,
  setSidebarOpen,
}) {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFile = async (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".las")) {
      setError("Only .las files are accepted");
      return;
    }

    setError(null);
    setResult(null);
    setUploading(true);
    setProgress(10);
    setProgressLabel("Uploading file...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setProgress(30);
      setProgressLabel("Parsing LAS file...");

      const res = await fetch(`${API_BASE}/wells/upload`, {
        method: "POST",
        body: formData,
      });

      setProgress(70);
      setProgressLabel("Storing data...");

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Upload failed");
      }

      const data = await res.json();
      setProgress(100);
      setProgressLabel("Complete!");
      setResult(data);

      // Auto-redirect to dashboard after 1.2 seconds
      setTimeout(() => {
        onWellUploaded(data);
        navigate("/dashboard");
      }, 1200);
    } catch (e) {
      setError(e.message);
      setUploading(false);
      setProgress(0);
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, []);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragging(false), []);

  const onFileInput = (e) => {
    const file = e.target.files[0];
    handleFile(file);
    e.target.value = "";
  };

  return (
    <div className="app">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="app-body">
        <Sidebar
          wells={wells}
          selectedWell={selectedWell}
          onSelectWell={onSelectWell}
          sidebarOpen={sidebarOpen}
          activePage="upload"
          navigate={navigate}
        />

        <main className="main-content">
          <div className="upload-page">
            {/* Hero Section */}
            <div className="upload-hero">
              <h1>
                Upload <span>Well Data</span>
              </h1>
              <p>IMPORT YOUR LAS FILE TO BEGIN ANALYSIS</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="alert alert-error">
                <span>⚠</span> {error}
              </div>
            )}

            {/* Upload Zone or Progress */}
            {!uploading && !result && (
              <label
                className={`dropzone ${isDragging ? "active" : ""}`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
              >
                <input
                  type="file"
                  accept=".las"
                  onChange={onFileInput}
                  style={{ display: "none" }}
                />
                <span className="dropzone-icon">⬇</span>
                <div className="dropzone-text">Drop your LAS file here</div>
                <div className="dropzone-sub">
                  or click to browse – .las files only
                </div>
              </label>
            )}

            {uploading && (
              <div className="panel">
                <div className="panel-body">
                  <div className="upload-progress">
                    <div className="progress-label">{progressLabel}</div>
                    <div className="progress-bar-wrap">
                      <div
                        className="progress-bar"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="progress-percent">{progress}%</div>
                  </div>
                </div>
              </div>
            )}

            {result && (
              <div className="result-card">
                <div className="result-title">
                  <span>✓</span> Well Uploaded Successfully
                </div>
                <div className="result-grid">
                  <div className="result-item">
                    <div className="result-item-label">Well Name</div>
                    <div className="result-item-value">{result.well_name}</div>
                  </div>
                  <div className="result-item">
                    <div className="result-item-label">File</div>
                    <div className="result-item-value">{result.filename}</div>
                  </div>
                  <div className="result-item">
                    <div className="result-item-label">Depth Range</div>
                    <div className="result-item-value">
                      {result.depth_range?.start} – {result.depth_range?.stop}{" "}
                      ft
                    </div>
                  </div>
                  <div className="result-item">
                    <div className="result-item-label">Data Points</div>
                    <div className="result-item-value">
                      {result.row_count?.toLocaleString()}
                    </div>
                  </div>
                  <div className="result-item">
                    <div className="result-item-label">Curves</div>
                    <div className="result-item-value">
                      {result.curves?.length}
                    </div>
                  </div>
                  <div className="result-item">
                    <div className="result-item-label">S3 Storage</div>
                    <div
                      className="result-item-value"
                      style={{
                        color: result.s3_stored
                          ? "var(--accent-green)"
                          : "var(--accent-red)",
                      }}
                    >
                      {result.s3_stored ? "✓ Stored" : "✗ Local only"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* How It Works */}
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">How It Works</span>
              </div>
              <div className="panel-body how-it-works">
                {[
                  {
                    num: "1",
                    title: "Upload",
                    desc: "Drop your LAS 2.0 file. Raw file stored in Amazon S3.",
                  },
                  {
                    num: "2",
                    title: "Parse",
                    desc: "All depth-indexed curves extracted and stored in the database.",
                  },
                  {
                    num: "3",
                    title: "Visualize",
                    desc: "Plot any combination of curves against depth with zoom/pan.",
                  },
                  {
                    num: "4",
                    title: "Interpret",
                    desc: "Select a depth range and let AI analyze the data for you.",
                  },
                ].map(({ num, title, desc }) => (
                  <div key={num} className="how-item">
                    <div className="how-number">{num}</div>
                    <div className="how-content">
                      <div className="how-title">{title}</div>
                      <div className="how-desc">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
