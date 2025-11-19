# Architecture Documentation

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                 │
│  ┌──────────────┬──────────────┬───────────┬──────────┐ │
│  │  Dashboard   │ Transaction  │ Network   │   Risk   │ │
│  │              │ Monitoring   │ Visual.   │ Profiling│ │
│  │              │              │           │          │ │
│  │  Pattern     │ Alerts       │ Charts    │  Stats   │ │
│  └──────────────┴──────────────┴───────────┴──────────┘ │
└─────────────────────────────────────────────────────────┘
                           ↑
                           │
┌─────────────────────────────────────────────────────────┐
│                   COMPONENT LAYER                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Navigation │ Cards │ Panels │ Visualizations   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↑
                           │
┌─────────────────────────────────────────────────────────┐
│                 DATA & STATE MANAGEMENT                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │  React Hooks │ State │ Effects │ Context API    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↑
                           │
┌─────────────────────────────────────────────────────────┐
│                  DATA LAYER (BACKEND API)               │
│  ┌──────────────────────────────────────────────────┐  │
│  │  REST API │ Database │ ML Models │ Analytics    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App
├── Sidebar
│   ├── Navigation Items
│   └── System Status
└── Main Content
    ├── Dashboard Page
    │   ├── StatCards
    │   ├── Charts (Line, Bar)
    │   └── AlertsPanel
    ├── TransactionMonitoring Page
    │   ├── Search & Filters
    │   ├── Transaction Table
    │   └── Statistics
    ├── NetworkVisualization Page
    │   ├── Network Container
    │   ├── Controls
    │   └── Legend
    ├── RiskProfiling Page
    │   ├── Charts (Pie, Bar)
    │   ├── Profile Cards
    │   └── AI Insights
    └── PatternAnalysis Page
        ├── Overview Cards
        ├── Charts (Area, Line, Scatter)
        └── Pattern Table
```

## Data Flow Architecture

### 1. Dashboard Data Flow

```
User Opens Dashboard
    ↓
Component Mounts
    ↓
useEffect Hook Triggered
    ↓
Fetch/Load Mock Data
    ↓
Set State (transactions, metrics)
    ↓
Render Components with Data
    ↓
Display Visualizations & Alerts
```

### 2. Transaction Monitoring Flow

```
User Filters Transactions
    ↓
Update Filter State
    ↓
Process Filter Logic
    ↓
Filter Dataset
    ↓
Re-render Table
    ↓
Update Summary Statistics
```

### 3. Network Visualization Flow

```
Component Mounts
    ↓
Create Nodes & Edges Arrays
    ↓
Initialize Vis-Network Instance
    ↓
Configure Physics Engine
    ↓
Render Interactive Network
    ↓
Listen to User Interactions
    ↓
Update Selected Node Info
```

## Technology Stack Details

### Frontend Framework
- **React 18**: Component-based UI rendering
- **TypeScript**: Type safety and IDE support
- **React Router v6**: Client-side routing

### Visualization Libraries
- **Recharts**: Chart rendering (Line, Bar, Pie, Area, Scatter)
- **Vis-Network**: Network graph visualization
- **Lucide React**: Icon library

### Styling
- **CSS3**: Custom styling with animations
- **Responsive Design**: Mobile-first approach
- **Gradient Backgrounds**: Modern UI aesthetics

## State Management Strategy

Currently uses React's built-in state management:
- `useState` hooks for component-level state
- `useEffect` for side effects and data loading
- Props drilling for data passing

For future scalability, consider:
- **Zustand** (lightweight)
- **Redux** (complex applications)
- **Context API** (medium-sized apps)

## Key Components Architecture

### Sidebar Component
```
├── Brand Section (Logo + Title)
├── Navigation Items (Map of routes)
├── Toggle Button (Collapse/Expand)
├── Footer (System info)
└── Responsive Design (Mobile support)
```

### Dashboard Component
```
├── Header Section
├── Metrics Grid (4 StatCards)
├── Charts Section (Line + Bar Charts)
└── Alerts Panel (Recent alerts list)
```

### TransactionMonitoring Component
```
├── Search Box
├── Filter Dropdowns
├── Export Button
├── Data Table
│   ├── Search/Filter Logic
│   ├── Conditional Row Styling
│   └── Risk Score Visualization
└── Summary Statistics
```

### NetworkVisualization Component
```
├── Control Panel
│   ├── Zoom Controls
│   ├── Legend
│   ├── Network Stats
│   └── Node Info
├── Network Container
│   └── Vis-Network Graph
└── Layers Information
    └── Money Laundering Phases
