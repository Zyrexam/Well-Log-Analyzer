import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <div className="home-logo">
          <span className="logo-icon">⬢</span>
          <div className="logo-text">
            <div className="logo-main">WELL ANALYZER</div>
            <div className="logo-sub">Engineering Grade LAS Platform</div>
          </div>
        </div>
        <div className="status">
          <span className="status-dot"></span>
          System Online
        </div>
      </header>

      {/* Main Content */}
      <main className="home-main">
        <section className="hero">
          <h1>LAS Well Log Analyzer</h1>
          <p className="hero-subtitle">
            Upload and analyze gas chromatography well log data
          </p>
          <button
            className="btn-primary btn-large cta-btn"
            onClick={() => navigate("/upload")}
          >
            Get Started
          </button>
        </section>

        <section className="features-minimal">
          <h2 className="section-title">What You Can Do</h2>

          <div className="features-simple-grid">
            <div className="feature-item">
              <h3>📁 Upload LAS Files</h3>
              <ul>
                <li>Support for gas chromatography data</li>
                <li>Up to 20 MB file size</li>
                <li>106 curves, 11,000+ data points</li>
              </ul>
            </div>

            <div className="feature-item">
              <h3>📊 Visualize Data</h3>
              <ul>
                <li>Interactive charts for all 106 curves</li>
                <li>Hydrocarbons (HC1-HC10) & Aromatics</li>
                <li>Depth-based zooming and filtering</li>
              </ul>
            </div>

            <div className="feature-item">
              <h3>📈 Analyze Results</h3>
              <ul>
                <li>Automatic statistics (Min, Max, Mean, Std)</li>
                <li>AI-powered formation interpretation</li>
                <li>Instant tabular data views</li>
              </ul>
            </div>

            <div className="feature-item">
              <h3>💾 Manage & Storage</h3>
              <ul>
                <li>Secure local + S3 cloud storage</li>
                <li>Multi-well management dashboard</li>
                <li>Delete or rename logs as needed</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="supported-summary">
          <h3>Supported Data Blocks</h3>
          <p>
            Full support for LAS 2.0 format including Hydrocarbon components
            (C1-C10), Total Gas, Aromatic compounds, CO2, and diagnostic geochem
            ratios.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-text">
          <span>LAS File Analyzer</span>
          <span>Mohit Kumar</span>
        </div>
      </footer>
    </div>
  );
}
