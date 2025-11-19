import React from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import './AlertsPanel.css';

interface Alert {
  id: number;
  severity: 'high' | 'medium' | 'low';
  account: string;
  message: string;
  timestamp: string;
  amount: string;
}

interface AlertsPanelProps {
  alerts: Alert[];
}

const AlertsPanel = ({ alerts }: AlertsPanelProps) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertCircle size={18} className="alert-icon-high" />;
      case 'medium':
        return <AlertTriangle size={18} className="alert-icon-medium" />;
      default:
        return <Info size={18} className="alert-icon-low" />;
    }
  };

  const getSeverityClass = (severity: string) => `severity-${severity}`;

  return (
    <div className="alerts-panel">
      <h2 className="alerts-title">Recent Security Alerts</h2>
      <div className="alerts-list">
        {alerts.map((alert) => (
          <div key={alert.id} className={`alert-item ${getSeverityClass(alert.severity)}`}>
            <div className="alert-icon-wrapper">
              {getSeverityIcon(alert.severity)}
            </div>
            <div className="alert-content">
              <div className="alert-header">
                <span className="account-id">{alert.account}</span>
                <span className="amount">{alert.amount}</span>
              </div>
              <p className="alert-message">{alert.message}</p>
              <span className="alert-time">
                {new Date(alert.timestamp).toLocaleString()}
              </span>
            </div>
            <div className={`severity-badge ${alert.severity}`}>
              {alert.severity.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsPanel;
