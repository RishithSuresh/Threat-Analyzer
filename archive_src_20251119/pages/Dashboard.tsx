import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, TrendingUp, Users, DollarSign } from 'lucide-react';
import StatCard from '../components/StatCard';
import AlertsPanel from '../components/AlertsPanel';
import './Dashboard.css';

const Dashboard = () => {
  const [transactionData, setTransactionData] = useState([
    { date: '2025-01-01', value: 45000, risk: 12 },
    { date: '2025-01-02', value: 52000, risk: 15 },
    { date: '2025-01-03', value: 48000, risk: 8 },
    { date: '2025-01-04', value: 61000, risk: 22 },
    { date: '2025-01-05', value: 55000, risk: 18 },
    { date: '2025-01-06', value: 71000, risk: 31 },
    { date: '2025-01-07', value: 63000, risk: 25 },
  ]);

  const [riskMetrics] = useState({
    totalAlerts: 24,
    highRiskAccounts: 8,
    flaggedTransactions: 156,
    monitoredAccounts: 342,
  });

  const [alerts] = useState([
    {
      id: 1,
      severity: 'high',
      account: 'ACC-2024-001',
      message: 'Rapid fund transfer detected across 5 jurisdictions',
      timestamp: new Date().toISOString(),
      amount: '$125,000',
    },
    {
      id: 2,
      severity: 'medium',
      account: 'ACC-2024-015',
      message: 'Multiple small transactions below reporting threshold',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      amount: '$89,500',
    },
    {
      id: 3,
      severity: 'high',
      account: 'ACC-2024-042',
      message: 'Shell company payment detected with layering pattern',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      amount: '$245,000',
    },
  ]);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Threat Analyzer Dashboard</h1>
        <p>Real-time Money Laundering Detection & Risk Assessment</p>
      </header>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <StatCard
          icon={AlertCircle}
          label="Active Alerts"
          value={riskMetrics.totalAlerts}
          color="red"
          trend="+12%"
        />
        <StatCard
          icon={Users}
          label="High-Risk Accounts"
          value={riskMetrics.highRiskAccounts}
          color="orange"
          trend="+3%"
        />
        <StatCard
          icon={DollarSign}
          label="Flagged Transactions"
          value={riskMetrics.flaggedTransactions}
          color="purple"
          trend="+24%"
        />
        <StatCard
          icon={TrendingUp}
          label="Monitored Accounts"
          value={riskMetrics.monitoredAccounts}
          color="blue"
          trend="+8%"
        />
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h2>Transaction Volume & Risk Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={transactionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a2332',
                  border: '1px solid #00d4ff',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#00d4ff"
                strokeWidth={2}
                dot={{ fill: '#00d4ff' }}
                name="Transaction Volume ($)"
              />
              <Line
                type="monotone"
                dataKey="risk"
                stroke="#ff6b6b"
                strokeWidth={2}
                dot={{ fill: '#ff6b6b' }}
                name="Risk Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h2>Risk Distribution by Account Type</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { type: 'Personal', high: 5, medium: 12, low: 35 },
                { type: 'Corporate', high: 2, medium: 8, low: 24 },
                { type: 'Shell Co.', high: 1, medium: 3, low: 8 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="type" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a2332',
                  border: '1px solid #00d4ff',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="high" stackId="a" fill="#ff6b6b" name="High Risk" />
              <Bar dataKey="medium" stackId="a" fill="#ffa500" name="Medium Risk" />
              <Bar dataKey="low" stackId="a" fill="#4ade80" name="Low Risk" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alerts Panel */}
      <AlertsPanel alerts={alerts} />
    </div>
  );
};

export default Dashboard;
