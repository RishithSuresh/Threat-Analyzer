const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { parse } = require('csv-parse');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Serve frontend static files from ../frontend
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Helper: parse CSV content (returns Promise)
function parseCSVContent(content){
  return new Promise((resolve, reject)=>{
    parse(content, { columns: true, trim: true }, (err, data)=>{
      if(err) return reject(err);
      resolve(data);
    });
  });
}

// Keep an in-memory current dataset and persist to disk when uploaded
const dataDir = path.join(frontendPath, 'data');
const currentDataPath = path.join(dataDir, 'current_dataset.csv');
let currentRows = null; // array of parsed rows

// Load persisted dataset at startup if present
if(!fs.existsSync(dataDir)){
  try{ fs.mkdirSync(dataDir, { recursive: true }); }catch(e){ console.warn('Could not create data dir', e); }
}
if(fs.existsSync(currentDataPath)){
  try{
    const content = fs.readFileSync(currentDataPath, 'utf8');
    parseCSVContent(content).then(rows=>{ currentRows = rows; }).catch(()=>{ currentRows = null; });
  }catch(e){ currentRows = null; }
}

// API: transactions - return current rows (uploaded) or error if none
app.get('/api/transactions', async (req, res) => {
  try{
    if(currentRows && Array.isArray(currentRows)) return res.json(currentRows);
    // no current dataset
    return res.status(404).json({ error: 'No dataset uploaded. Use POST /api/upload to provide a CSV.' });
  }catch(err){ res.status(500).json({ error: err.message }); }
});

// API: network - build simple network nodes/edges from transactions
app.get('/api/network', (req, res) => {
  try{
    const data = currentRows;
    if(!data || !Array.isArray(data)) return res.status(404).json({ error: 'No dataset uploaded' });
    const accounts = new Map();
    const edges = [];
    data.forEach(row=>{
      const from = row.from_account || row.from || row.From;
      const to = row.to_account || row.to || row.To;
      const amount = Number(row.amount || row.Amount || 0);
      if(from){ if(!accounts.has(from)) accounts.set(from, { id: from, label: from, value: 0, group: 'account' }); accounts.get(from).value += amount; }
      if(to){ if(!accounts.has(to)) accounts.set(to, { id: to, label: to, value: 0, group: 'account' }); accounts.get(to).value += amount; }
      if(from && to) edges.push({ from, to, label: `$${amount.toLocaleString()}` });
    });
    res.json({ nodes: Array.from(accounts.values()), edges });
  }catch(err){ res.status(500).json({ error: err.message }); }
});

// API: upload CSV, analyze and return rows + analysis + network
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const content = req.file.buffer.toString('utf8');
  parseCSVContent(content).then(rawData=>{
    // --- Column mapping ---
    // Try to map columns to: id, date, from_account, to_account, amount, risk, status
    const headerMap = {};
    const sample = rawData[0] || {};
    const lowerKeys = Object.keys(sample).map(k=>k.toLowerCase());
    function findCol(possibles){
      for(const p of possibles){
        const idx = lowerKeys.findIndex(k=>k.includes(p));
        if(idx!==-1) return Object.keys(sample)[idx];
      }
      return null;
    }
    const map = {
      id: findCol(['id','txn','tx','transaction']),
      date: findCol(['date','time','timestamp']),
      from_account: findCol(['from','sender','source','debit']),
      to_account: findCol(['to','receiver','dest','credit']),
      amount: findCol(['amount','value','amt','sum']),
      risk: findCol(['risk','score','threat']),
      status: findCol(['status','flag','block'])
    };
    // Check for missing required columns
    const missing = Object.entries(map).filter(([k,v])=>!v).map(([k])=>k);
    if(missing.length){
      return res.status(400).json({ error: `Missing required column(s): ${missing.join(', ')}` });
    }
    // Normalize all rows
    const data = rawData.map(row=>({
      id: row[map.id] || '',
      date: row[map.date] || '',
      from_account: row[map.from_account] || '',
      to_account: row[map.to_account] || '',
      amount: row[map.amount] || '',
      risk: row[map.risk] || '',
      status: row[map.status] || ''
    }));
    // Save normalized CSV to disk as current dataset
    try{
      const csvHeader = 'id,date,from_account,to_account,amount,risk,status\n';
      const csvRows = data.map(r=>[r.id,r.date,r.from_account,r.to_account,r.amount,r.risk,r.status].join(','));
      fs.writeFileSync(currentDataPath, csvHeader+csvRows.join('\n'), 'utf8');
    }catch(e){ console.warn('Could not persist dataset', e); }
    currentRows = data;

    // basic analysis
    const analysis = { totalTransactions: data.length, totalVolume: 0, avgRisk: 0, riskCounts: { high:0, medium:0, low:0 } };
    let riskSum = 0;
    const accounts = new Map();
    const edges = [];
    data.forEach(r=>{
      const amount = Number(r.amount || 0);
      const risk = Number(r.risk || 0);
      analysis.totalVolume += amount;
      riskSum += risk;
      if(risk >= 80) analysis.riskCounts.high += 1;
      else if(risk >= 60) analysis.riskCounts.medium += 1;
      else analysis.riskCounts.low += 1;
      const from = r.from_account;
      const to = r.to_account;
      if(from){ if(!accounts.has(from)) accounts.set(from, { id: from, label: from, value: 0, group: 'account' }); accounts.get(from).value += amount; }
      if(to){ if(!accounts.has(to)) accounts.set(to, { id: to, label: to, value: 0, group: 'account' }); accounts.get(to).value += amount; }
      if(from && to) edges.push({ from, to, label: `$${amount.toLocaleString()}` });
    });
    analysis.avgRisk = data.length ? Math.round(riskSum / data.length) : 0;

    res.json({ rows: data, analysis, nodes: Array.from(accounts.values()), edges });
  }).catch(err=> res.status(500).json({ error: err.message }));
});

