import React, { useState, useEffect, useCallback } from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";
import { API_BASE } from "../App";
import "./VisualizationTab.css";

const CURVE_COLORS = [
  "#f5a623",
  "#00d4aa",
  "#2a9fd6",
  "#e85555",
  "#3ddc84",
  "#8b7cf6",
  "#f5c842",
  "#ff7eb3",
];

const DEFAULT_CURVES = ["HC1", "HC2", "HC3", "TOTAL_GAS"];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="tooltip-depth">
        Depth: {Number(payload[0].payload.depth).toFixed(1)} ft
      </div>
      {payload.map((p, i) => (
        <div key={i} className="tooltip-row" style={{ color: p.color }}>
          <span>{p.dataKey}</span>
          <span>{p.value != null ? Number(p.value).toFixed(3) : "—"}</span>
        </div>
      ))}
    </div>
  );
}

export default function VisualizationTab({ well }) {
  const allCurves = (well?.curves || []).filter(
    (c) => c !== "Depth" && c !== "Time",
  );

  const [selectedCurves, setSelectedCurves] = useState(() => {
    return DEFAULT_CURVES.filter((c) => allCurves.includes(c)).slice(0, 4);
  });
  const [depthFrom, setDepthFrom] = useState(well?.start_depth || 8665);
  const [depthTo, setDepthTo] = useState(
    Math.min((well?.start_depth || 8665) + 500, well?.stop_depth || 20035),
  );
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [curveSearch, setCurveSearch] = useState("");
  const [downsample, setDownsample] = useState(2);

  const fetchData = useCallback(async () => {
    if (!selectedCurves.length) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        curves: selectedCurves.join(","),
        depth_from: depthFrom,
        depth_to: depthTo,
        downsample,
      });
      const res = await fetch(`${API_BASE}/wells/${well.id}/data?${params}`);

      if (!res.ok) throw new Error("Failed to fetch data");

      const data = await res.json();

      const flat = data.depths.map((d, i) => {
        const row = { depth: d };
        for (const c of selectedCurves) {
          if (data.curves[c]) row[c] = data.curves[c][i];
        }
        return row;
      });

      setChartData(flat);
      setStats(data.stats || {});
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [well.id, selectedCurves, depthFrom, depthTo, downsample]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleCurve = (c) => {
    setSelectedCurves((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  };

  const filteredCurves = allCurves.filter((c) =>
    c.toLowerCase().includes(curveSearch.toLowerCase()),
  );

  const colorFor = (curve) => {
    const idx = selectedCurves.indexOf(curve);
    return CURVE_COLORS[idx % CURVE_COLORS.length];
  };

  return (
    <div className="viz-layout">
      {/* Controls */}
      <div className="viz-controls">
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Depth Range</span>
          </div>
          <div className="panel-body">
            <div className="depth-inputs">
              <div className="input-wrap">
                <div className="input-mini-label">FROM (ft)</div>
                <input
                  type="number"
                  value={depthFrom}
                  min={well?.start_depth}
                  max={depthTo - 1}
                  onChange={(e) => setDepthFrom(Number(e.target.value))}
                />
              </div>
              <div className="input-wrap">
                <div className="input-mini-label">TO (ft)</div>
                <input
                  type="number"
                  value={depthTo}
                  min={depthFrom + 1}
                  max={well?.stop_depth}
                  onChange={(e) => setDepthTo(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="input-wrap mt-8">
              <div className="input-mini-label">
                Downsample (every Nth point)
              </div>
              <select
                value={downsample}
                onChange={(e) => setDownsample(Number(e.target.value))}
              >
                {[1, 2, 5, 10, 20].map((n) => (
                  <option key={n} value={n}>
                    {n}x {n === 1 ? "(all data)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Curves</span>
            <span className="panel-count">
              {selectedCurves.length} selected
            </span>
          </div>
          <div className="panel-body">
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
                  {selectedCurves.includes(c) && (
                    <span
                      className="curve-color-dot"
                      style={{ background: colorFor(c) }}
                    />
                  )}
                  <span className="curve-check-label">{c}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="viz-chart-area">
        <div className="chart-container">
          <div className="chart-header">
            <div className="chart-title">Well Log Curves vs Depth</div>
            <div className="chart-actions">
              {loading && <div className="loader"></div>}
              {chartData.length > 0 && (
                <span className="chart-data-count">
                  {chartData.length.toLocaleString()} pts
                </span>
              )}
              <button
                className="btn-secondary"
                onClick={fetchData}
                disabled={loading}
              >
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>⚠</span> {error}
            </div>
          )}

          {!loading && chartData.length === 0 && !error && (
            <div className="chart-empty">
              <span>■</span>
              <span>Select curves and click Refresh</span>
            </div>
          )}

          {chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={420}>
              <ComposedChart
                data={chartData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border-dim)"
                />
                <XAxis
                  dataKey="depth"
                  type="number"
                  domain={["auto", "auto"]}
                  tickFormatter={(v) => `${v.toFixed(0)}ft`}
                  tick={{ fontSize: 12, fill: "var(--text-muted)" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "var(--text-muted)" }}
                  width={80}
                  tickFormatter={(v) => {
                    if (v >= 1000000) return (v / 1000000).toFixed(1) + "M";
                    if (v >= 1000) return (v / 1000).toFixed(1) + "K";
                    return v.toFixed(1);
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Brush
                  dataKey="depth"
                  height={24}
                  stroke="var(--border-dim)"
                  fill="transparent"
                />
                {selectedCurves.map((c, i) => (
                  <Line
                    key={c}
                    dataKey={c}
                    type="monotone"
                    stroke={CURVE_COLORS[i % CURVE_COLORS.length]}
                    dot={false}
                    strokeWidth={1.5}
                    connectNulls={false}
                    isAnimationActive={false}
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Stats Grid */}
        {Object.keys(stats).length > 0 && (
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">
                Statistics – Depth {depthFrom}–{depthTo} ft
              </span>
            </div>
            <div className="panel-body">
              <div className="stats-grid">
                {Object.entries(stats).map(([curve, s], i) => (
                  <div key={curve} className="stat-card">
                    <div className="stat-card-name">
                      <span
                        className="curve-color-dot"
                        style={{
                          background:
                            CURVE_COLORS[
                              selectedCurves.indexOf(curve) %
                                CURVE_COLORS.length
                            ],
                        }}
                      />
                      {curve}
                    </div>
                    <div className="stat-card-vals">
                      {[
                        ["Min", s.min],
                        ["Max", s.max],
                        ["Mean", s.mean],
                        ["Std Dev", s.std],
                      ].map(([label, val]) => (
                        <div key={label} className="stat-val">
                          <div className="stat-val-label">{label}</div>
                          <div className="stat-val-num">
                            {typeof val === "number"
                              ? val.toLocaleString(undefined, {
                                  maximumFractionDigits: 3,
                                })
                              : val}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
