import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../App";
import Header from "../components/Header.jsx";
import Sidebar from "../components/Sidebar.jsx";
import VisualizationTab from "../components/VisualizationTab.jsx";
import InterpretationTab from "../components/InterpretationTab.jsx";
import ChatbotTab from "../components/ChatbotTab.jsx";
import WellInfoTab from "../components/WellInfoTab.jsx";
import "./DashboardPage.css";

export default function DashboardPage({
  well,
  wells,
  onRefresh,
  onSelectWell,
  sidebarOpen,
  setSidebarOpen,
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("viz");
  const [wellDetail, setWellDetail] = useState(well);

  useEffect(() => {
    if (!well) {
      navigate("/upload");
      return;
    }

    const fetchDetail = async () => {
      try {
        const res = await fetch(`${API_BASE}/wells/${well.id}`);
        if (res.ok) {
          setWellDetail(await res.json());
        }
      } catch (e) {
        console.error("Failed to fetch well details:", e);
      }
    };

    fetchDetail();
  }, [well?.id, navigate]);

  if (!well) {
    return (
      <div className="app">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="app-body">
          <Sidebar
            wells={wells}
            selectedWell={null}
            onSelectWell={onSelectWell}
            sidebarOpen={sidebarOpen}
            activePage="dashboard"
            navigate={navigate}
          />
          <main className="main-content">
            <div className="empty-state">
              <div className="empty-icon">■</div>
              <h2>No Well Selected</h2>
              <p>Upload a LAS file or select a well from the sidebar</p>
              <button
                className="btn-primary"
                onClick={() => navigate("/upload")}
              >
                Upload LAS File
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "viz", label: "Visualize", icon: "■" },
    { id: "ai", label: "AI Interpret", icon: "✦" },
    { id: "chat", label: "GeoBot", icon: "◉", badge: "AI" },
    { id: "info", label: "Well Info", icon: "⊞" },
  ];

  return (
    <div className="app">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="app-body">
        <Sidebar
          wells={wells}
          selectedWell={well}
          onSelectWell={onSelectWell}
          sidebarOpen={sidebarOpen}
          activePage="dashboard"
          navigate={navigate}
        />

        <main className="main-content">
          <div className="dashboard-page">
            {/* Tabs */}
            <div className="dashboard-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <span className="tab-label">{tab.label}</span>
                  {tab.badge && <span className="tab-badge">{tab.badge}</span>}
                </button>
              ))}
              <div style={{ flex: 1 }}></div>
              <div className="tab-info">
                <span style={{ color: "var(--accent-amber)" }}>■</span>
                {wellDetail?.well_name || well?.well_name}
              </div>
            </div>

            {/* Tab Content */}
            <div className="dashboard-content">
              {activeTab === "viz" && (
                <VisualizationTab well={wellDetail || well} />
              )}
              {activeTab === "ai" && (
                <InterpretationTab well={wellDetail || well} />
              )}
              {activeTab === "chat" && <ChatbotTab well={wellDetail || well} />}
              {activeTab === "info" && (
                <WellInfoTab well={wellDetail || well} onRefresh={onRefresh} />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
