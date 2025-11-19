# Threat Analyzer - Money Laundering Detection System

A comprehensive frontend application for detecting suspicious money laundering patterns in bank accounts using advanced analytics, network visualization, and AI-powered risk profiling.

## 🎯 Project Overview

The Threat Analyzer is built to detect and analyze money laundering patterns across financial transactions. It implements real-time monitoring, network visualization of transaction flows, and AI-powered risk assessment to identify suspicious activities including:

- **Structuring (Smurfing)**: Multiple small transactions below reporting thresholds
- **Layering**: Complex webs of transactions to obscure fund origins
- **Geographic Dispersion**: Rapid cross-border transfers across multiple jurisdictions
- **Shell Company Involvement**: Transfers through offshore entities
- **Trade-Based Laundering**: Over/under-invoicing of goods

## 🚀 Key Features

### 1. **Dashboard**
- Real-time overview of all security threats
- Key performance metrics (Alerts, High-Risk Accounts, Flagged Transactions)
- Transaction volume and risk trend visualization
- Risk distribution analysis by account type
- Recent security alerts panel

### 2. **Transaction Monitoring System**
- Real-time transaction analysis
- Advanced filtering by transaction type and status
- Risk score calculation for each transaction
- Pattern detection and classification
- Transaction export functionality
- Summary statistics and analytics

### 3. **Network Visualization (Spider Maps)**
- Interactive network graph showing account relationships
- Money trail visualization across 5 layers of laundering:
  - Layer 1: Placement (Initial deposit)
  - Layer 2: Structuring (Fragmentation)
  - Layer 3: Layering (Complex web)
  - Layer 4: Cross-Border (International transfers)
  - Layer 5: Integration (Final reintegration)
- Zoom and pan controls
- Export network visualization as image
- Statistical overview of the network

### 4. **Risk-Based Customer Profiling**
- Automated customer risk scoring
- Risk category distribution analysis
- Customer profile cards with detailed information
- AI-powered insights including:
  - Predictive alerts
  - Behavioral anomaly detection
  - Network risk assessment
  - Beneficial owner tracking
- Risk factor analysis

### 5. **Pattern Analysis & Behavioral Detection**
- Identification of 5 major money laundering patterns
- Time-series analysis of pattern detection
- Correlation analysis between transaction amounts and risk
- Pattern characteristics and descriptions
- Detection confidence scoring
- Interactive investigation tools

## 📋 Objectives Implemented

✅ **Transaction Monitoring System** - Real-time analysis of transactions with risk scoring and pattern detection

✅ **Risk-Based Customer Profiling** - AI-powered customer classification and risk assessment

✅ **AI and Machine Learning Integration** - ML models for anomaly detection and predictive alerts

✅ **Periodic Lookbacks and Pattern Analysis** - Historical analysis with timeline visualization

✅ **Network Visualization** - Interactive spider maps showing transaction flows and account relationships

✅ **Multi-Layer Detection** - Identification of all 5 money laundering phases

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe development
- **React Router v6** - Navigation
- **Recharts** - Data visualization and charting
- **Vis-Network** - Interactive network graphs
- **Lucide React** - Icon library
- **CSS3** - Styling with animations

### Build & Development
- **React Scripts** - Build tool
- **Tailwind CSS** - Utility-first styling
- **ESLint** - Code quality

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Threat-Analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   The application will open at `http://localhost:3000`

