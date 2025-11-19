import React, { useState } from 'react';
import { Search, Filter, Download, Eye } from 'lucide-react';
import './TransactionMonitoring.css';

interface Transaction {
  id: string;
  date: string;
  from_account: string;
  to_account: string;
  amount: number;
  type: string;
  risk_score: number;
  status: 'normal' | 'flagged' | 'blocked';
  pattern: string;
}

const TransactionMonitoring = () => {
  const [transactions] = useState<Transaction[]>([
    {
      id: 'TXN-001',
      date: '2025-01-07 14:32:00',
      from_account: 'ACC-2024-001',
      to_account: 'ACC-2024-045',
      amount: 50000,
      type: 'Wire Transfer',
      risk_score: 85,
      status: 'flagged',
      pattern: 'Rapid Cross-Border Transfer',
    },
    {
      id: 'TXN-002',
      date: '2025-01-07 13:15:00',
      from_account: 'ACC-2024-015',
      to_account: 'ACC-2024-052',
      amount: 9500,
      type: 'Bank Transfer',
      risk_score: 72,
      status: 'flagged',
      pattern: 'Structured Transaction (Below Threshold)',
    },
    {
      id: 'TXN-003',
      date: '2025-01-07 11:45:00',
      from_account: 'ACC-2024-042',
      to_account: 'SHELL-2024-008',
      amount: 245000,
      type: 'International Transfer',
      risk_score: 92,
      status: 'blocked',
      pattern: 'Shell Company Transfer',
    },
    {
      id: 'TXN-004',
      date: '2025-01-07 10:20:00',
      from_account: 'ACC-2024-089',
      to_account: 'ACC-2024-090',
      amount: 15000,
      type: 'Wire Transfer',
      risk_score: 45,
      status: 'normal',
      pattern: 'Normal Activity',
    },
    {
      id: 'TXN-005',
      date: '2025-01-07 09:10:00',
      from_account: 'ACC-2024-120',
      to_account: 'ACC-2024-121',
      amount: 125000,
      type: 'International Transfer',
      risk_score: 88,
      status: 'flagged',
      pattern: 'Multi-Jurisdiction Transfer',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      txn.id.includes(searchTerm) ||
      txn.from_account.includes(searchTerm) ||
      txn.to_account.includes(searchTerm);

    const matchesType = filterType === 'all' || txn.type === filterType;
    const matchesStatus = filterStatus === 'all' || txn.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 80) return '#ff6b6b';
    if (riskScore >= 60) return '#ffa500';
    return '#4ade80';
  };

  const getStatusBadge = (status: string) => {
    const classes: Record<string, string> = {
      normal: 'status-normal',
      flagged: 'status-flagged',
      blocked: 'status-blocked',
    };
    return classes[status] || 'status-normal';
  };

  return (
    <div className="transaction-monitoring">
      <header className="page-header">
        <h1>Transaction Monitoring System</h1>
        <p>Real-time analysis of transactions for suspicious money laundering patterns</p>
      </header>

      {/* Controls */}
      <div className="monitoring-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by transaction ID, account..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="Wire Transfer">Wire Transfer</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="International Transfer">International Transfer</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="normal">Normal</option>
            <option value="flagged">Flagged</option>
            <option value="blocked">Blocked</option>
          </select>

          <button className="btn-export">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="transactions-table-wrapper">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Date/Time</th>
              <th>From Account</th>
              <th>To Account</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Risk Score</th>
              <th>Pattern Detected</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((txn) => (
              <tr key={txn.id} className={`row-${txn.status}`}>
                <td className="txn-id">{txn.id}</td>
                <td>{txn.date}</td>
                <td className="account">{txn.from_account}</td>
                <td className="account">{txn.to_account}</td>
                <td className="amount">${txn.amount.toLocaleString()}</td>
                <td>{txn.type}</td>
                <td>
                  <div className="risk-score-container">
                    <div
                      className="risk-bar"
                      style={{
                        width: `${txn.risk_score}%`,
                        backgroundColor: getRiskColor(txn.risk_score),
                      }}
                    />
                    <span className="risk-text">{txn.risk_score}</span>
                  </div>
                </td>
                <td className="pattern">{txn.pattern}</td>
                <td>
                  <span className={`status-badge ${getStatusBadge(txn.status)}`}>
                    {txn.status.toUpperCase()}
                  </span>
                </td>
                <td className="action-cell">
                  <button className="btn-view" title="View Details">
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="transaction-stats">
        <div className="stat">
          <span className="stat-label">Total Transactions</span>
          <span className="stat-value">{filteredTransactions.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Flagged</span>
          <span className="stat-value flagged">
            {filteredTransactions.filter((t) => t.status === 'flagged').length}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Blocked</span>
          <span className="stat-value blocked">
            {filteredTransactions.filter((t) => t.status === 'blocked').length}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Average Risk Score</span>
          <span className="stat-value">
            {(
              filteredTransactions.reduce((sum, t) => sum + t.risk_score, 0) /
              filteredTransactions.length
            ).toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TransactionMonitoring;