```

### RiskProfiling Component
```
├── Risk Distribution Chart (Pie)
├── Risk Factor Analysis (Horizontal Bar)
├── Profile Cards Grid
│   ├── Profile Header
│   ├── Profile Info Rows
│   ├── Red Flags
│   └── Action Buttons
└── AI Insights Cards
```

### PatternAnalysis Component
```
├── Overview Cards
├── Time Series Charts (Area, Line)
├── Correlation Chart (Scatter)
├── Pattern Detection Table
│   ├── Pattern ID & Name
│   ├── Severity Badge
│   ├── Confidence Bar
│   └── Investigate Button
└── Pattern Characteristics Grid
```

## Styling Architecture

### CSS Organization
1. **Component-specific CSS**: Each component has its own CSS file
2. **Consistent Naming**: BEM-like methodology
3. **Color Scheme**:
   - Primary: `#00d4ff` (Cyan)
   - Dark: `#1a2332` (Navy)
   - Success: `#4ade80` (Green)
   - Warning: `#ffa500` (Orange)
   - Danger: `#ff6b6b` (Red)

### Responsive Design Breakpoints
```
Desktop: > 1024px
Tablet: 768px - 1024px
Mobile: < 768px
```

## Data Models

### Transaction Model
```typescript
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
```

### Alert Model
```typescript
interface Alert {
  id: number;
  severity: 'high' | 'medium' | 'low';
  account: string;
  message: string;
  timestamp: string;
  amount: string;
}
```

### Network Node Model
```typescript
interface NetworkNode {
  id: string;
  label: string;
  type: 'account' | 'shell' | 'person';
  risk_level: 'low' | 'medium' | 'high';
  amount: number;
}
```

### Customer Profile Model
```typescript
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
```

## Risk Calculation Algorithm

```
riskScore = (
  structuringRisk * 0.25 +
  geographicRisk * 0.20 +
  velocityRisk * 0.15 +
  accountAgeRisk * 0.15 +
  volumeAnomalyRisk * 0.15 +
  networkRisk * 0.10
) * 100
```

## Performance Considerations

1. **Code Splitting**
   - React Router enables automatic code splitting
   - Each page loads only necessary components

2. **Memoization**
   - Use `React.memo` for static components
   - Consider `useMemo` for expensive calculations

3. **Lazy Loading**
   - Components load on demand
   - Charts render when visible

4. **Bundle Size**
   - Tree shaking removes unused code
   - Minification reduces file size

## Security Architecture

### Current Implementation (Demo)
- All data is client-side only
- No external API calls
- Mock data for demonstration

### Production Recommendations

```
┌──────────────┐
│   Frontend   │─────► HTTPS ◄──────┐
└──────────────┘                    │
                              ┌─────┴──────┐
                              │  API Layer  │
                              │  (Auth)     │
                              └─────┬──────┘
                                    │
                              ┌─────┴──────┐
                              │ Database   │
                              │ (Encrypted)│
                              └────────────┘
```

**Security Measures**:
- HTTPS encryption
- JWT authentication
- Role-based access control (RBAC)
- API rate limiting
- Input validation
- SQL injection prevention
- XSS protection

## Scalability Architecture

### For Larger Datasets

1. **Virtual Scrolling**
   - Render only visible rows
   - Reduces DOM nodes
   - Improves performance

2. **Server-Side Pagination**
   - Load data in chunks
   - Reduce initial load time
   - Better memory usage

3. **Web Workers**
   - Offload heavy computation
   - Keep UI responsive
   - Background processing

4. **Service Workers**
   - Progressive Web App (PWA)
   - Offline capability
   - Cache management

## API Integration Points

### Current Mock Data Locations
1. Dashboard: `src/pages/Dashboard.tsx` (lines 14-28)
2. TransactionMonitoring: `src/pages/TransactionMonitoring.tsx` (lines 15-70)
3. NetworkVisualization: `src/pages/NetworkVisualization.tsx` (lines 19-97)
4. RiskProfiling: `src/pages/RiskProfiling.tsx` (lines 10-55)
5. PatternAnalysis: `src/pages/PatternAnalysis.tsx` (lines 10-85)

### Replace Mock Data with API Calls
```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('/api/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  fetchData();
}, []);
```

## Deployment Architecture

### Development
```
npm start → Webpack Dev Server → http://localhost:3000
```

### Production Build
```
npm run build → Optimized Bundle → build/ folder
```

### Hosting Options
- **Vercel**: Optimal for React apps
- **Netlify**: Easy deployment
- **AWS S3 + CloudFront**: Scalable
- **Docker Containerization**: Enterprise deployments

## Monitoring & Analytics

Future additions:
- Error tracking (Sentry)
- Performance monitoring (New Relic)
- User analytics (Google Analytics)
- Log aggregation (ELK Stack)

## Testing Strategy

### Unit Tests
- Component rendering
- State changes
- Event handlers

### Integration Tests
- Navigation flow
- Data fetching
- User interactions

### E2E Tests
- Full user workflows
- Cross-browser compatibility

## Documentation Standards

- **Code Comments**: Clear, concise
- **Function Documentation**: JSDoc style
- **README**: Comprehensive guide
- **Type Definitions**: TypeScript interfaces

---

**Version**: 1.0.0
**Architecture Review Date**: November 2025
