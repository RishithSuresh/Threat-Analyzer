# Configuration & Customization Guide

## Environment Configuration

Create a `.env` file in the project root:

```env
# Development environment settings
REACT_APP_ENV=development
REACT_APP_API_URL=http://localhost:3001
REACT_APP_API_TIMEOUT=30000
REACT_APP_ENABLE_LOGS=true

# Feature flags
REACT_APP_ENABLE_EXPORT=true
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_NOTIFICATIONS=true

# Monitoring
REACT_APP_SENTRY_DSN=
REACT_APP_ANALYTICS_ID=
```

## Component Customization

### 1. Sidebar Branding

**File**: `src/components/Sidebar.tsx`

```typescript
// Change title
<h1>Your Company Name</h1>

// Change icon color
<Shield size={32} className="brand-icon" style={{ color: '#00d4ff' }} />

// Add custom logo
import logo from '../assets/logo.png';
<img src={logo} alt="Logo" />
```

### 2. Color Scheme

**File**: `src/App.css` and component CSS files

```css
/* Primary Colors */
--primary-cyan: #00d4ff;
--primary-dark: #1a2332;

/* Status Colors */
--danger-red: #ff6b6b;
--warning-orange: #ffa500;
--success-green: #4ade80;
--info-blue: #3498db;

/* Grayscale */
--text-dark: #1a2332;
--text-light: #666;
--bg-light: #f5f7fa;
--border-light: #e0e0e0;
```

### 3. Dashboard Metrics

**File**: `src/pages/Dashboard.tsx`

Modify the `riskMetrics` object:

```typescript
const [riskMetrics] = useState({
  totalAlerts: 24,           // Change these values
  highRiskAccounts: 8,
  flaggedTransactions: 156,
  monitoredAccounts: 342,
});
```

### 4. Alert Configuration

**File**: `src/pages/Dashboard.tsx`

Customize alert data:

```typescript
const [alerts] = useState([
  {
    id: 1,
    severity: 'high',      // 'high', 'medium', 'low'
    account: 'ACC-2024-001',
    message: 'Your custom message',
    timestamp: new Date().toISOString(),
    amount: '$125,000',
  },
  // Add more alerts
]);
```

## Risk Scoring Configuration

### Customize Risk Thresholds

**File**: `src/pages/TransactionMonitoring.tsx` (or create a config file)

```typescript
const RISK_THRESHOLDS = {
  HIGH: 80,      // >= 80
  MEDIUM: 60,    // 60-79
  LOW: 0,        // < 60
};

const getRiskColor = (riskScore: number) => {
  if (riskScore >= RISK_THRESHOLDS.HIGH) return '#ff6b6b';
  if (riskScore >= RISK_THRESHOLDS.MEDIUM) return '#ffa500';
  return '#4ade80';
};
```

## Network Visualization Configuration

**File**: `src/pages/NetworkVisualization.tsx`

### Adjust Physics Settings

```typescript
const options = {
  physics: {
    enabled: true,
    barnesHut: {
      gravitationalConstant: -15000,  // Attract/repel strength
      centralGravity: 0.3,            // Center pull
      springLength: 200,              // Node distance
      springConstant: 0.04,           // Spring stiffness
    },
    stabilization: { iterations: 200 }, // Calculation iterations
  },
};
```

### Customize Node Styling

```typescript
const visNodes = nodes.map((node) => {
  let color = '#4ade80';     // Default green
  let size = 30;             // Default size

  if (node.risk_level === 'high') {
    color = '#ff6b6b';       // High-risk red
    size = 50;               // Larger nodes
  }

  return {
    id: node.id,
    label: node.label,
    color: { background: color, border: '#1a2332' },
    size: size,
    // ... more options
  };
});
```

## Data Source Configuration

### Connect to Backend API

Create a new file `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  ENDPOINTS: {
    TRANSACTIONS: '/api/transactions',
    ACCOUNTS: '/api/accounts',
    ALERTS: '/api/alerts',
    PATTERNS: '/api/patterns',
    PROFILES: '/api/customers',
  },
  TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000'),
};
```

### Fetch Data from API

Replace mock data in components:

```typescript
// Before: Static mock data
const [transactions] = useState([...]);

// After: API data
const [transactions, setTransactions] = useState([]);

useEffect(() => {
  const fetchTransactions = async () => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TRANSACTIONS}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  fetchTransactions();
}, []);
```

## Chart Configuration

### Customize Chart Appearance

**File**: `src/pages/Dashboard.tsx`

