import React from 'react'
import { useNavigate } from 'react-router-dom'
import './HomePage.css'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <div className="home-logo">
          <span className="logo-icon">⬡</span>
          <div className="logo-text">
            <div className="logo-main">ONEGEO</div>
            <div className="logo-sub">Well Log Analysis Platform</div>
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
          <h1>LAS File Analyzer</h1>
          <p>Professional subsurface well-log analysis </p>
          <button 
            className="btn-primary btn-large"
            onClick={() => navigate('/upload')}
          >
            Get Started
          </button>
        </section>

        <section className="features">
          <h2>How It Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-number">1</div>
              <h3>Upload</h3>
              <p>Drop your LAS 2.0 file. Raw file stored securely in Amazon S3.</p>
            </div>
            <div className="feature-card">
              <div className="feature-number">2</div>
              <h3>Parse</h3>
              <p>All depth-indexed curves extracted and stored in the database.</p>
            </div>
            <div className="feature-card">
              <div className="feature-number">3</div>
              <h3>Visualize</h3>
              <p>Plot any combination of curves against depth with zoom/pan.</p>
            </div>
            <div className="feature-card">
              <div className="feature-number">4</div>
              <h3>Interpret</h3>
              <p>Select a depth range and let AI analyze the data for you.</p>
            </div>
          </div>
        </section>

        <section className="cta">
          <h2>Ready to analyze your well data?</h2>
          <button 
            className="btn-primary btn-large"
            onClick={() => navigate('/upload')}
          >
            Upload LAS File
          </button>
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
  )
}