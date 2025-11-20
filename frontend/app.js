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

    // Update line chart (volume + avg risk)
    if(window.lineChart){
      window.lineChart.data.labels = days;
      if(window.lineChart.data.datasets && window.lineChart.data.datasets.length>=2){
        window.lineChart.data.datasets[0].data = volumeSeries;
        window.lineChart.data.datasets[1].data = avgRiskSeries;
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
    data:{labels:[],datasets:[{label:'Volume',data:[],borderColor:'#00d4ff',backgroundColor:'rgba(0,212,255,0.08)',fill:true},{label:'Risk Score',data:[],borderColor:'#ff6b6b',backgroundColor:'rgba(255,107,107,0.06)',fill:true}]},
    options:{responsive:true,plugins:{legend:{position:'top'}}}
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

// (removed duplicate nav handler)

// initial fetches
document.addEventListener('DOMContentLoaded', ()=>{
  // refresh current active view
  const active = document.querySelector('.nav button.active');
  if(active) refreshView(active.dataset.view);
});

// Adjusting the spider map layout to reduce overlap
function setupNetwork(payload) {
  const nodes = new vis.DataSet(payload.nodes || []);
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
  network.fit({ animation: { duration: 500 } });

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
      const html = `
        <div style="line-height:1.4">
          <div><strong>Account:</strong> ${node.label}</div>
          <div><strong>Transactions:</strong> ${txCount}</div>
          <div><strong>Total Amount:</strong> $${Number(total).toLocaleString()}</div>
          <div><strong>Average Risk:</strong> ${avgRisk}</div>
          ${ipLine}
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
