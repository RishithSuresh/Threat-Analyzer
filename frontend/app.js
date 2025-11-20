// Navigation binding will be attached on DOMContentLoaded to avoid early DOM access
// Global error overlay to help debug runtime failures in the browser
try{
  window.addEventListener('error', function(ev){
    try{
      const msg = (ev && ev.message) ? ev.message : String(ev);
      let el = document.getElementById('jsErrorOverlay');
      if(!el){ el = document.createElement('div'); el.id = 'jsErrorOverlay'; el.style.position='fixed'; el.style.right='12px'; el.style.top='12px'; el.style.zIndex=99999; el.style.background='rgba(255,50,50,0.95)'; el.style.color='#fff'; el.style.padding='12px'; el.style.borderRadius='6px'; el.style.maxWidth='480px'; el.style.fontFamily='sans-serif'; el.style.fontSize='13px'; document.body && document.body.appendChild(el); }
      el.innerText = 'JS Error: ' + msg;
    }catch(e){}
  });
  window.addEventListener('unhandledrejection', function(ev){
    try{ const el = document.getElementById('jsErrorOverlay'); if(el) el.innerText = 'Unhandled Rejection: ' + (ev && ev.reason? (ev.reason.message||String(ev.reason)) : String(ev)); }catch(e){} });
}catch(e){}

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
    populateAlerts(data);
  } catch(e){
    // fallback: fetch local CSV
    try{
      const csvRes = await fetch('data/detailed_transaction_data.csv');
      const text = await csvRes.text();
      const rows = parseCSV(text);
      populateTable(rows);
        populateCharts(rows);
        populateAlerts(rows);
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
    tr.innerHTML = `<td>${t.id||''}</td><td>${t.date||''}</td><td>${t.from_account||t.from||''}</td><td>${t.to_account||t.to||''}</td><td>$${(Number(t.amount)||0).toLocaleString()}</td><td>${t.risk||''}</td><td>${t.status||''}</td>`;
    tbody.appendChild(tr);
  });
}

// Build and update dashboard charts from transaction rows
function populateCharts(rows){
  try{
    if(!Array.isArray(rows)) return;

    // Aggregate by day (attempt to parse common date formats)
    const byDay = {};
    rows.forEach(r=>{
      const rawDate = r.date || r.Date || '';
      let d = null;
      if(rawDate){
        // Try ISO parse first
        const t = new Date(rawDate);
        if(!isNaN(t)) d = t;
        else {
          // try dd/mm/yyyy or dd/mm/yyyy hh:mm
          const parts = rawDate.split(' ')[0].split('/');
          if(parts.length===3){
            const iso = `${parts[2]}-${parts[0].padStart(2,'0')}-${parts[1].padStart(2,'0')}`;
            const tt = new Date(iso);
            if(!isNaN(tt)) d = tt;
          }
        }
      }
      const day = d && !isNaN(d) ? d.toISOString().slice(0,10) : 'unknown';
      if(!byDay[day]) byDay[day] = { volume:0, riskSum:0, count:0 };
      const amt = Number(r.amount || r.Amount || 0) || 0;
      const risk = Number(r.risk || r.Risk || 0) || 0;
      byDay[day].volume += amt;
      byDay[day].riskSum += risk;
      byDay[day].count += 1;
    });

    const days = Object.keys(byDay).sort();
    const volumeSeries = days.map(d=> Math.round(byDay[d].volume));
    const avgRiskSeries = days.map(d=> Math.round(byDay[d].riskSum / Math.max(1, byDay[d].count)));
    const txCountSeries = days.map(d=> byDay[d].count || 0);

    // Update line chart (volume + avg risk)
    if(window.lineChart){
      window.lineChart.data.labels = days;
      if(window.lineChart.data.datasets && window.lineChart.data.datasets.length>=3){
        window.lineChart.data.datasets[0].data = volumeSeries;
        window.lineChart.data.datasets[1].data = avgRiskSeries;
        window.lineChart.data.datasets[2].data = txCountSeries;
      }
      window.lineChart.update();
    }

    // Update status counts in small bar chart
    const counts = { normal:0, flagged:0, other:0 };
    rows.forEach(r=>{
      const s = (r.status || r.Status || '').toString().toLowerCase();
      if(s.includes('flag')) counts.flagged++;
      else if(s.includes('normal')) counts.normal++;
      else counts.other++;
    });
    if(window.barChart){
      window.barChart.data.datasets[0].data = [counts.normal, counts.flagged, counts.other];
      window.barChart.update();
    }
  }catch(e){ console.warn('populateCharts failed', e); }
}

