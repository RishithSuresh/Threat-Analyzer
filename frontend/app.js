// Simple view navigation
document.querySelectorAll('.nav button').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const view=btn.dataset.view;
    document.querySelectorAll('.view').forEach(s=>s.style.display='none');
    const el=document.getElementById(view);
    if(el) el.style.display='block';
  });
});

// When view changes, refresh data for that view
function refreshView(view){
  if(view === 'dashboard') fetchSummary();
  if(view === 'transactions') loadTransactions();
  if(view === 'network') fetch('/api/network').then(r=>r.json()).then(setupNetwork).catch(()=>{});
  if(view === 'risk') fetchRiskProfiles();
  if(view === 'patterns') fetchPatterns();
}

// Load transactions from API (fallback to local CSV path if API not available)
async function loadTransactions(){
  const tbody = document.querySelector('#txTable tbody');
  try{
    const res = await fetch('/api/transactions');
    if(!res.ok) throw new Error('API fetch failed');
    const data = await res.json();
    populateTable(data);
    populateCharts(data);
  } catch(e){
    // fallback: fetch local CSV
    try{
      const csvRes = await fetch('data/detailed_transaction_data.csv');
      const text = await csvRes.text();
      const rows = parseCSV(text);
      populateTable(rows);
      populateCharts(rows);
    } catch(err){
      console.warn('Failed to load transactions', err);
    }
  }
}

