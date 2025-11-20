const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const dataDir = path.join(repoRoot, 'frontend', 'data');
const detailedPath = path.join(dataDir, 'detailed_transaction_data.csv');
const currentPath = path.join(dataDir, 'current_dataset.csv');

function parseCsvLines(content){
  // split lines, handle CRLF
  const lines = content.split(/\r?\n/).filter(l=>l.trim().length>0);
  return lines.map(l=>{
    // naive split on comma, preserves simple CSV since data has no embedded commas
    return l.split(',');
  });
}

function run(){
  if(!fs.existsSync(detailedPath)){
    console.error('Detailed file not found:', detailedPath);
    process.exit(2);
  }
  if(!fs.existsSync(currentPath)){
    console.error('Current dataset not found:', currentPath);
    process.exit(2);
  }

  const detailed = fs.readFileSync(detailedPath, 'utf8');
  const current = fs.readFileSync(currentPath, 'utf8');

  const dLines = parseCsvLines(detailed);
  const cLines = parseCsvLines(current);

  // find index of transaction_id (or first column) and ip column in detailed
  const dHeader = dLines[0].map(h=>h.trim().toLowerCase());
  const txIdIdx = dHeader.findIndex(h=>h.includes('transaction') || h === 'transaction_id' || h === 'transactionid');
  const ipIdx = dHeader.findIndex(h=>h.includes('ip'));
  if(txIdIdx === -1) {
    console.error('Could not find transaction_id column in detailed file header');
    process.exit(3);
  }
  if(ipIdx === -1){
    console.error('Could not find ip column in detailed file header');
    process.exit(3);
  }

  // build map txId -> ip
  const ipMap = new Map();
  for(let i=1;i<dLines.length;i++){
    const row = dLines[i];
    const tx = row[txIdIdx] ? row[txIdIdx].trim() : '';
    const ip = row[ipIdx] ? row[ipIdx].trim() : '';
    if(tx) ipMap.set(tx, ip);
  }

  // update current CSV header to include ip if missing
  const cHeader = cLines[0].map(h=>h.trim());
  let hasIp = cHeader.map(h=>h.toLowerCase()).includes('ip');
  if(!hasIp) cHeader.push('ip');

  const outLines = [];
  outLines.push(cHeader.join(','));

  // find id column index in current (id or transaction id)
  const idIdx = cLines[0].map(h=>h.toLowerCase()).findIndex(h=>h === 'id' || h.includes('transaction'));
  if(idIdx === -1){
    console.error('Could not find id/transaction column in current dataset');
    process.exit(4);
  }

  for(let i=1;i<cLines.length;i++){
    const crow = cLines[i].slice();
    const id = crow[idIdx] ? crow[idIdx].trim() : '';
    const ip = ipMap.get(id) || '';
    if(!hasIp) crow.push(ip);
    else {
      // replace existing ip column if present
      const ipColIdx = cLines[0].map(h=>h.toLowerCase()).findIndex(h=>h==='ip');
      if(ipColIdx !== -1){
        // ensure row is long enough
        while(crow.length <= ipColIdx) crow.push('');
        crow[ipColIdx] = ip;
      } else {
        crow.push(ip);
      }
    }
    outLines.push(crow.join(','));
  }

  fs.writeFileSync(currentPath, outLines.join('\n'), 'utf8');
  console.log('Merged IPs into', currentPath);
}

run();
