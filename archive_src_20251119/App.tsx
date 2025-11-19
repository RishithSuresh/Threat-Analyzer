import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import TransactionMonitoring from './pages/TransactionMonitoring';
import NetworkVisualization from './pages/NetworkVisualization';
import RiskProfiling from './pages/RiskProfiling';
import PatternAnalysis from './pages/PatternAnalysis';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<TransactionMonitoring />} />
            <Route path="/network" element={<NetworkVisualization />} />
            <Route path="/risk-profiling" element={<RiskProfiling />} />
            <Route path="/pattern-analysis" element={<PatternAnalysis />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
