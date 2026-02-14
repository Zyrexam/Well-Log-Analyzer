import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import UploadPage from "./pages/UploadPage";
import DashboardPage from "./pages/DashboardPage";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const [wells, setWells] = useState([]);
  const [selectedWell, setSelectedWell] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch all wells on mount
  useEffect(() => {
    fetchWells();
  }, []);

  const fetchWells = async () => {
    try {
      const res = await fetch(`${API_BASE}/wells`);
      const data = await res.json();
      setWells(data.wells || []);
    } catch (error) {
      console.error("Failed to fetch wells:", error);
    }
  };

  const handleWellUploaded = (newWell) => {
    setSelectedWell(newWell);
    fetchWells();
  };

  const handleSelectWell = (well) => {
    setSelectedWell(well);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/upload"
          element={
            <UploadPage
              onWellUploaded={handleWellUploaded}
              wells={wells}
              selectedWell={selectedWell}
              onSelectWell={handleSelectWell}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />
          }
        />
        <Route
          path="/dashboard"
          element={
            <DashboardPage
              well={selectedWell}
              wells={wells}
              onRefresh={fetchWells}
              onSelectWell={handleSelectWell}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export { API_BASE };
