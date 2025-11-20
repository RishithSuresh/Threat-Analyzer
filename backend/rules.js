// Simple rules engine for Transaction Monitoring
// Exports evaluateRules(rows, options) => Array of alerts
// Each alert: { id, name, severity, account?, description, matchedTxIds: [] }

function makeId(prefix){
  return prefix + '-' + Date.now() + '-' + Math.floor(Math.random()*10000);
}

function evaluateRules(rows = [], options = {}){
  const alerts = [];
  const highAmountThreshold = options.highAmountThreshold || 100000; // configurable
  const frequentWindow = options.frequentWindow || 24 * 60 * 60 * 1000; // 24h
  const frequentCount = options.frequentCount || 10;

  // Rule 1: single very large transactions
  rows.forEach(r=>{
    const amount = Number(r.amount || r.Amount || 0);
    if(amount && amount >= highAmountThreshold){
      alerts.push({ id: makeId('ALR-HIGH-AMT'), name: 'High value transaction', severity: 'HIGH', account: r.from_account||r.from||'', description: `Transaction of $${amount.toLocaleString()} exceeds threshold ${highAmountThreshold}`, matchedTxIds: [r.id || r.transaction_id || ''] });
    }
  });

  // Rule 2: rapid frequent outgoing tx from same account
  const byFrom = new Map();
  rows.forEach(r=>{
    const from = r.from_account || r.from || '';
    if(!from) return;
    const ts = new Date(r.date || r.timestamp || r.Time || Date.now()).getTime();
    if(!byFrom.has(from)) byFrom.set(from, []);
    byFrom.get(from).push({ ts, id: r.id || r.transaction_id || '' });
  });
  byFrom.forEach((list, acct)=>{
    list.sort((a,b)=>a.ts - b.ts);
    // sliding window count
    let i=0, j=0;
    while(i < list.length){
      while(j < list.length && list[j].ts - list[i].ts <= frequentWindow) j++;
      const count = j - i;
      if(count >= frequentCount){
        const matched = list.slice(i,j).map(x=>x.id);
        alerts.push({ id: makeId('ALR-FREQ'), name: 'Frequent outgoing transactions', severity: 'MED', account: acct, description: `${count} transactions within ${Math.round(frequentWindow/3600000)}h`, matchedTxIds: matched });
        break; // one alert per account
      }
      i++;
    }
  });

  // Rule 3: flagged statuses
  rows.forEach(r=>{
    const status = (r.status||'').toString().toLowerCase();
    if(status === 'flagged' || status === 'suspicious'){
      alerts.push({ id: makeId('ALR-FLAG'), name: 'Flagged transaction', severity: 'HIGH', account: r.from_account||r.from||'', description: `Transaction marked as ${r.status}`, matchedTxIds: [r.id||r.transaction_id||''] });
    }
  });

  // De-duplicate alerts by description+account
  const seen = new Set();
  const dedup = [];
  alerts.forEach(a=>{
    const key = `${a.name}::${a.account}::${a.description}`;
    if(!seen.has(key)){ seen.add(key); dedup.push(a); }
  });
  return dedup;
}

module.exports = { evaluateRules };
