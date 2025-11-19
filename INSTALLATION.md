# Installation & Setup Guide

## System Requirements

- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher (comes with Node.js)
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **RAM**: Minimum 4GB
- **Disk Space**: Minimum 2GB

## Step-by-Step Installation

### 1. Prerequisites Check

Verify Node.js and npm installation:

```bash
node --version
npm --version
```

You should see version numbers like:
```
v16.13.0
8.1.0
```

### 2. Clone the Repository

```bash
git clone https://github.com/RishithSuresh/Threat-Analyzer.git
cd Threat-Analyzer
```

### 3. Install Dependencies

```bash
npm install
```

This will install all required packages specified in `package.json`:
- React and React DOM
- React Router
- Vis-Network (for network visualization)
- Recharts (for charting)
- Lucide React (icons)
- And other dependencies

### 4. Configuration

Create a `.env` file in the project root (optional):

```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENV=development
```

### 5. Start Development Server

```bash
npm start
```

The application will automatically open at `http://localhost:3000`

If it doesn't open automatically, open your browser and navigate to:
```
http://localhost:3000
```

### 6. Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## Troubleshooting

### Issue: Dependencies Installation Fails

**Solution 1**: Clear npm cache
```bash
npm cache clean --force
npm install
```

**Solution 2**: Use different registry
```bash
npm install --registry https://registry.npmjs.org
```

**Solution 3**: Delete node_modules and reinstall
```bash
rm -r node_modules package-lock.json
npm install
```

### Issue: Port 3000 Already in Use

**Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -i :3000
kill -9 <PID>
```

Or start on different port:
```bash
PORT=3001 npm start
```

### Issue: Module Not Found Errors

Ensure all dependencies are installed:
```bash
npm install --legacy-peer-deps
```

### Issue: Blank Page/Module Errors in Browser

Clear browser cache:
1. Press `Ctrl+Shift+Delete` (or `Cmd+Shift+Delete` on Mac)
2. Clear browsing data
3. Reload page

### Issue: Network Visualization Not Displaying

Ensure vis-network is installed:
```bash
npm install vis-network --save
```

## Features Overview

After installation, you'll have access to:

### 📊 Dashboard
- Real-time threat overview
- Key metrics and statistics
- Trend visualization
- Recent alerts

### 💳 Transaction Monitoring
- Real-time transaction analysis
- Advanced filtering
- Risk scoring
- Pattern detection

### 🕸️ Network Visualization
- Interactive spider maps
- Money trail visualization
- Account relationship mapping
- Zoom and export controls

### 🎯 Risk Profiling
- Customer risk scoring
- Behavioral analysis
- AI-powered insights
- Profile management

### 🔍 Pattern Analysis
- Detection pattern identification
- Confidence scoring
- Behavioral characteristics
- Timeline analysis

## Development Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject (not reversible - use with caution)
npm eject
```

## Project Structure

```
Threat-Analyzer/
├── src/
│   ├── components/          # Reusable components
│   ├── pages/              # Page components
│   ├── App.tsx             # Main app
│   ├── index.tsx           # Entry point
│   └── *.css               # Styling
├── public/
│   ├── index.html          # HTML template
│   └── manifest.json       # PWA manifest
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
└── README.md               # Documentation
```

## Browser Support

| Browser | Minimum Version | Notes |
|---------|-----------------|-------|
| Chrome  | 90+            | Full support |
| Firefox | 88+            | Full support |
| Safari  | 14+            | Full support |
| Edge    | 90+            | Full support |
| IE 11   | Not supported  | Use modern browsers |

## Performance Tips

1. **Enable Developer Tools**
   - Press F12 to open DevTools
   - Monitor Network and Performance tabs
   - Check Console for errors

2. **Optimize Data Loading**
   - Filter large datasets
   - Use pagination
   - Implement caching

3. **Browser Performance**
   - Clear cache regularly
   - Disable unused extensions
   - Update to latest version

## Next Steps

1. **Familiarize with the Dashboard**
   - Navigate through all pages
   - Explore interactive features
   - Review sample data

2. **Customize Components**
   - Modify colors in CSS files
   - Update branding in Sidebar
   - Add your company logo

3. **Integrate Backend API**
   - Replace mock data with real API calls
   - Configure API endpoints in `.env`
   - Implement authentication

4. **Deploy Application**
   - Build for production: `npm run build`
   - Deploy to Netlify, Vercel, or your server
   - Set up CI/CD pipeline

## Getting Help

- **Documentation**: See `README.md`
- **Issues**: Check GitHub Issues
- **Discussions**: Start a discussion thread
- **Email**: Contact development team

## Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Recharts Documentation](https://recharts.org)
- [Vis-Network Documentation](https://visjs.github.io/vis-network/docs/network/)

## Tips for Success

1. **Start Small**: Master one feature at a time
2. **Read the Code**: Understand how components work
3. **Experiment**: Try modifying the code
4. **Use DevTools**: Debug and inspect elements
5. **Keep Updated**: Update dependencies regularly

---

**Version**: 1.0.0
**Last Updated**: November 2025
