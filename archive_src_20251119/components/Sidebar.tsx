import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Network,
  Activity,
  TrendingUp,
  AlertCircle,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/' },
    { icon: Activity, label: 'Transaction Monitor', path: '/transactions' },
    { icon: Network, label: 'Network Analysis', path: '/network' },
    { icon: TrendingUp, label: 'Risk Profiling', path: '/risk-profiling' },
    { icon: AlertCircle, label: 'Pattern Analysis', path: '/pattern-analysis' },
  ];

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <Shield size={32} className="brand-icon" />
          {isOpen && <h1>Threat Analyzer</h1>}
        </div>
        <button
          className="toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="nav-item"
            title={isOpen ? '' : item.label}
          >
            <item.icon size={20} />
            {isOpen && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        {isOpen && (
          <div className="system-info">
            <p className="version">v1.0.0</p>
            <p className="status">🟢 System Active</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