// API: summary for dashboard
app.get('/api/summary', (req, res)=>{
  try{
    const data = currentRows;
    if(!data) return res.status(404).json({ error: 'No dataset uploaded' });
    const totalTx = data.length;
    const totalVolume = data.reduce((s,r)=> s + Number(r.amount||r.Amount||0), 0);
    const highRisk = data.filter(r=> Number(r.risk||r.Risk||0) >= 80).length;
    const flagged = data.filter(r=> (r.status||'').toLowerCase() === 'flagged').length;
    const monitoredAccounts = new Set();
    data.forEach(r=>{ if(r.from_account) monitoredAccounts.add(r.from_account); if(r.to_account) monitoredAccounts.add(r.to_account); });
    res.json({ totalTx, totalVolume, highRisk, flagged, monitoredAccounts: monitoredAccounts.size });
  }catch(err){ res.status(500).json({ error: err.message }); }
});

// API: risk profiles per account
app.get('/api/risk-profiles', (req, res)=>{
  try{
    const data = currentRows;
    if(!data) return res.status(404).json({ error: 'No dataset uploaded' });
    const byAccount = new Map();
    data.forEach(r=>{
      const acct = r.from_account || r.from || r.From;
      const risk = Number(r.risk||r.Risk||0);
      const amount = Number(r.amount||r.Amount||0);
      if(!acct) return;
      if(!byAccount.has(acct)) byAccount.set(acct, { account: acct, txCount:0, totalVolume:0, riskSum:0 });
      const s = byAccount.get(acct);
      s.txCount += 1; s.totalVolume += amount; s.riskSum += risk;
    });
    const profiles = Array.from(byAccount.values()).map(p=>({ account: p.account, txCount: p.txCount, totalVolume: p.totalVolume, avgRisk: Math.round(p.riskSum / p.txCount) }));
    profiles.sort((a,b)=>b.totalVolume - a.totalVolume);
    res.json(profiles);
  }catch(err){ res.status(500).json({ error: err.message }); }
});

// API: pattern detection (simple heuristics)
app.get('/api/patterns', (req, res)=>{
  try{
    const data = currentRows;
    if(!data) return res.status(404).json({ error: 'No dataset uploaded' });
    const patterns = [];
    // 1) Structured transactions: many small similar transactions from same account
    const byFrom = {};
    data.forEach(r=>{ const from = r.from_account||r.from||r.From; const amt = Number(r.amount||r.Amount||0); if(!from) return; byFrom[from] = byFrom[from]||[]; byFrom[from].push(amt); });
    Object.keys(byFrom).forEach(acct=>{
      const txs = byFrom[acct];
      if(txs.length >= 5){
        const avg = txs.reduce((a,b)=>a+b,0)/txs.length;
        const smallCount = txs.filter(x=>x && x < avg*0.5).length;
        if(smallCount / txs.length > 0.6){ patterns.push({ id:`PAT-STRUCT-${acct}`, name:'Structured Transactions', account: acct, severity:'HIGH', confidence: Math.round((smallCount/txs.length)*100) }); }
      }
    });
    // 2) Round-tripping A->B->A quick pairs
    const pairs = new Set();
    const seen = new Map();
    data.forEach(r=>{ const from = r.from_account||r.from||r.From; const to = r.to_account||r.to||r.To; if(!from||!to) return; const key = `${from}->${to}`; seen.set(key, (seen.get(key)||0)+1); });
    seen.forEach((count,key)=>{
      const [a,b] = key.split('->');
      if(seen.get(`${b}->${a}`)) patterns.push({ id:`PAT-RT-${a}-${b}`, name:'Round-Tripping', accounts:[a,b], severity:'MED', confidence:50 });
    });
    res.json(patterns);
  }catch(err){ res.status(500).json({ error: err.message }); }
});

// Fallback route - serve index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, ()=>console.log(`Backend server listening on http://localhost:${PORT}`));
