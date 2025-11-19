import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { AlertCircle, TrendingDown, Clock, Target } from 'lucide-react';
import './PatternAnalysis.css';

interface DetectedPattern {
  id: string;
  name: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  accounts_involved: number;
  description: string;
  first_detected: string;
  transactions_count: number;
}

const PatternAnalysis = () => {
  const [patterns] = useState<DetectedPattern[]>([
    {
      id: 'PAT-001',
      name: 'Structured Transaction Pattern',
      type: 'Structuring',
      severity: 'critical',
      confidence: 94,
      accounts_involved: 3,
      description:
        'Multiple transactions just below reporting threshold to avoid detection',
      first_detected: '2025-01-05',
      transactions_count: 47,
    },
    {
      id: 'PAT-002',
      name: 'Round-Tripping Scheme',
      type: 'Layering',
      severity: 'high',
      confidence: 87,
      accounts_involved: 5,
      description: 'Funds sent out and returned through shell companies',
      first_detected: '2025-01-02',
      transactions_count: 28,
    },
    {
      id: 'PAT-003',
      name: 'Multi-Jurisdiction Layering',
      type: 'Geographic Dispersion',
      severity: 'high',
      confidence: 85,
      accounts_involved: 8,
      description:
        'Rapid transfers across multiple countries to obscure fund trail',
      first_detected: '2025-01-03',
      transactions_count: 52,
    },
    {
      id: 'PAT-004',
      name: 'Rapid Velocity Transfers',
      type: 'Velocity Pattern',
      severity: 'medium',
      confidence: 76,
      accounts_involved: 2,
      description: 'High-frequency transfers within short time periods',
      first_detected: '2025-01-06',
      transactions_count: 34,
    },
    {
      id: 'PAT-005',
      name: 'Trade-Based Layering',
      type: 'Trade Finance',
      severity: 'high',
      confidence: 82,
      accounts_involved: 4,
      description:
        'Over/under-invoicing of goods to move illicit funds internationally',
      first_detected: '2025-01-04',
      transactions_count: 19,
    },
  ]);

  const [timeSeriesData] = useState([
    { date: '2025-01-01', patterns: 2, risk_score: 35 },
    { date: '2025-01-02', patterns: 3, risk_score: 48 },
    { date: '2025-01-03', patterns: 5, risk_score: 62 },
    { date: '2025-01-04', patterns: 6, risk_score: 75 },
    { date: '2025-01-05', patterns: 8, risk_score: 88 },
    { date: '2025-01-06', patterns: 9, risk_score: 92 },
    { date: '2025-01-07', patterns: 5, risk_score: 78 },
  ]);

  const [correlationData] = useState([
    { x: 50000, y: 45, pattern: 'Structuring' },
    { x: 75000, y: 62, pattern: 'Round-Tripping' },
    { x: 125000, y: 82, pattern: 'Multi-Jurisdiction' },
    { x: 200000, y: 88, pattern: 'Trade-Based' },
    { x: 45000, y: 52, pattern: 'Velocity' },
    { x: 95000, y: 71, pattern: 'Structuring' },
    { x: 180000, y: 85, pattern: 'Round-Tripping' },
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#ff3333';
      case 'high':
        return '#ff6b6b';
      case 'medium':
        return '#ffa500';
      default:
        return '#4ade80';
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    return `severity-badge severity-${severity}`;
  };

  return (
    <div className="pattern-analysis">
      <header className="page-header">
        <h1>Pattern Analysis & Behavioral Detection</h1>
        <p>Identification of money laundering patterns and suspicious behavioral indicators</p>
      </header>

      {/* Overview Cards */}
      <div className="overview-cards">
        <div className="overview-card">
          <AlertCircle size={28} />
          <div className="card-content">
            <span className="card-label">Active Patterns</span>
            <span className="card-value">{patterns.length}</span>
          </div>
        </div>
        <div className="overview-card">
          <TrendingDown size={28} />
          <div className="card-content">
            <span className="card-label">Total Accounts</span>
            <span className="card-value">22</span>
          </div>
        </div>
        <div className="overview-card">
          <Clock size={28} />
          <div className="card-content">
            <span className="card-label">Avg Detection Time</span>
            <span className="card-value">2.3 days</span>
          </div>
        </div>
        <div className="overview-card">
          <Target size={28} />
          <div className="card-content">
            <span className="card-label">Detection Accuracy</span>
            <span className="card-value">89%</span>
          </div>
        </div>
      </div>

      {/* Time Series Charts */}
      <div className="charts-section">
        <div className="chart-container">
          <h2>Pattern Detection Timeline</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeSeriesData}>
              <defs>
                <linearGradient id="colorPatterns" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
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
              <Area
                type="monotone"
                dataKey="patterns"
                stroke="#00d4ff"
                fillOpacity={1}
                fill="url(#colorPatterns)"
                name="Patterns Detected"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h2>Risk Evolution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
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
                dataKey="risk_score"
                stroke="#ff6b6b"
                strokeWidth={2}
                dot={{ fill: '#ff6b6b' }}
                name="Overall Risk Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scatter Plot - Transaction Amount vs Risk */}
      <div className="chart-container full-width">
        <h2>Transaction Amount vs Risk Score Correlation</h2>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="x" name="Transaction Amount ($)" stroke="rgba(255,255,255,0.6)" />
            <YAxis dataKey="y" name="Risk Score" stroke="rgba(255,255,255,0.6)" />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: '#1a2332',
                border: '1px solid #00d4ff',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Scatter name="Detected Patterns" data={correlationData} fill="#00d4ff" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Detected Patterns Table */}
      <div className="patterns-section">
        <h2>Detected Patterns</h2>
        <div className="patterns-table-wrapper">
          <table className="patterns-table">
            <thead>
              <tr>
                <th>Pattern ID</th>
                <th>Pattern Name</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Confidence</th>
                <th>Accounts</th>
                <th>Transactions</th>
                <th>First Detected</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {patterns.map((pattern) => (
                <tr key={pattern.id} className={`pattern-row pattern-${pattern.severity}`}>
                  <td className="pattern-id">{pattern.id}</td>
                  <td className="pattern-name">{pattern.name}</td>
                  <td>{pattern.type}</td>
                  <td>
                    <span className={getSeverityBadgeClass(pattern.severity)}>
                      {pattern.severity.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="confidence-bar">
                      <div
                        className="confidence-fill"
                        style={{
                          width: `${pattern.confidence}%`,
                          backgroundColor: getSeverityColor(pattern.severity),
                        }}
                      />
                      <span className="confidence-text">{pattern.confidence}%</span>
                    </div>
                  </td>
                  <td>{pattern.accounts_involved}</td>
                  <td className="transaction-count">{pattern.transactions_count}</td>
                  <td>{pattern.first_detected}</td>
                  <td>
                    <button className="btn-investigate">Investigate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pattern Characteristics */}
      <div className="characteristics-section">
        <h2>Money Laundering Pattern Characteristics</h2>
        <div className="characteristics-grid">
          <div className="characteristic">
            <h3>Structuring (Smurfing)</h3>
            <ul>
              <li>Multiple small transactions below reporting threshold</li>
              <li>Sequential timing patterns</li>
              <li>Multiple accounts/individuals used</li>
              <li>Consistent deposit amounts</li>
            </ul>
          </div>
          <div className="characteristic">
            <h3>Round-Tripping</h3>
            <ul>
              <li>Money sent out through intermediaries</li>
              <li>Returns as legitimate income</li>
              <li>Creates false transaction history</li>
              <li>Use of offshore companies</li>
            </ul>
          </div>
          <div className="characteristic">
            <h3>Trade-Based Layering</h3>
            <ul>
              <li>Over/under-invoicing of goods</li>
              <li>Misalignment of goods and payments</li>
              <li>International trade manipulation</li>
              <li>Complex supply chain involvement</li>
            </ul>
          </div>
          <div className="characteristic">
            <h3>Geographic Layering</h3>
            <ul>
              <li>Rapid cross-border transfers</li>
              <li>Multiple jurisdiction involvement</li>
              <li>High-risk country activity</li>
              <li>Sudden geographic shifts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatternAnalysis;
