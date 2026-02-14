import React from "react";

export default function Header({ sidebarOpen, setSidebarOpen }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className="logo">
          <img src="/logo.svg" alt="OneGeo Logo" className="logo-img" />
          <span className="logo-text">
            ONE<span className="logo-accent">GEO</span>
          </span>
        </div>
        <div className="header-subtitle">Well Log Analysis Platform</div>
      </div>
      <div className="header-right">
        <div className="status-indicator">
          <span className="status-dot"></span>
          <span>System Online</span>
        </div>
      </div>
    </header>
  );
}
