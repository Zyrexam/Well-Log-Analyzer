import React from 'react'
import { API_BASE } from '../App'
import './WellInfoTab.css'

export default function WellInfoTab({ well, onRefresh }) {
  if (!well) return null

  const handleDelete = async () => {
    if (!window.confirm(`Delete well "${well.well_name}"? This cannot be undone.`)) return

    try {
      const res = await fetch(`${API_BASE}/wells/${well.id}`, { method: 'DELETE' })
      if (res.ok) {
        onRefresh?.()
        window.location.reload()
      }
    } catch (e) {
      alert('Delete failed: ' + e.message)
    }
  }

  const infoItems = [
    ['Well Name', well.well_name],
    ['Filename', well.filename],
    ['Company', well.company || '–'],
    ['Field', well.field || '–'],
    ['Location', well.location || '–'],
    ['Country', well.country || '–'],
    ['Date Analysed', well.date_analysed || '–'],
    ['Start Depth', well.start_depth != null ? `${well.start_depth} ft` : '–'],
    ['Stop Depth', well.stop_depth != null ? `${well.stop_depth} ft` : '–'],
    ['Step', well.step != null ? `${well.step} ft` : '–'],
    ['Total Depth Points', well.start_depth != null && well.stop_depth != null && well.step
      ? Math.floor((well.stop_depth - well.start_depth) / well.step + 1).toLocaleString()
      : '–'],
    ['Null Value', well.null_value != null ? well.null_value : '–'],
    ['S3 Key', well.s3_key || 'Not stored in S3'],
    ['Uploaded', well.uploaded_at ? new Date(well.uploaded_at).toLocaleString() : '–'],
  ]

  const curves = well.curves || []

  return (
    <div className="well-info">
      {/* Metadata Panel */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">
            Well Metadata – <span className="panel-title-accent">{well.well_name}</span>
          </span>
        </div>
        <div className="panel-body">
          <div className="info-grid">
            {infoItems.map(([label, value]) => (
              <div key={label} className="info-item">
                <div className="info-item-label">{label}</div>
                <div className="info-item-value" title={value}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Curves Panel */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">
            Available Curves – <span className="panel-title-accent">{curves.length} total</span>
          </span>
        </div>
        <div className="panel-body">
          <div className="curves-desc">
            This well contains {curves.length} measurement channels indexed by depth.
          </div>
          <div className="curves-list">
            {curves.map(c => (
              <span key={c} className="curve-tag">{c}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="panel danger-panel">
        <div className="panel-header">
          <span className="panel-title danger-title">Danger Zone</span>
        </div>
        <div className="panel-body danger-body">
          <div>
            <div className="danger-title-text">Delete Well</div>
            <div className="danger-desc">
              Permanently removes all log data, interpretations, and chat history for this well.
            </div>
          </div>
          <button className="btn-danger" onClick={handleDelete}>
            Delete Well
          </button>
        </div>
      </div>
    </div>
  )
}