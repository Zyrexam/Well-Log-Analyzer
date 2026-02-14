import React, { useState, useEffect } from "react";
import { API_BASE } from "../App";
import "./InterpretationTab.css";

const DEFAULT_CURVES = ["HC1", "HC2", "HC3", "TOTAL_GAS"];

function MarkdownRenderer({ text }) {
  const html = text
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[hul])(.+)$/gm, "<p>$1</p>");

  return (
    <div
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function InterpretationTab({ well }) {
  const allCurves = (well?.curves || []).filter(
    (c) => c !== "Depth" && c !== "Time",
  );

  const [depthFrom, setDepthFrom] = useState(well?.start_depth || 8665);
  const [depthTo, setDepthTo] = useState(
    Math.min((well?.start_depth || 8665) + 500, well?.stop_depth || 20035),
  );
  const [selectedCurves, setSelectedCurves] = useState(
    DEFAULT_CURVES.filter((c) => allCurves.includes(c)),
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [pastInterps, setPastInterps] = useState([]);
  const [viewingPast, setViewingPast] = useState(null);
  const [curveSearch, setCurveSearch] = useState("");

  useEffect(() => {
    const fetchPast = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/interpret/wells/${well.id}/interpretations`,
        );
        if (res.ok) {
          const data = await res.json();
          setPastInterps(data.interpretations || []);
        }
      } catch (e) {}
    };
    fetchPast();
  }, [well.id, result]);

  const handleInterpret = async () => {
    if (!selectedCurves.length) {
      setError("Select at least one curve");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setViewingPast(null);

    try {
      const res = await fetch(`${API_BASE}/interpret`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          well_id: well.id,
          depth_from: depthFrom,
          depth_to: depthTo,
          curves: selectedCurves,
        }),
      });

      if (!res.ok) throw new Error("Interpretation failed");

      setResult(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleCurve = (c) => {
    setSelectedCurves((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  };

  const displayResult = viewingPast || result;
  const filteredCurves = allCurves.filter((c) =>
    c.toLowerCase().includes(curveSearch.toLowerCase()),
  );

  return (
    <div className="interp-layout">
      {/* Controls */}
      <div className="interp-controls">
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Analysis Range</span>
          </div>
          <div className="panel-body">
            <div className="depth-inputs">
              <div className="input-wrap">
                <div className="input-mini-label">From (ft)</div>
                <input
                  type="number"
                  value={depthFrom}
                  onChange={(e) => setDepthFrom(Number(e.target.value))}
                />
              </div>
              <div className="input-wrap">
                <div className="input-mini-label">To (ft)</div>
                <input
                  type="number"
                  value={depthTo}
                  onChange={(e) => setDepthTo(Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <div className="control-label">
                Curves to analyze ({selectedCurves.length})
              </div>
              <input
                type="text"
                placeholder="Search curves..."
                value={curveSearch}
                onChange={(e) => setCurveSearch(e.target.value)}
                className="curve-search"
              />
              <div className="curve-picker">
                {filteredCurves.map((c) => (
                  <label key={c} className="curve-check">
                    <input
                      type="checkbox"
                      checked={selectedCurves.includes(c)}
                      onChange={() => toggleCurve(c)}
                    />
                    <span className="curve-check-label">{c}</span>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="alert alert-error">
                <span>⚠</span> {error}
              </div>
            )}

            <button
              className="btn-primary w-full"
              onClick={handleInterpret}
              disabled={loading}
            >
              {loading ? "Analyzing..." : "✦ Interpret with AI"}
            </button>
          </div>
        </div>

        {/* Past Interpretations */}
        {pastInterps.length > 0 && (
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">History</span>
              <span className="panel-count">{pastInterps.length} runs</span>
            </div>
            <div className="panel-body">
              <div className="past-interp">
                {pastInterps.slice(0, 5).map((interp) => (
                  <div
                    key={interp.id}
                    className="past-interp-item"
                    onClick={() => {
                      setViewingPast(interp);
                      setResult(null);
                    }}
                  >
                    <div className="past-interp-meta">
                      <span>
                        {interp.depth_from}–{interp.depth_to} ft
                      </span>
                      <span>{interp.curves?.length} curves</span>
                      <span>
                        {new Date(interp.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="past-interp-preview">
                      {interp.interpretation?.slice(0, 120)}...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Result Panel */}
      <div className="interp-result-area">
        {loading && (
          <div className="interp-result">
            <div className="thinking-indicator">
              <div className="thinking-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div>AI is analyzing your well data...</div>
            </div>
          </div>
        )}

        {!loading && displayResult && (
          <div className="interp-result">
            <div className="interp-result-header">
              <div>
                <div className="interp-result-title">AI Interpretation</div>
                <div className="interp-result-meta">
                  Depth {displayResult.depth_from}–{displayResult.depth_to} ft ·{" "}
                  {(displayResult.curves || []).join(", ")}
                </div>
              </div>
              <span className="interp-result-badge">
                {displayResult.model || "AI"}
              </span>
            </div>

            {displayResult.stats &&
              Object.keys(displayResult.stats).length > 0 && (
                <div className="stats-summary">
                  {Object.entries(displayResult.stats)
                    .slice(0, 4)
                    .map(([c, s]) => (
                      <div key={c} className="stat-summary-item">
                        <span className="stat-summary-curve">{c}</span>
                        <span className="stat-summary-val">avg {s.mean}</span>
                      </div>
                    ))}
                </div>
              )}

            <MarkdownRenderer text={displayResult.interpretation} />
          </div>
        )}

        {!loading && !displayResult && (
          <div className="interp-empty">
            <span>✦</span>
            <div className="interp-empty-title">AI Well Log Interpreter</div>
            <div className="interp-empty-sub">
              Select a depth range and curves, then click Interpret with AI to
              get geological insights
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
