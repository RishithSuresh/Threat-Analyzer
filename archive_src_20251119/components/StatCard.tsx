import React from 'react';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import './StatCard.css';

interface StatCardProps {
  icon: React.ComponentType<{ size: number; className: string }>;
  label: string;
  value: number | string;
  color: 'red' | 'orange' | 'purple' | 'blue' | 'green';
  trend?: string;
}

const StatCard = ({ icon: Icon, label, value, color, trend }: StatCardProps) => {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-header">
        <Icon size={24} className="stat-icon" />
        <span className="trend">{trend}</span>
      </div>
      <h3 className="stat-value">{value}</h3>
      <p className="stat-label">{label}</p>
    </div>
  );
};

export default StatCard;