```typescript
<LineChart data={transactionData}>
  <CartesianGrid 
    strokeDasharray="3 3" 
    stroke="rgba(255,255,255,0.1)" 
  />
  <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" />
  <YAxis stroke="rgba(255,255,255,0.6)" />
  <Tooltip
    contentStyle={{
      backgroundColor: '#1a2332',    // Custom bg
      border: '1px solid #00d4ff',   // Custom border
      borderRadius: '8px',
    }}
  />
  <Line
    type="monotone"
    dataKey="value"
    stroke="#00d4ff"                // Line color
    strokeWidth={2}
    dot={{ fill: '#00d4ff' }}       // Dot color
    name="Transaction Volume"
  />
</LineChart>
```

## Responsive Design Customization

Edit breakpoints in CSS files:

```css
/* Large Devices (Desktop) */
@media (min-width: 1200px) {
  .dashboard {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

/* Medium Devices (Tablet) */
@media (min-width: 768px) and (max-width: 1023px) {
  .dashboard {
    grid-template-columns: 1fr;
  }
}

/* Small Devices (Mobile) */
@media (max-width: 767px) {
  .dashboard {
    padding: 10px;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
```

## Performance Tuning

### Enable Code Splitting

Create `src/config/routes.ts`:

```typescript
import { lazy, Suspense } from 'react';

export const Dashboard = lazy(() => import('../pages/Dashboard'));
export const TransactionMonitoring = lazy(() => 
  import('../pages/TransactionMonitoring')
);
export const NetworkVisualization = lazy(() => 
  import('../pages/NetworkVisualization')
);
export const RiskProfiling = lazy(() => 
  import('../pages/RiskProfiling')
);
export const PatternAnalysis = lazy(() => 
  import('../pages/PatternAnalysis')
);

export const LoadingSpinner = () => (
  <div className="loading">Loading...</div>
);
```

Use in `src/App.tsx`:

```typescript
import { Dashboard, LoadingSpinner } from './config/routes';

<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/" element={<Dashboard />} />
    {/* Other routes */}
  </Routes>
</Suspense>
```

## Logging Configuration

Create `src/utils/logger.ts`:

```typescript
const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

const logger = {
  error: (message: string, error?: Error) => {
    console.error(message, error);
    if (process.env.REACT_APP_ENV === 'production') {
      // Send to error tracking service
    }
  },
  warn: (message: string) => console.warn(message),
  info: (message: string) => console.info(message),
  debug: (message: string) => {
    if (process.env.REACT_APP_ENABLE_LOGS === 'true') {
      console.debug(message);
    }
  },
};

export default logger;
```

## Theme Customization

Create `src/themes/theme.ts`:

```typescript
export const darkTheme = {
  primary: '#00d4ff',
  secondary: '#1a2332',
  danger: '#ff6b6b',
  warning: '#ffa500',
  success: '#4ade80',
  info: '#3498db',
  
  // Backgrounds
  bgPrimary: '#f5f7fa',
  bgSecondary: '#ffffff',
  bgDark: '#1a2332',
  
  // Text colors
  textPrimary: '#1a2332',
  textSecondary: '#666',
  textLight: '#999',
  
  // Borders
  borderColor: '#e0e0e0',
  borderLight: '#f0f0f0',
  
  // Shadows
  shadowSm: '0 2px 8px rgba(0, 0, 0, 0.08)',
  shadowMd: '0 4px 12px rgba(0, 0, 0, 0.12)',
  shadowLg: '0 8px 24px rgba(0, 0, 0, 0.15)',
};

export const lightTheme = {
  // Define light theme colors
};
```

## Feature Flags

Create `src/config/features.ts`:

```typescript
export const FEATURES = {
  ENABLE_EXPORT: process.env.REACT_APP_ENABLE_EXPORT === 'true',
  ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  ENABLE_NOTIFICATIONS: process.env.REACT_APP_ENABLE_NOTIFICATIONS === 'true',
  ENABLE_ADVANCED_FILTERS: true,
  ENABLE_NETWORK_VISUALIZATION: true,
  ENABLE_PATTERN_ANALYSIS: true,
};
```

Use in components:

```typescript
import { FEATURES } from '../config/features';

{FEATURES.ENABLE_EXPORT && (
  <button className="btn-export">
    <Download size={18} />
    Export
  </button>
)}
```

## Build Configuration

### Customize Webpack (if ejected)

```javascript
// After: npm eject

module.exports = {
  mode: 'production',
  entry: './src/index.tsx',
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'build'),
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
    },
  },
};
```

## Deployment Configuration

### Environment for Production

Create `.env.production`:

```env
REACT_APP_ENV=production
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_ENABLE_LOGS=false
REACT_APP_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### Security Headers

For Node.js/Express server:

```javascript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});
```

## Monitoring Integration

### Add Sentry Error Tracking

```typescript
import * as Sentry from "@sentry/react";

if (process.env.REACT_APP_ENV === 'production') {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.REACT_APP_ENV,
    tracesSampleRate: 0.1,
  });
}
```

## Testing Configuration

Create `src/setupTests.ts`:

```typescript
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

---

**Configuration Guide v1.0**
**Last Updated**: November 2025