// Compute Recent Alerts from transaction rows and render into the Recent Alerts table
function populateAlerts(rows){
  try{
    if(!Array.isArray(rows)) return;
    // Heuristic: consider flagged transactions and high-risk transactions
    const candidates = rows.map(r=>({
      id: r.id || r.ID || '',
      account: r.from_account || r.from || r.fromAccount || r.Account || r.account || '',
      amount: Number(r.amount || r.Amount || 0) || 0,
      risk: Number(r.risk || r.Risk || 0) || 0,
      status: (r.status || r.Status || '').toString(),
      raw: r
    }));

    // Prefer FLAGGED rows, then high risk, then by amount
    candidates.sort((a,b)=>{
      const aFlag = (a.status||'').toLowerCase().includes('flag') ? 1:0;
      const bFlag = (b.status||'').toLowerCase().includes('flag') ? 1:0;
      if(aFlag !== bFlag) return bFlag - aFlag;
      if(a.risk !== b.risk) return b.risk - a.risk;
      return b.amount - a.amount;
    });

    const top = candidates.slice(0,3);
    const tbody = document.querySelector('.card table.table tbody');
    if(!tbody) return;
    // Clear existing rows in Recent Alerts tbody only (keep other tables intact)
    // We select the Recent Alerts card specifically by matching header text
    // Find the Recent Alerts card's tbody if possible
    let alertsTbody = null;
    document.querySelectorAll('.card').forEach(card=>{
      const h3 = card.querySelector('h3');
      if(h3 && h3.textContent && h3.textContent.trim().toLowerCase().includes('recent alerts')){
        const tb = card.querySelector('table.table tbody');
        if(tb) alertsTbody = tb;
      }
    });
    if(!alertsTbody) alertsTbody = tbody;

    alertsTbody.innerHTML = '';
    top.forEach(item=>{
      // Choose message heuristically
      let message = 'Suspicious transaction';
      if(item.risk >= 90) message = 'Rapid fund transfer across jurisdictions';
      else if(item.amount >= 200000) message = 'Shell company payment detected';
      else if(item.amount >= 80000) message = 'Multiple small transactions';

      // Map severity
      let severity = 'LOW';
      if((item.status||'').toLowerCase().includes('flag') || item.risk >= 85) severity = 'HIGH';
      else if(item.risk >= 70) severity = 'MED';

      const color = severity === 'HIGH' ? '#ff6b6b' : severity === 'MED' ? '#ffa500' : '#4ade80';
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${item.account}</td><td>${message}</td><td>$${Number(item.amount).toLocaleString()}</td><td style="color:${color}">${severity}</td>`;
      alertsTbody.appendChild(tr);
    });
  }catch(e){ console.warn('populateAlerts failed', e); }
}

// Chart initialization
document.addEventListener('DOMContentLoaded', ()=>{
  // Bind navigation buttons (deferred until DOM is ready)
  try{
    document.querySelectorAll('.nav button').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const view = btn.dataset.view;
        document.querySelectorAll('.view').forEach(s=>s.style.display='none');
        const el = document.getElementById(view);
        if(el) el.style.display='block';
        console.log('[NAV] Switched to view:', view);
        setTimeout(()=> refreshView(view), 100);
      });
    });
    // Add a delegated listener as a more robust fallback
    const navRoot = document.querySelector('.nav');
    if(navRoot){
      navRoot.addEventListener('click', (ev)=>{
        const btn = ev.target.closest && ev.target.closest('button[data-view]');
        if(!btn) return;
        try{
          document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));
          btn.classList.add('active');
          const view = btn.dataset.view;
          document.querySelectorAll('.view').forEach(s=>s.style.display='none');
          const el = document.getElementById(view);
          if(el) el.style.display='block';
          console.log('[NAV-delegated] Switched to view:', view);
          setTimeout(()=> refreshView(view), 100);
        }catch(e){ console.warn('nav delegated handler failed', e); }
      });
    }
  }catch(e){ console.warn('nav binding failed', e); }

  const lineCtx = document.getElementById('lineChart').getContext('2d');
  window.lineChart = new Chart(lineCtx,{
    type:'line',
    data: {
      labels: [],
      datasets: [
        { label: 'Volume', data: [], borderColor: '#00d4ff', backgroundColor: 'rgba(0,212,255,0.08)', fill: true, yAxisID: 'y' },
        { label: 'Risk Score', data: [], borderColor: '#ff6b6b', backgroundColor: 'rgba(255,107,107,0.06)', fill: false, yAxisID: 'y1', tension: 0.2, pointRadius:3 },
        { label: 'Tx Count', data: [], borderColor: '#9b59b6', backgroundColor: 'rgba(155,89,182,0.06)', fill: false, yAxisID: 'y2', tension: 0.2, pointRadius:3 }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top' } },
      scales: {
        y: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: 'Volume ($)' },
          ticks: { callback: function(value){ return Number(value).toLocaleString(); } }
        },
        y1: {
          type: 'linear',
          position: 'right',
          title: { display: true, text: 'Risk Score' },
          min: 0,
          max: 100,
          grid: { drawOnChartArea: false }
        },
        y2: {
          type: 'linear',
          position: 'right',
          title: { display: true, text: 'Tx Count' },
          grid: { drawOnChartArea: false },
          ticks: { callback: function(v){ return v; } },
          offset: true
        }
      }
    }
  });

  const barCtx = document.getElementById('barChart').getContext('2d');
  window.barChart = new Chart(barCtx,{type:'bar',data:{labels:['Normal','Flagged','Other'],datasets:[{label:'Count',data:[0,0,0],backgroundColor:['#3498db','#ff6b6b','#9b59b6']}]},options:{responsive:true,plugins:{legend:{display:false}}}});

  // Ensure dashboard canvases exist and initialize pie/bar charts for summary
  const dashboardGraphsContainer = document.getElementById('dashboardGraphs');
  if(dashboardGraphsContainer){
    if(!document.getElementById('riskPie')){
      const riskPieEl = document.createElement('canvas');
      riskPieEl.id = 'riskPie'; riskPieEl.height = 200; dashboardGraphsContainer.appendChild(riskPieEl);
    }
    if(!document.getElementById('volumeBar')){
      const volumeBarEl = document.createElement('canvas');
      volumeBarEl.id = 'volumeBar'; volumeBarEl.height = 200; dashboardGraphsContainer.appendChild(volumeBarEl);
    }

    try{
      const pieCtxDashboard = document.getElementById('riskPie').getContext('2d');
      window.riskPieChart = new Chart(pieCtxDashboard, { type: 'doughnut', data: { labels: ['Low','Medium','High'], datasets: [{ data: [0,0,0], backgroundColor: ['#4ade80','#ffa500','#ff6b6b'] }] }, options: { responsive:true, plugins:{legend:{position:'bottom'}} } });
    }catch(e){ console.warn('Could not init riskPieChart', e); }
    try{
      const volCtx = document.getElementById('volumeBar').getContext('2d');
      window.volumeBarChart = new Chart(volCtx, { type: 'bar', data: { labels: ['Total Tx','Total Volume (K)','Avg Risk'], datasets: [{ label:'Value', data:[0,0,0], backgroundColor:['#3498db','#9b59b6','#ff6b6b'] }] }, options: { responsive:true, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}} } });
    }catch(e){ console.warn('Could not init volumeBarChart', e); }
  }

  loadTransactions();

  // build network after data loaded from API separately
  fetch('/api/network').then(r=>r.json()).then(setupNetwork).catch(err=>{
    // fallback: build simple static network from hardcoded sample
    console.warn('network API failed', err);
  });
  // Upload UI removed per user request (file input and upload button removed from Transactions view)
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
    // pagination / lazy render: show in pages of 12
    const pageSize = 12;
    let page = 0;

    function createSparkline(values, w=120, h=28){
      if(!values || values.length===0) return '';
      const max = Math.max(...values);
      const min = Math.min(...values);
      const range = Math.max(1, max - min);
      const step = w / Math.max(1, values.length - 1);
      let path = '';
      values.forEach((v,i)=>{
        const x = i * step;
        const y = h - ((v - min) / range) * h;
        path += (i===0?`M ${x} ${y}`:` L ${x} ${y}`);
      });
      const svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><path d="${path}" fill="none" stroke="#9b59b6" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
      return svg;
    }

    function renderPage(){
      const fragment = document.createDocumentFragment();
      const start = page * pageSize;
      const slice = profiles.slice(start, start + pageSize);
      slice.forEach(p=>{
        const card = document.createElement('div'); card.className='card risk-card';
        const riskColor = p.avgRisk>=80 ? '#ff6b6b' : p.avgRisk>=60 ? '#ffa500' : '#4ade80';
        const lastTx = p.lastTx ? (new Date(p.lastTx)).toLocaleString() : 'N/A';
        const flagged = p.flaggedCount || 0;
        const spark = createSparkline(p.recentAmounts || []);
        card.innerHTML = `
          <div class="risk-card-header"><strong class="acct">${p.account}</strong><div class="actions"><button class="view-btn" data-account="${p.account}">View</button></div></div>
          <div class="risk-card-body">
            <div class="meta">Tx: <strong>${p.txCount}</strong> • Volume: <strong>$${Number(p.totalVolume).toLocaleString()}</strong></div>
            <div class="metrics"><div class="avg-risk" title="Average risk"><span style="color:${riskColor};font-weight:700;font-size:16px">${p.avgRisk}</span></div><div class="flags" title="Flagged transactions">⚑ ${flagged}</div><div class="lasttx" title="Last transaction">${lastTx}</div></div>
            <div class="sparkline">${spark}</div>
          </div>
        `;
        fragment.appendChild(card);
      });
      // add or replace load-more control
      let loadMore = document.getElementById('risk-load-more');
      if(!loadMore){ loadMore = document.createElement('div'); loadMore.id='risk-load-more'; loadMore.style.textAlign='center'; loadMore.style.marginTop='12px'; }
      loadMore.innerHTML = (start + pageSize) < profiles.length ? `<button id="loadMoreBtn">Load more</button>` : '';
      container.appendChild(fragment);
      if(loadMore.innerHTML) container.appendChild(loadMore);

      // button handlers
      document.querySelectorAll('.view-btn').forEach(b=> b.addEventListener('click', (ev)=>{ const acct = ev.currentTarget.getAttribute('data-account'); highlightAccountsInNetwork([acct]); document.getElementById('nodeDetailsContent').innerHTML = `<strong>${acct}</strong><div style="margin-top:6px">Loading transactions...</div>`; fetch(`/api/transactions?account=${encodeURIComponent(acct)}`).then(r=>r.json()).then(rows=>{ const html = ['<div style="margin-top:8px"><strong>Recent Transactions</strong><div style="max-height:240px;overflow:auto;margin-top:6px"><table style="width:100%;font-size:13px;border-collapse:collapse"><thead><tr><th>ID</th><th>Date</th><th style="text-align:right">Amount</th><th>Risk</th></tr></thead><tbody>']; rows.slice(0,50).forEach(rw=> html.push(`<tr><td>${rw.id||''}</td><td>${rw.date||''}</td><td style="text-align:right">$${(Number(rw.amount)||0).toLocaleString()}</td><td>${rw.risk||''}</td></tr>`)); html.push('</tbody></table></div></div>'); document.getElementById('nodeDetailsContent').innerHTML = html.join(''); }).catch(()=>{ document.getElementById('nodeDetailsContent').innerHTML = '<div>Could not load transactions</div>'; }); }));

      const btn = document.getElementById('loadMoreBtn');
      if(btn){ btn.addEventListener('click', ()=>{ page++; // remove loadMore and render next page
        const lm = document.getElementById('risk-load-more'); if(lm) lm.remove(); renderPage(); }); }
    }

    // initial page render
    renderPage();
  }catch(e){ console.warn('risk profiles', e); }
}

// Fetch patterns and render table
async function fetchPatterns(){
  try{
    const res = await fetch('/api/patterns');
    if(!res.ok) throw new Error('No dataset');
    let patterns = await res.json();
    // If API returned an empty array, fall back to local sample patterns
    if(!patterns || (Array.isArray(patterns) && patterns.length === 0)){
      try{
        const rlocal = await fetch('/data/patterns.json');
        if(rlocal.ok) patterns = await rlocal.json();
      }catch(e){ /* ignore and continue with empty */ }
    }
    const tbody = document.getElementById('patternsBody');
    tbody.innerHTML = '';
    patterns.forEach(p=>{
      const tr = document.createElement('tr');
      const accountsPart = p.accounts ? (' — ' + p.accounts.join(',')) : (p.account ? (' — ' + p.account) : '');
      const accountsData = p.accounts ? JSON.stringify(p.accounts) : JSON.stringify([]);
      tr.innerHTML = `<td>${p.id||''}</td><td>${p.name||''}${accountsPart}</td><td style="color:${p.severity==='HIGH'||p.severity==='CRITICAL'?'#ff3333':p.severity==='MED'?'#ff6b6b':'#ffa500'}">${p.severity||'MED'}</td><td>${p.confidence?p.confidence+'%':''}</td><td><button class="pattern-highlight" data-accounts='${accountsData}'>Highlight</button></td>`;
      tbody.appendChild(tr);
    });
    // attach handlers for highlight buttons
    document.querySelectorAll('.pattern-highlight').forEach(b=>{
      b.addEventListener('click', (ev)=>{
        const acc = ev.currentTarget.getAttribute('data-accounts');
        let accounts = [];
        try{ accounts = JSON.parse(acc||'[]'); }catch(e){ accounts = []; }
        highlightAccountsInNetwork(accounts);
      });
    });
  }catch(e){
    console.warn('patterns API failed, falling back to local patterns.json', e);
    try{
      const r = await fetch('/data/patterns.json');
      if(!r.ok) throw new Error('local patterns not found');
      const patterns = await r.json();
      const tbody = document.getElementById('patternsBody');
      tbody.innerHTML = '';
      patterns.forEach(p=>{
        const tr = document.createElement('tr');
        const accountsPart = p.accounts ? (' — ' + p.accounts.join(',')) : (p.account ? (' — ' + p.account) : '');
        const accountsData = p.accounts ? JSON.stringify(p.accounts) : JSON.stringify([]);
        tr.innerHTML = `<td>${p.id||''}</td><td>${p.name||''}${accountsPart}</td><td style="color:${p.severity==='HIGH'||p.severity==='CRITICAL'?'#ff3333':p.severity==='MED'?'#ff6b6b':'#ffa500'}">${p.severity||'MED'}</td><td>${p.confidence?p.confidence+'%':''}</td><td><button class="pattern-highlight" data-accounts='${accountsData}'>Highlight</button></td>`;
        tbody.appendChild(tr);
      });
      document.querySelectorAll('.pattern-highlight').forEach(b=>{
        b.addEventListener('click', (ev)=>{
          const acc = ev.currentTarget.getAttribute('data-accounts');
          let accounts = [];
          try{ accounts = JSON.parse(acc||'[]'); }catch(e){ accounts = []; }
          highlightAccountsInNetwork(accounts);
        });
      });
    }catch(err){ console.warn('patterns fallback failed', err); }
  }
}

// Highlight a list of account IDs/names in the network visualization
function highlightAccountsInNetwork(accounts){
  try{
    if(!accounts || !Array.isArray(accounts) || accounts.length===0) return;
    if(!window.network || !window.networkNodes) {
      console.warn('Network not initialized yet');
      return;
    }
    const allNodes = window.networkNodes.get();
    const idsToSelect = [];
    accounts.forEach(a=>{
      if(!a) return;
      // try exact id
      const byId = window.networkNodes.get(a);
      if(byId) { idsToSelect.push(byId.id || a); return; }
      // otherwise search label/title
      const match = allNodes.find(n => String(n.label) === String(a) || String(n.title) === String(a));
      if(match) idsToSelect.push(match.id);
    });
    if(idsToSelect.length===0){ console.warn('No matching nodes found for accounts', accounts); return; }
    // visually select and focus
    window.network.selectNodes(idsToSelect);
    window.network.focus(idsToSelect[0], { scale: 1.2, animation: { duration: 400 } });
    setTimeout(()=> window.network.fit({ nodes: idsToSelect, animation: { duration: 400 } }), 450);
    // pulse the nodes visually for a short duration
    pulseNodes(idsToSelect, 4000, 450);
  }catch(e){ console.warn('highlightAccountsInNetwork error', e); }
}

// Pulse a set of nodes (toggle highlight) for duration milliseconds
function pulseNodes(ids, duration = 4000, intervalMs = 400){
  try{
    if(!ids || !ids.length || !window.networkNodes) return;
    // clear any existing pulses
    if(!window._pulses) window._pulses = [];
    const originals = {};
    ids.forEach(id=>{
      const n = window.networkNodes.get(id);
      if(n){ originals[id] = { color: n.color ? JSON.parse(JSON.stringify(n.color)) : null, size: n.size || null }; }
    });
    let on = false;
    const iv = setInterval(()=>{
      ids.forEach(id=>{
        const n = window.networkNodes.get(id);
        if(!n) return;
          if(on){
          // highlighted state (red pulse)
          window.networkNodes.update(Object.assign({}, n, { color: { background: '#ff6b6b' }, size: (n.size || 20) + 6 }));
        } else {
          // restore to original visual state
          const orig = originals[id] || {};
          const upd = Object.assign({}, n);
          if(orig.color) upd.color = orig.color; else delete upd.color;
          if(orig.size) upd.size = orig.size; else delete upd.size;
          window.networkNodes.update(upd);
        }
      });
      on = !on;
    }, intervalMs);
    window._pulses.push(iv);
    setTimeout(()=>{
      clearInterval(iv);
      // restore originals
      ids.forEach(id=>{
        const orig = originals[id];
        if(!orig) return;
        const n = window.networkNodes.get(id);
        if(!n) return;
        const upd = Object.assign({}, n);
        if(orig.color) upd.color = orig.color; else delete upd.color;
        if(orig.size) upd.size = orig.size; else delete upd.size;
        window.networkNodes.update(upd);
      });
    }, duration + 50);
  }catch(e){ console.warn('pulseNodes error', e); }
}

// Flow particle animation along edges
window._flow = window._flow || { interval: null, particles: {}, counter: 0 };
function startFlowAnimation(){
  try{
    if(window._flow.interval) return; // already running
    // spawn particles periodically
    window._flow.interval = setInterval(()=>{
      try{
        if(!window.network || !window.networkEdges || !window.networkNodes) return;
        const allEdges = window.networkEdges.get();
        if(!allEdges || allEdges.length===0) return;
        // pick a random edge to animate
        const edge = allEdges[Math.floor(Math.random()*allEdges.length)];
        const fromPos = window.network.getPositions([edge.from])[edge.from];
        const toPos = window.network.getPositions([edge.to])[edge.to];
        if(!fromPos || !toPos) return;
        // create particle node
        const id = 'particle_' + (window._flow.counter++);
        const particle = { id, x: fromPos.x, y: fromPos.y, fixed: { x:true, y:true }, physics:false, shape:'dot', size:6, color:{background:'#00d4ff', border:'#00a8d8'} };
        window.networkNodes.add(particle);
        const steps = 24;
        let step = 0;
        const stepIv = setInterval(()=>{
          step++;
          const t = step/steps;
          const nx = fromPos.x + (toPos.x - fromPos.x) * t;
          const ny = fromPos.y + (toPos.y - fromPos.y) * t;
          try{ window.networkNodes.update({ id, x: nx, y: ny }); }catch(e){}
          if(step >= steps){
            clearInterval(stepIv);
            try{ window.networkNodes.remove(id); }catch(e){}
          }
        }, 30);
      }catch(e){ /* ignore per-iteration errors */ }
    }, 300);
  }catch(e){ console.warn('startFlowAnimation', e); }
}

function stopFlowAnimation(){
  try{
    if(window._flow.interval){ clearInterval(window._flow.interval); window._flow.interval = null; }
    // remove any lingering particles named particle_
    try{
      const nodes = window.networkNodes.get();
      nodes.filter(n=> n.id && typeof n.id === 'string' && n.id.startsWith('particle_')).forEach(p=>{ try{ window.networkNodes.remove(p.id); }catch(e){} });
    }catch(e){}
  }catch(e){ console.warn('stopFlowAnimation', e); }
}

// (removed duplicate nav handler)

// initial fetches
document.addEventListener('DOMContentLoaded', ()=>{
  // refresh current active view
  const active = document.querySelector('.nav button.active');
  if(active) refreshView(active.dataset.view);
  // always attempt to load patterns so the Patterns table is populated
  try{ fetchPatterns().catch(()=>{}); }catch(e){}
});

// Adjusting the spider map layout to reduce overlap
function setupNetwork(payload) {
  // Include first IP in the visible node label when available
  function extractIpsFromHtml(html){
    try{
      if(!html) return [];
      // strip tags
      const text = html.replace(/<[^>]+>/g,' ');
      // look for 'IP(s):' or 'IP:' marker
      const m = text.match(/IP\(s\):?\s*([0-9.,\s:]+)/i) || text.match(/IP:?\s*([0-9.,\s:]+)/i);
      if(m && m[1]){
        // split by comma or whitespace
        return m[1].split(/[,\s]+/).map(s=>s.trim()).filter(Boolean);
      }
    }catch(e){}
    return [];
  }
  const nodeList = (payload.nodes || []).map(n=>{
    try{
      const copy = Object.assign({}, n);
      // ensure we have an ips array, try to extract from title/html if missing
      if((!copy.ips || copy.ips.length===0) && copy.title){
        const parsed = extractIpsFromHtml(copy.title);
        if(parsed && parsed.length) copy.ips = parsed;
      }
      if(copy && copy.ips && copy.ips.length){
        copy.label = `${copy.label}\n${copy.ips[0]}`;
      }
      return copy;
    }catch(e){ return n; }
  });
  const nodes = new vis.DataSet(nodeList);
  const edges = new vis.DataSet(payload.edges || []);
  const container = document.getElementById('networkViz');
  const data = { nodes, edges };
  const options = {
    nodes: {
      shape: 'dot',
      scaling: { min: 12, max: 48 },
      font: { size: 14 },
      borderWidth: 2,
    },
    edges: {
      smooth: {
        enabled: true,
        type: 'dynamic',
      },
      arrows: {
        to: { enabled: true, scaleFactor: 1, type: 'arrow' }
      },
      color: { color: '#999', highlight: '#555', hover: '#555', inherit: false },
      width: 1,
    },
    physics: {
      enabled: true,
      barnesHut: {
        gravitationalConstant: -20000,
        centralGravity: 0.3,
        springLength: 150,
        springConstant: 0.05,
        damping: 0.09,
        avoidOverlap: 0.5,
      },
      stabilization: {
        iterations: 200,
        fit: true,
      },
    },
    layout: {
      improvedLayout: true,
      hierarchical: {
        enabled: false,
      },
    },
    interaction: {
      hover: true,
      multiselect: true,
      dragNodes: true,
      dragView: true,
      zoomView: true,
    },
  };
  const network = new vis.Network(container, data, options);
  // expose network and datasets globally for other UI interop
  window.network = network;
  window.networkNodes = nodes;
  window.networkEdges = edges;
  network.fit({ animation: { duration: 500 } });

  // Enhance edges to show direction and amounts when available
  try{
    // Iterate current edges and update visual properties
    edges.forEach(edge => {
      try{
        // try to obtain a numeric amount; backend may only provide a label like "$1,234"
        let amt = Number(edge.amount || edge.value || edge.weight || 0) || 0;
        if(!amt){
          // attempt to parse amount from label text (e.g. "$1,234")
          const lbl = (edge.label || '').toString();
          const m = lbl.match(/\$\s*([0-9,]+(?:\.[0-9]+)?)/);
          if(m && m[1]){
            try{ amt = Number(m[1].replace(/,/g,'')) || 0; }catch(e){ amt = 0; }
          }
        }
        const width = amt ? Math.min(8, Math.max(1, Math.round(Math.log10(amt + 1)))) : (edge.width || 1);
        // include destination node IPs when available and show a compact inline IP on the label
        const destNode = (edge && edge.to) ? nodes.get(edge.to) : null;
        const destIps = destNode && destNode.ips && destNode.ips.length ? destNode.ips : [];
        const inlineIp = destIps.length ? `\nIP:${destIps[0]}` : '';
        const label = (amt ? `$${Number(amt).toLocaleString()}` : (edge.label || '')) + inlineIp;
        const destIpLine = destIps.length ? `\nDestination IP(s): ${destIps.join(', ')}` : '';
        const title = (amt ? `Amount: $${Number(amt).toLocaleString()}` : (edge.title||'')) + destIpLine;
        // color edges by amount: small=gray, medium=orange, large=red
        let edgeColor = '#9aa0a6';
        if(amt >= 150000) edgeColor = '#ff6b6b';
        else if(amt >= 50000) edgeColor = '#ffa500';
        else edgeColor = '#9aa0a6';
        const eid = edge.id || `${edge.from}->${edge.to}`;
        edges.update(Object.assign({}, edge, { id: eid, arrows: 'to', width: width, label: label, title: title, color: { color: edgeColor, highlight: '#555', hover: '#555' } }));
      }catch(e){/* ignore edge-specific errors */}
    });
  }catch(e){ console.warn('edge enhancement failed', e); }

  // Setup UI toggles for pulse and flow
  try{
    const pulseToggle = document.getElementById('togglePulse');
    const flowToggle = document.getElementById('toggleFlow');
    window.enablePulse = pulseToggle ? pulseToggle.checked : true;
    window.enableFlow = flowToggle ? flowToggle.checked : true;
    if(pulseToggle) pulseToggle.addEventListener('change', (ev)=>{ window.enablePulse = ev.target.checked; });
    if(flowToggle) flowToggle.addEventListener('change', (ev)=>{
      window.enableFlow = ev.target.checked;
      if(window.enableFlow) startFlowAnimation(); else stopFlowAnimation();
    });
  }catch(e){/* ignore */}

  // start flow animation if enabled
  if(window.enableFlow) startFlowAnimation();

  // Event listeners for node interactions
  const detailsEl = document.getElementById('nodeDetailsContent');

  network.on('selectNode', (params) => {
    try{
      const nodeId = params.nodes && params.nodes[0];
      if(!nodeId) return;
      const node = nodes.get(nodeId);
      if(!node) return;
      // Build detail HTML (safe fields)
      const txCount = node.txCount || 0;
      const total = node.totalAmount || node.value || 0;
      const avgRisk = node.avgRisk || 0;
      const ips = node.ips || node.ip || [];
      const ipLine = (ips && ips.length) ? `<div><strong>IP(s):</strong> ${Array.isArray(ips)?ips.join(', '):ips}</div>` : '';
      // Find sink accounts reachable from this node (end of money trail)
      function findSinks(startId){
        const visited = new Set();
        const sinks = new Set();
        const stack = [startId];
        try{
          while(stack.length){
            const cur = stack.pop();
            if(visited.has(cur)) continue;
            visited.add(cur);
            // outgoing edges from cur
            const outgoing = edges.get().filter(e=> e.from === cur);
            if(!outgoing || outgoing.length === 0){
              sinks.add(cur);
            } else {
              outgoing.forEach(e=>{ if(!visited.has(e.to)) stack.push(e.to); });
            }
          }
        }catch(e){ }
        return Array.from(sinks);
      }

      const sinks = findSinks(nodeId).filter(id=> id !== nodeId);
      const sinkIps = new Set();
      sinks.forEach(sid=>{ const sn = nodes.get(sid); if(sn && sn.ips && sn.ips.length) sn.ips.forEach(i=>sinkIps.add(i)); });
      const sinkIpLine = sinkIps.size ? `<div style="margin-top:8px"><strong>Destination IP(s):</strong> ${Array.from(sinkIps).join(', ')}</div>` : '';

      const html = `
        <div style="line-height:1.4">
          <div><strong>Account:</strong> ${node.label}</div>
          <div><strong>Transactions:</strong> ${txCount}</div>
          <div><strong>Total Amount:</strong> $${Number(total).toLocaleString()}</div>
          <div><strong>Average Risk:</strong> ${avgRisk}</div>
          ${ipLine}
          ${sinkIpLine}
        </div>
      `;
      if(detailsEl) detailsEl.innerHTML = html;
      // Fetch related transactions from the server (use current_dataset.csv on server-side)
      fetch(`/api/transactions?account=${encodeURIComponent(nodeId)}`).then(r=>{
        if(!r.ok) throw new Error('No transactions');
        return r.json();
      }).then(rows=>{
        if(!detailsEl) return;
        if(!rows || rows.length===0){
          detailsEl.innerHTML += '<div style="margin-top:8px;color:#666">No related transactions found.</div>';
          return;
        }
        // Build a compact table of related transactions
        const tableHtml = ['<div style="margin-top:8px"><strong>Related Transactions</strong><div style="max-height:220px;overflow:auto;margin-top:6px"><table style="width:100%;font-size:13px;border-collapse:collapse">', '<thead><tr><th style="text-align:left;padding:4px">ID</th><th style="text-align:left;padding:4px">Date</th><th style="text-align:right;padding:4px">Amount</th><th style="text-align:left;padding:4px">Risk</th></tr></thead><tbody>'];
        rows.slice(0,50).forEach(rw=>{
          tableHtml.push(`<tr><td style="padding:4px">${(rw.id||'')}</td><td style="padding:4px">${(rw.date||'')}</td><td style="padding:4px;text-align:right">$${(Number(rw.amount)||0).toLocaleString()}</td><td style="padding:4px">${(rw.risk||'')}</td></tr>`);
        });
        tableHtml.push('</tbody></table></div></div>');
        detailsEl.innerHTML += tableHtml.join('');
      }).catch(()=>{
        if(detailsEl) detailsEl.innerHTML += '<div style="margin-top:8px;color:#666">Could not load transactions.</div>';
      });
    }catch(e){ console.warn('selectNode handler', e); }
  });

  network.on('deselectNode', (params) => {
    if(detailsEl) detailsEl.innerHTML = 'Click a node to see details';
  });
}

// (dashboard graphs are managed during initialization and on upload)