function populateTable(data){
  const tbody = document.querySelector('#txTable tbody');
  tbody.innerHTML = '';
  data.forEach(t=>{
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>${t.id||t.id}</td><td>${t.date||t.date}</td><td>${t.from_account||t.from||t.from_account||''}</td><td>${t.to_account||t.to||t.to_account||''}</td><td>$${(Number(t.amount)||0).toLocaleString()}</td><td>${t.risk||t.Risk||''}</td><td>${t.status||''}</td>`;
    tbody.appendChild(tr);
  });
}

function parseCSV(text){
  const rows = [];
  const lines = text.split(/\r?\n/).filter(l=>l.trim()!=='');
  if(lines.length===0) return rows;
  const headers = lines[0].split(/,(?=(?:[^"]*"[^"]*")*[^\"]*$)/).map(h=>h.replace(/^"|"$/g,'').trim());
  for(let i=1;i<lines.length;i++){
    const cols = lines[i].split(/,(?=(?:[^"]*"[^"]*")*[^\"]*$)/).map(c=>c.replace(/^"|"$/g,'').trim());
    const obj={};
    for(let j=0;j<headers.length;j++) obj[headers[j]] = cols[j] || '';
    rows.push(obj);
  }
  return rows;
}

function populateCharts(data){
  // simple line chart using date aggregation
  try{
    const agg = aggregateForLineChart(data);
    if(window.lineChart){
      window.lineChart.data.labels = agg.labels;
      window.lineChart.data.datasets[0].data = agg.amounts;
      window.lineChart.data.datasets[1].data = agg.avgRisk;
      window.lineChart.update();
    }
  }catch(e){ console.warn(e); }
}

function aggregateForLineChart(data){
  const byDate = {};
  data.forEach(r=>{
    const d = (r.date||'').split(' ')[0];
    const amount = Number(r.amount||r.Amount||0);
    const risk = Number(r.risk||r.Risk||0);
    if(!byDate[d]) byDate[d] = {amount:0,riskSum:0,count:0};
    byDate[d].amount += amount;
    byDate[d].riskSum += risk;
    byDate[d].count += 1;
  });
  const labels = Object.keys(byDate).sort();
  const amounts = labels.map(d=>byDate[d].amount);
  const avgRisk = labels.map(d=> Math.round(byDate[d].riskSum / Math.max(1, byDate[d].count)) );
  return {labels,amounts,avgRisk};
}

// Chart initialization
document.addEventListener('DOMContentLoaded', ()=>{
  const lineCtx = document.getElementById('lineChart').getContext('2d');
  window.lineChart = new Chart(lineCtx,{
    type:'line',
    data:{labels:[],datasets:[{label:'Volume',data:[],borderColor:'#00d4ff',backgroundColor:'rgba(0,212,255,0.08)',fill:true},{label:'Risk Score',data:[],borderColor:'#ff6b6b',backgroundColor:'rgba(255,107,107,0.06)',fill:true}]},
    options:{responsive:true,plugins:{legend:{position:'top'}}}
  });

  const barCtx = document.getElementById('barChart').getContext('2d');
  window.barChart = new Chart(barCtx,{type:'bar',data:{labels:['Personal','Corporate','Shell Co.'],datasets:[{label:'Count',data:[0,0,0],backgroundColor:['#ff6b6b','#ffa500','#4ade80']}]},options:{responsive:true,plugins:{legend:{display:false}}}});

  loadTransactions();

  // build network after data loaded from API separately
  fetch('/api/network').then(r=>r.json()).then(setupNetwork).catch(err=>{
    // fallback: build simple static network from hardcoded sample
    console.warn('network API failed', err);
  });
  // wire upload UI
  const fileInput = document.getElementById('fileInput');
  const uploadBtn = document.getElementById('uploadBtn');
  const uploadStatus = document.getElementById('uploadStatus');
  uploadBtn.addEventListener('click', async ()=>{
    if(!fileInput.files || fileInput.files.length===0){ uploadStatus.textContent = 'Choose a CSV file first'; return; }
    const f = fileInput.files[0];
    uploadStatus.textContent = 'Uploading...';
    const fd = new FormData(); fd.append('file', f);
    try{
      const res = await fetch('/api/upload',{ method: 'POST', body: fd });
      if(!res.ok) throw new Error('Upload failed');
      const payload = await res.json();
      uploadStatus.textContent = 'Analysis complete';
      if(payload.rows) populateTable(payload.rows);
      if(payload.analysis){
        const summaryEl = document.getElementById('analysisSummary');
        summaryEl.innerHTML = `<div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:8px">
          <div class="card"><strong>Total Tx</strong><div>${payload.analysis.totalTransactions}</div></div>
          <div class="card"><strong>Total Volume</strong><div>$${Number(payload.analysis.totalVolume).toLocaleString()}</div></div>
          <div class="card"><strong>Avg Risk</strong><div>${payload.analysis.avgRisk}</div></div>
          <div class="card"><strong>Risk (H/M/L)</strong><div>${payload.analysis.riskCounts.high}/${payload.analysis.riskCounts.medium}/${payload.analysis.riskCounts.low}</div></div>
        </div>`;

        // Update / create Risk Distribution pie chart
        try{
          const riskCounts = payload.analysis.riskCounts || {low:0,medium:0,high:0};
          const pieEl = document.getElementById('riskPie');
          if(pieEl){
            const pieCtx = pieEl.getContext('2d');
            const pieData = [riskCounts.low, riskCounts.medium, riskCounts.high];
            if(window.riskPieChart){
              window.riskPieChart.data.datasets[0].data = pieData;
              window.riskPieChart.update();
            } else {
              window.riskPieChart = new Chart(pieCtx,{
                type: 'doughnut',
                data: { labels: ['Low','Medium','High'], datasets: [{ data: pieData, backgroundColor: ['#4ade80','#ffa500','#ff6b6b'] }] },
                options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
              });
            }
          }
        }catch(e){ console.warn('pie chart error', e); }

        // Update / create Summary bar chart (Total Tx, Total Volume (K), Avg Risk)
        try{
          const totalTx = Number(payload.analysis.totalTransactions) || 0;
          const totalVolK = Math.round((Number(payload.analysis.totalVolume) || 0) / 1000);
          const avgRisk = Number(payload.analysis.avgRisk) || 0;
          const barEl2 = document.getElementById('volumeBar');
          if(barEl2){
            const bctx = barEl2.getContext('2d');
            const barData = [totalTx, totalVolK, avgRisk];
            if(window.volumeBarChart){
              window.volumeBarChart.data.datasets[0].data = barData;
              window.volumeBarChart.update();
            } else {
              window.volumeBarChart = new Chart(bctx,{
                type:'bar',
                data: { labels: ['Total Tx','Total Volume (K)','Avg Risk'], datasets: [{ label: 'Value', data: barData, backgroundColor: ['#3498db','#9b59b6','#ff6b6b'] }] },
                options: { responsive:true, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}} }
              });
            }
          }
        }catch(e){ console.warn('bar chart error', e); }
      }
      if(payload.nodes && payload.edges) setupNetwork({ nodes: payload.nodes, edges: payload.edges });
      // refresh other views/metrics
      fetchSummary();
      fetchRiskProfiles();
      fetchPatterns();
    }catch(err){ uploadStatus.textContent = 'Upload failed'; console.error(err); }
  });
});

// Fetch dashboard summary and update UI
async function fetchSummary(){
  try{
    const res = await fetch('/api/summary');
    if(!res.ok) throw new Error('No dataset');
    const s = await res.json();
    document.getElementById('activeAlerts').textContent = s.highRisk || 0;
    document.getElementById('highRiskAccounts').textContent = s.highRisk || 0;
    document.getElementById('flaggedTx').textContent = s.flagged || 0;
    document.getElementById('monitoredAccounts').textContent = s.monitoredAccounts || 0;
    // update line chart data if possible: fetch transactions and update line chart
    const txRes = await fetch('/api/transactions');
    if(txRes.ok){ const rows = await txRes.json(); populateCharts(rows); }
  }catch(e){ console.warn('Summary fetch', e); }
}

// Fetch risk profiles and render cards
async function fetchRiskProfiles(){
  try{
    const res = await fetch('/api/risk-profiles');
    if(!res.ok) throw new Error('No dataset');
    const profiles = await res.json();
    const container = document.getElementById('riskProfiles');
    container.innerHTML = '';
    profiles.slice(0,12).forEach(p=>{
      const card = document.createElement('div'); card.className='card';
      card.innerHTML = `<strong>${p.account}</strong><div>Tx: ${p.txCount} • Volume: $${Number(p.totalVolume).toLocaleString()} • Avg Risk: <span style="color:${p.avgRisk>=80?'#ff6b6b':p.avgRisk>=60?'#ffa500':'#4ade80'}">${p.avgRisk}</span></div>`;
      container.appendChild(card);
    });
  }catch(e){ console.warn('risk profiles', e); }
}

// Fetch patterns and render table
async function fetchPatterns(){
  try{
    const res = await fetch('/api/patterns');
    if(!res.ok) throw new Error('No dataset');
    const patterns = await res.json();
    const tbody = document.getElementById('patternsBody');
    tbody.innerHTML = '';
    patterns.forEach(p=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${p.id||''}</td><td>${p.name||''}${p.account?(' — '+p.account):''}${p.accounts?(' — '+p.accounts.join(',')):''}</td><td style="color:${p.severity==='HIGH'||p.severity==='CRITICAL'?'#ff3333':p.severity==='MED'?'#ff6b6b':'#ffa500'}">${p.severity||'MED'}</td><td>${p.confidence?p.confidence+'%':''}</td>`;
      tbody.appendChild(tr);
    });
  }catch(e){ console.warn('patterns', e); }
}

// enhance nav buttons to refresh view on click
document.querySelectorAll('.nav button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const view = btn.dataset.view;
    // small timeout to allow DOM display switch then refresh
    setTimeout(()=> refreshView(view), 150);
  });
});

// initial fetches
document.addEventListener('DOMContentLoaded', ()=>{
  // refresh current active view
  const active = document.querySelector('.nav button.active');
  if(active) refreshView(active.dataset.view);
});

function setupNetwork(payload){
  const nodes = new vis.DataSet(payload.nodes || []);
  const edges = new vis.DataSet(payload.edges || []);
  const container = document.getElementById('networkViz');
  const data = {nodes, edges};
  const options = {nodes:{shape:'dot',scaling:{min:12,max:48},font:{size:14}},edges:{smooth:{enabled:true}},physics:{enabled:false}};
  const network = new vis.Network(container, data, options);
  network.fit({animation:{duration:400}});
}
