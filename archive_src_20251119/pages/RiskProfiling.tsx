import React, { useState } from 'react';
import { User, Zap, TrendingUp, Shield } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './RiskProfiling.css';

interface CustomerProfile {
  id: string;
  name: string;
  risk_score: number;
  risk_category: 'low' | 'medium' | 'high';
  account_age: number;
  transaction_count: number;
  total_volume: number;
  geographic_risk: string;
  industry: string;
  red_flags: string[];
}

const RiskProfiling = () => {
  const [profiles] = useState<CustomerProfile[]>([
    {
      id: 'CUST-001',
      name: 'John Doe',
      risk_score: 92,
      risk_category: 'high',
      account_age: 3,
      transaction_count: 156,
      total_volume: 5200000,
      geographic_risk: 'High - Multiple Jurisdictions',
      industry: 'Import/Export',
      red_flags: [
        'Rapid fund transfers',
        'Structuring activity',
        'Shell company involvement',
        'Unusual patterns',
      ],
    },
    {
      id: 'CUST-002',
      name: 'Jane Smith',
      risk_score: 65,
      risk_category: 'medium',
      account_age: 5,
      transaction_count: 89,
      total_volume: 1800000,
      geographic_risk: 'Medium - Limited Jurisdictions',
      industry: 'Retail',
      red_flags: [
        'Occasional large transfers',
        'Geographic anomalies',
      ],
    },
    {
      id: 'CUST-003',
      name: 'Tech Corp Ltd',
      risk_score: 35,
      risk_category: 'low',
      account_age: 12,
      transaction_count: 245,
      total_volume: 8500000,
      geographic_risk: 'Low - Single Jurisdiction',
      industry: 'Technology',
      red_flags: [],
    },
  ]);

  const [riskDistribution] = useState([
    { name: 'High Risk', value: 23, fill: '#ff6b6b' },
    { name: 'Medium Risk', value: 42, fill: '#ffa500' },
    { name: 'Low Risk', value: 95, fill: '#4ade80' },
  ]);

  const [riskFactors] = useState([
    { factor: 'Structuring', score: 85 },
    { factor: 'Geographic', score: 72 },
    { factor: 'Transaction Frequency', score: 68 },
    { factor: 'Shell Companies', score: 90 },
    { factor: 'Cross-Border', score: 78 },
    { factor: 'Account Age', score: 45 },
    { factor: 'Volume Anomaly', score: 82 },
    { factor: 'Beneficial Owner', score: 88 },
  ]);

  const getScoreBadgeClass = (score: number) => {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  };

  const getRiskCategoryColor = (category: string) => {
    switch (category) {
      case 'high':
        return '#ff6b6b';
      case 'medium':
        return '#ffa500';
      default:
        return '#4ade80';
    }
  };

  return (
    <div className="risk-profiling">
      <header className="page-header">
        <h1>Risk-Based Customer Profiling</h1>
        <p>AI-powered risk assessment and customer due diligence</p>
      </header>

      {/* Risk Distribution Chart */}
      <div className="charts-section">
        <div className="chart-container">
          <h2>Risk Category Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h2>Risk Factor Analysis</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              layout="vertical"
              data={riskFactors}
              margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.6)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a2332',
                  border: '1px solid #00d4ff',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="score" fill="#00d4ff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Customer Profiles */}
      <div className="profiles-section">
        <h2>Customer Profiles</h2>
        <div className="profiles-grid">
          {profiles.map((profile) => (
            <div key={profile.id} className={`profile-card ${profile.risk_category}`}>
              <div className="profile-header">
                <div className="profile-avatar">
                  <User size={24} />
                </div>
                <div className="profile-title">
                  <h3>{profile.name}</h3>
                  <p className="profile-id">{profile.id}</p>
                </div>
                <div className={`risk-score ${getScoreBadgeClass(profile.risk_score)}`}>
                  {profile.risk_score}
                </div>
              </div>

              <div className="profile-content">
                <div className="info-row">
                  <span className="label">Risk Category</span>
                  <span className={`value category-${profile.risk_category}`}>
                    {profile.risk_category.toUpperCase()}
                  </span>
                </div>

                <div className="info-row">
                  <span className="label">Account Age</span>
                  <span className="value">{profile.account_age} years</span>
                </div>

                <div className="info-row">
                  <span className="label">Transactions</span>
                  <span className="value">{profile.transaction_count}</span>
                </div>

                <div className="info-row">
                  <span className="label">Total Volume</span>
                  <span className="value">${(profile.total_volume / 1000000).toFixed(1)}M</span>
                </div>

                <div className="info-row">
                  <span className="label">Geographic Risk</span>
                  <span className="value">{profile.geographic_risk}</span>
                </div>

                <div className="info-row">
                  <span className="label">Industry</span>
                  <span className="value">{profile.industry}</span>
                </div>

                {profile.red_flags.length > 0 && (
                  <div className="red-flags">
                    <h4>Red Flags Detected</h4>
                    <ul>
                      {profile.red_flags.map((flag, idx) => (
                        <li key={idx}>
                          <span className="flag-icon">⚠️</span>
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="profile-actions">
                <button className="btn-review">Review Details</button>
                <button className="btn-monitor">Monitor Account</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="ai-insights">
        <h2>AI-Powered Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <Zap className="insight-icon" size={28} />
            <h3>Predictive Alerts</h3>
            <p>ML models predict high-risk transactions 48 hours before they occur with 92% accuracy.</p>
          </div>
          <div className="insight-card">
            <TrendingUp className="insight-icon" size={28} />
            <h3>Behavioral Anomaly Detection</h3>
            <p>Real-time detection of deviations from baseline customer behavior patterns.</p>
          </div>
          <div className="insight-card">
            <Shield className="insight-icon" size={28} />
            <h3>Network Risk Assessment</h3>
            <p>Analyze relationships and connections between customers to identify layering schemes.</p>
          </div>
          <div className="insight-card">
            <User className="insight-icon" size={28} />
            <h3>Beneficial Owner Tracking</h3>
            <p>Deep investigation into beneficial ownership structures using AI-powered verification.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskProfiling;
