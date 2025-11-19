import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network';
import { RefreshCw, Download, ZoomIn, ZoomOut } from 'lucide-react';
import './NetworkVisualization.css';

interface NetworkNode {
  id: string;
  label: string;
  type: 'account' | 'shell' | 'person';
  risk_level: 'low' | 'medium' | 'high';
  amount: number;
}

interface NetworkEdge {
  from: string;
  to: string;
  amount: number;
  count: number;
  risk_level: string;
}

const NetworkVisualization = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [networkStats, setNetworkStats] = useState({
    totalAccounts: 0,
    shellCompanies: 0,
    totalTransactions: 0,
    suspiciousConnections: 0,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    // Sample data for network visualization
    const nodes = [
      // Primary suspect accounts
      { id: 'ACC-001', label: 'ACC-001\n(Primary)', type: 'account', risk_level: 'high', amount: 500000 },
      { id: 'ACC-045', label: 'ACC-045', type: 'account', risk_level: 'medium', amount: 200000 },
      { id: 'ACC-052', label: 'ACC-052\n(Receiver)', type: 'account', risk_level: 'medium', amount: 150000 },

      // Shell companies
      { id: 'SHELL-008', label: 'SHELL-008\n(Offshore)', type: 'shell', risk_level: 'high', amount: 300000 },
      { id: 'SHELL-015', label: 'SHELL-015', type: 'shell', risk_level: 'high', amount: 250000 },

      // Money mule accounts
      { id: 'ACC-089', label: 'ACC-089\n(Mule-1)', type: 'account', risk_level: 'medium', amount: 75000 },
      { id: 'ACC-090', label: 'ACC-090\n(Mule-2)', type: 'account', risk_level: 'medium', amount: 85000 },

      // Beneficial owners
      { id: 'PERSON-X', label: 'Person X\n(Beneficial Owner)', type: 'person', risk_level: 'high', amount: 0 },
      { id: 'PERSON-Y', label: 'Person Y\n(Accomplice)', type: 'person', risk_level: 'high', amount: 0 },

      // International accounts
      { id: 'INT-SG-001', label: 'INT-SG-001\n(Singapore)', type: 'account', risk_level: 'high', amount: 180000 },
      { id: 'INT-HK-002', label: 'INT-HK-002\n(Hong Kong)', type: 'account', risk_level: 'high', amount: 220000 },
    ];

    const edges = [
      // Layer 1: Initial placement
      { from: 'PERSON-X', to: 'ACC-001', amount: 500000, count: 1, risk_level: 'high' },

      // Layer 2: Structuring through shell companies
      { from: 'ACC-001', to: 'SHELL-008', amount: 245000, count: 3, risk_level: 'high' },
      { from: 'ACC-001', to: 'SHELL-015', amount: 200000, count: 2, risk_level: 'high' },

      // Layer 3: Fragmentation through money mules
      { from: 'SHELL-008', to: 'ACC-089', amount: 75000, count: 5, risk_level: 'high' },
      { from: 'SHELL-008', to: 'ACC-090', amount: 85000, count: 4, risk_level: 'high' },
      { from: 'SHELL-015', to: 'ACC-052', amount: 150000, count: 2, risk_level: 'high' },

      // Layer 4: Cross-border transfers
      { from: 'ACC-089', to: 'INT-SG-001', amount: 50000, count: 3, risk_level: 'high' },
      { from: 'ACC-090', to: 'INT-HK-002', amount: 60000, count: 3, risk_level: 'high' },
      { from: 'ACC-052', to: 'INT-SG-001', amount: 80000, count: 2, risk_level: 'high' },

      // Layer 5: Integration
      { from: 'INT-SG-001', to: 'ACC-045', amount: 120000, count: 2, risk_level: 'medium' },
      { from: 'INT-HK-002', to: 'ACC-045', amount: 140000, count: 2, risk_level: 'medium' },
      { from: 'ACC-045', to: 'PERSON-Y', amount: 200000, count: 1, risk_level: 'high' },
    ];

    // Configure vis nodes with styling
    const visNodes = nodes.map((node) => {
      let color = '#4ade80';
      let size = 30;

      if (node.risk_level === 'high') {
        color = '#ff6b6b';
        size = 50;
      } else if (node.risk_level === 'medium') {
        color = '#ffa500';
        size = 40;
      }

      let shape = 'dot';
      if (node.type === 'shell') shape = 'box';
      if (node.type === 'person') shape = 'star';

      return {
        id: node.id,
        label: node.label,
        color: { background: color, border: '#1a2332' },
        size: size,
        shape: shape,
        font: { size: 12, face: 'Arial', color: 'white' },
        borderWidth: 3,
        physics: true,
      };
    });

    // Configure vis edges with styling
    const visEdges = edges.map((edge) => {
      return {
        from: edge.from,
        to: edge.to,
        label: `$${edge.amount.toLocaleString()}\n(${edge.count}x)`,
        width: Math.min(edge.count * 1.5, 5),
        color: { color: '#00d4ff', highlight: '#ff6b6b' },
        font: { size: 10, align: 'middle' },
        arrows: 'to',
        physics: true,
      };
    });

    // Network options
    const options = {
      physics: {
        enabled: true,
        barnesHut: {
          gravitationalConstant: -15000,
          centralGravity: 0.3,
          springLength: 200,
          springConstant: 0.04,
        },
        forceAtlas2Based: {
          gravitationalConstant: -45,
          centralGravity: 0.01,
          springLength: 200,
          springConstant: 0.08,
        },
        stabilization: { iterations: 200 },
      },
      interaction: {
        hover: true,
        navigationButtons: true,
        keyboard: true,
      },
      nodes: {
        shadow: {
          enabled: true,
          color: 'rgba(0,0,0,0.2)',
          size: 10,
          x: 5,
          y: 5,
        },
      },
      edges: {
        smooth: {
          type: 'continuous',
          forceDirection: 'none',
        },
        shadow: {
          enabled: true,
          color: 'rgba(0,0,0,0.1)',
          size: 10,
          x: 5,
          y: 5,
        },
      },
      groups: {
        high_risk: {
          color: '#ff6b6b',
        },
      },
    };

    const data = { nodes: visNodes, edges: visEdges };

    if (containerRef.current) {
      networkRef.current = new Network(containerRef.current, data, options);

      networkRef.current.on('selectNode', (event) => {
        setSelectedNode(event.nodes[0]);
      });

      networkRef.current.on('deselectNode', () => {
        setSelectedNode(null);
      });
    }

    // Update stats
    const uniqueAccounts = new Set(nodes.map((n) => n.id)).size;
    const shellCompanies = nodes.filter((n) => n.type === 'shell').length;
    const totalTransactions = edges.reduce((sum, e) => sum + e.count, 0);
    const suspiciousConnections = edges.filter((e) => e.risk_level === 'high').length;

    setNetworkStats({
      totalAccounts: uniqueAccounts,
      shellCompanies,
      totalTransactions,
      suspiciousConnections,
    });

    return () => {
      if (networkRef.current) networkRef.current.destroy();
    };
  }, []);

  const handleZoom = (direction: 'in' | 'out') => {
    if (networkRef.current) {
      const currentScale = networkRef.current.getScale();
      const newScale = direction === 'in' ? currentScale * 1.2 : currentScale / 1.2;
      networkRef.current.moveTo({ scale: newScale });
    }
  };

  const handleReset = () => {
    if (networkRef.current) {
      networkRef.current.fit();
    }
  };

  const handleExport = () => {
    if (networkRef.current) {
      const canvas = networkRef.current.canvas.canvas as HTMLCanvasElement;
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = 'money-trail-network.png';
      link.click();
    }
  };

  return (
    <div className="network-visualization">
      <header className="page-header">
        <h1>Network Analysis & Money Trail Visualization</h1>
        <p>Interactive spider map showing transaction layers and account connections</p>
      </header>

      <div className="network-layout">
        {/* Controls */}
        <div className="network-controls">
          <div className="control-group">
            <h3>Controls</h3>
            <button onClick={() => handleZoom('in')} className="control-btn" title="Zoom In">
              <ZoomIn size={18} />
            </button>
            <button onClick={() => handleZoom('out')} className="control-btn" title="Zoom Out">
              <ZoomOut size={18} />
            </button>
            <button onClick={handleReset} className="control-btn" title="Reset View">
              <RefreshCw size={18} />
            </button>
            <button onClick={handleExport} className="control-btn" title="Export Image">
              <Download size={18} />
            </button>
          </div>

          {/* Legend */}
          <div className="legend">
            <h3>Legend</h3>
            <div className="legend-item">
              <div className="legend-icon circle high" />
              <span>High Risk Account</span>
            </div>
            <div className="legend-item">
              <div className="legend-icon circle medium" />
              <span>Medium Risk Account</span>
            </div>
            <div className="legend-item">
              <div className="legend-icon circle low" />
              <span>Low Risk Account</span>
            </div>
            <div className="legend-item">
              <div className="legend-icon box" />
              <span>Shell Company</span>
            </div>
            <div className="legend-item">
              <div className="legend-icon star" />
              <span>Beneficial Owner</span>
            </div>
          </div>

          {/* Stats */}
          <div className="network-stats">
            <h3>Network Statistics</h3>
            <div className="stat">
              <span>Total Accounts</span>
              <strong>{networkStats.totalAccounts}</strong>
            </div>
            <div className="stat">
              <span>Shell Companies</span>
              <strong>{networkStats.shellCompanies}</strong>
            </div>
            <div className="stat">
              <span>Total Transactions</span>
              <strong>{networkStats.totalTransactions}</strong>
            </div>
            <div className="stat">
              <span>Suspicious Connections</span>
              <strong>{networkStats.suspiciousConnections}</strong>
            </div>
          </div>

          {/* Selected Node Info */}
          {selectedNode && (
            <div className="node-info">
              <h3>Selected Node</h3>
              <div className="info-content">
                <p>
                  <strong>Node ID:</strong> {selectedNode}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Network Container */}
        <div ref={containerRef} className="network-container" />
      </div>

      {/* Money Laundering Layers Description */}
      <div className="layers-info">
        <h2>Money Laundering Layers Detected</h2>
        <div className="layers-grid">
          <div className="layer">
            <h4>Layer 1: Placement</h4>
            <p>Initial deposit into financial system through primary account (ACC-001)</p>
            <span className="amount">$500,000</span>
          </div>
          <div className="layer">
            <h4>Layer 2: Structuring</h4>
            <p>Fragmentation through shell companies (SHELL-008, SHELL-015)</p>
            <span className="amount">$445,000</span>
          </div>
          <div className="layer">
            <h4>Layer 3: Layering</h4>
            <p>Complex web through money mules and multiple accounts</p>
            <span className="amount">$310,000</span>
          </div>
          <div className="layer">
            <h4>Layer 4: Cross-Border</h4>
            <p>International transfers across multiple jurisdictions</p>
            <span className="amount">$190,000</span>
          </div>
          <div className="layer">
            <h4>Layer 5: Integration</h4>
            <p>Reintegration into legitimate economy through final account</p>
            <span className="amount">$260,000</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkVisualization;