4. **Build for production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
Threat-Analyzer/
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   ├── Sidebar.css
│   │   ├── StatCard.tsx         # Metric display card
│   │   ├── StatCard.css
│   │   ├── AlertsPanel.tsx      # Alerts display
│   │   └── AlertsPanel.css
│   ├── pages/
│   │   ├── Dashboard.tsx        # Main dashboard
│   │   ├── Dashboard.css
│   │   ├── TransactionMonitoring.tsx   # Transaction system
│   │   ├── TransactionMonitoring.css
│   │   ├── NetworkVisualization.tsx    # Network graphs
│   │   ├── NetworkVisualization.css
│   │   ├── RiskProfiling.tsx          # Risk assessment
│   │   ├── RiskProfiling.css
│   │   ├── PatternAnalysis.tsx        # Pattern detection
│   │   └── PatternAnalysis.css
│   ├── App.tsx                  # Main app component
│   ├── App.css
│   ├── index.tsx               # React entry point
│   └── index.css
├── public/
│   └── index.html              # HTML template
├── package.json
├── tsconfig.json
└── README.md
```

## 🎨 UI/UX Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark Theme Support**: Professional dark interface for security applications
- **Interactive Visualizations**: Charts, graphs, and network diagrams
- **Real-time Updates**: Live data refresh and alerts
- **Intuitive Navigation**: Easy-to-use sidebar navigation
- **Accessibility**: Semantic HTML and keyboard navigation support

## 📊 Data Models

### Transaction Object
```typescript
{
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
```

### Customer Profile Object
```typescript
{
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
```

### Network Node Object
```typescript
{
  id: string;
  label: string;
  type: 'account' | 'shell' | 'person';
  risk_level: 'low' | 'medium' | 'high';
  amount: number;
}
```

## 🔍 Detection Patterns

### 1. Structuring (Smurfing)
- Multiple transactions just below reporting threshold
- Sequential timing patterns
- Multiple accounts/individuals involvement
- Detection: Pattern frequency analysis

### 2. Round-Tripping
- Funds sent out through intermediaries and returned
- Creates false transaction history
- Use of offshore companies
- Detection: Circular flow analysis

### 3. Trade-Based Layering
- Over/under-invoicing of goods
- Misalignment of goods and payments
- International trade manipulation
- Detection: Invoice-to-amount matching

### 4. Geographic Layering
- Rapid cross-border transfers
- Multiple jurisdiction involvement
- High-risk country activity
- Detection: Geographic risk scoring

### 5. Rapid Velocity Transfers
- High-frequency transfers within short periods
- Unusual acceleration patterns
- Detection: Velocity algorithms

## 📈 Risk Scoring Algorithm

The system calculates risk scores based on:
- **Transaction Characteristics**: Amount, frequency, type
- **Account Profile**: Age, volume history, industry
- **Geographic Indicators**: Jurisdiction risk, cross-border activity
- **Behavioral Patterns**: Deviations from baseline
- **Network Analysis**: Account relationships and connections

### Risk Categories
- **High Risk** (80-100): Immediate investigation required
- **Medium Risk** (60-79): Enhanced monitoring recommended
- **Low Risk** (0-59): Normal activity

## 🚨 Alert System

Alerts are triggered for:
- Flagged transactions exceeding thresholds
- Suspicious pattern detection
- Unusual account behavior
- Rapid fund transfers
- Shell company involvement
- Geographic anomalies

## 🔐 Security Considerations

- All data is processed client-side (for demo purposes)
- Consider implementing backend API for production
- Use HTTPS for all data transmission
- Implement role-based access control
- Add audit logging for all investigations
- Encrypt sensitive data in transit and at rest

## 🧪 Testing

Currently includes mock data for demonstration. For production:
```bash
npm test
```

## 📝 API Integration

To integrate with a backend API, modify the data fetching in each component:

```typescript
// Example integration point
useEffect(() => {
  fetch('/api/transactions')
    .then(res => res.json())
    .then(data => setTransactions(data))
}, []);
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## 📄 License

This project is proprietary and confidential.

## 📞 Support

For support or questions, contact the development team.

## 🗺️ Roadmap

- [ ] Backend API integration
- [ ] Real database connectivity
- [ ] Advanced ML models
- [ ] Mobile app version
- [ ] WebSocket real-time updates
- [ ] Advanced reporting module
- [ ] Multi-language support
- [ ] Integration with external AML databases
- [ ] Blockchain transaction analysis
- [ ] Video call verification system

## 📚 References

- **AML Regulations**: FATF, FinCEN, EU 5th Directive
- **Detection Methods**: Based on financial crime investigation best practices
- **Risk Assessment**: Aligned with Basel III compliance framework
- **Pattern Analysis**: Utilizing graph theory and machine learning

---

**Version**: 1.0.0
**Last Updated**: November 2025
**Status**: Active Development
