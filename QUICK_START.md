# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Prerequisites
- Node.js v14+ and npm installed

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm start

# 3. Open your browser
# The app will automatically open at http://localhost:3000
```

That's it! 🎉

## 📊 Features at a Glance

### 1️⃣ Dashboard
Click on **Dashboard** in the sidebar to see:
- 📈 Real-time threat metrics
- 📊 Transaction trends
- 🚨 Recent security alerts
- ⚠️ Risk distribution analysis

### 2️⃣ Transaction Monitoring
Navigate to **Transaction Monitor**:
- 🔍 View all transactions with risk scores
- 🔎 Search by transaction ID or account
- 🔽 Filter by type and status
- 📥 Export transaction data

### 3️⃣ Network Analysis
Go to **Network Analysis**:
- 🕸️ Interactive money trail visualization
- 🔗 See account relationships
- 🎮 Zoom and navigate the network
- 📊 View network statistics

### 4️⃣ Risk Profiling
Visit **Risk Profiling**:
- 👤 Customer risk scores
- 📈 Risk factor analysis
- ⚡ AI-powered insights
- 🎯 Red flag detection

### 5️⃣ Pattern Analysis
Check **Pattern Analysis**:
- 🔎 Detected suspicious patterns
- 📉 Risk evolution timeline
- 📊 Pattern confidence scores
- 🔬 Pattern characteristics

## 🎮 Interactive Controls

### Sidebar Navigation
- Click the menu icon (☰) to collapse/expand sidebar
- Select any page from the navigation menu
- Check system status in the footer

### Charts & Graphs
- **Hover** on charts for tooltips
- **Click** on legend items to toggle series
- **Zoom** using mouse wheel or touch gestures

### Network Visualization
- **Drag** nodes to reposition
- **Scroll** to zoom in/out
- **Click** on nodes to select
- Use **Control Panel** buttons for functions

### Tables & Data
- **Search** in the search box
- **Filter** using dropdown menus
- **Sort** by clicking column headers
- **Hover** for more information

## 💡 Tips & Tricks

1. **Dark Theme**: The interface uses a professional dark theme. All charts adapt automatically.

2. **Responsive**: Try resizing your browser window - the layout adapts!

3. **Export Data**: Use the export button to save transaction data as CSV.

4. **Real-time Updates**: In production, data updates in real-time using WebSocket connections.

5. **Pattern Highlighting**: Different colors indicate risk levels:
   - 🔴 Red = High Risk
   - 🟠 Orange = Medium Risk
   - 🟢 Green = Low Risk

## 📊 Sample Data Highlights

The demo includes:
- **5 accounts** with different risk levels
- **2 shell companies** involved in suspicious activity
- **50+ transactions** across multiple jurisdictions
- **5 major money laundering patterns** detected
- **22 monitored accounts** with risk scores

## 🔍 What to Look For

1. **Dashboard**
   - 24 active alerts
   - 8 high-risk accounts
   - 156 flagged transactions

2. **Transaction Monitor**
   - Rapid transfers to shell companies
   - Structured transactions below thresholds
   - Cross-border movements

3. **Network Analysis**
   - 5-layer money laundering scheme
   - Multiple shell company involvement
   - Geographic dispersion

4. **Risk Profiling**
   - High-risk customer: John Doe (Score: 92)
   - Medium-risk customer: Jane Smith (Score: 65)
   - Low-risk customer: Tech Corp Ltd (Score: 35)

5. **Pattern Analysis**
   - Structuring pattern (Confidence: 94%)
   - Round-tripping scheme (Confidence: 87%)
   - Multi-jurisdiction layering (Confidence: 85%)

## 🛠️ Customization

### Change Colors
Edit in component CSS files:
```css
--primary-color: #00d4ff;  /* Cyan */
--danger-color: #ff6b6b;   /* Red */
--success-color: #4ade80;  /* Green */
```

### Add Your Logo
Replace in `src/components/Sidebar.tsx`:
```tsx
<img src="/your-logo.png" alt="Logo" />
```

### Customize Header
Update page titles in each page component's header section.

## 🌐 API Integration

Ready to connect to real data? See `ARCHITECTURE.md` for integration points.

## 📞 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| F12 | Open Developer Tools |
| Ctrl+/ | Search in page |
| Ctrl+A | Select all |
| Escape | Close modals |

## 🐛 Troubleshooting

### Port 3000 already in use?
```bash
PORT=3001 npm start
```

### Module not found?
```bash
npm install --legacy-peer-deps
```

### Not seeing data?
- Check browser console (F12)
- Verify all components loaded
- Try refreshing the page

## 📚 Learn More

- **Dashboard**: Overview and metrics
- **Transaction Monitoring**: Real-time analysis
- **Network Visualization**: Relationship mapping
- **Risk Profiling**: Customer assessment
- **Pattern Analysis**: Behavior detection

## 🚀 Next Steps

1. ✅ Explore all pages
2. ✅ Try interactive features
3. ✅ Check different risk levels
4. ✅ Review pattern detection
5. ✅ Read full documentation

## 📖 Documentation Files

- `README.md` - Comprehensive documentation
- `INSTALLATION.md` - Detailed setup guide
- `ARCHITECTURE.md` - Technical architecture
- `QUICK_START.md` - This file

## 🎓 Learning Resources

### Understanding Money Laundering Detection

The three main phases shown:

**Phase 1: Placement** 💵
- Getting illicit funds into the financial system
- Characteristic: Large initial deposits

**Phase 2: Layering** 🔀
- Complex transactions to hide origin
- Characteristic: Multiple transfers between accounts

**Phase 3: Integration** 🏦
- Reinserting cleaned funds as legitimate
- Characteristic: Final destination accounts

### Patterns to Recognize

1. **Structuring**: Multiple small transactions to avoid thresholds
2. **Shell Companies**: Fake entities used as intermediaries
3. **Rapid Transfers**: Quick movement to confuse auditors
4. **Geographic Spread**: Cross-border complexity
5. **Trade-Based**: Goods invoicing manipulation

## 💬 Support

If you encounter issues:
1. Check browser console (F12)
2. Review error messages
3. See INSTALLATION.md for solutions
4. Contact development team

## 🎉 Ready to Go!

You now have a fully functional money laundering detection system. Start exploring!

---

**Happy Analyzing! 🔍**
