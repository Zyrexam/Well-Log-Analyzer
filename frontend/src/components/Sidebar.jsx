import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Sidebar({ 
  wells, 
  selectedWell, 
  onSelectWell,
  sidebarOpen,
  activePage,
  navigate 
}) {
  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <nav className="sidebar-nav">
        {/* Upload Button */}
        <button
          className={`nav-item ${activePage === 'upload' ? 'active' : ''}`}
          onClick={() => navigate('/upload')}
        >
          <span className="nav-icon">⬆</span>
          <span className="nav-label">Upload LAS</span>
        </button>

        {/* Wells List */}
        {wells.length > 0 && (
          <div className="nav-section">
            <div className="nav-section-label">Wells ({wells.length})</div>
            {wells.map(well => (
              <button
                key={well.id}
                className={`nav-item nav-well ${
                  selectedWell?.id === well.id && activePage === 'dashboard' ? 'active' : ''
                }`}
                onClick={() => {
                  onSelectWell(well)
                  navigate('/dashboard')
                }}
                title={well.well_name}
              >
                <span className="nav-icon">■</span>
                <span className="nav-label">{well.well_name || well.filename}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-text">Mohit Kumar</div>
        <div className="sidebar-footer-sub">LAS File Analyzer</div>
      </div>
    </aside>
  )
}