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

// Sample data for charts and table
const txData = [
  {id:'TXN-001',date:'2025-01-07 14:32',from:'ACC-2024-001',to:'ACC-2024-045',amount:50000,risk:85,status:'FLAGGED'},
  {id:'TXN-002',date:'2025-01-07 13:15',from:'ACC-2024-015',to:'ACC-2024-052',amount:9500,risk:72,status:'FLAGGED'},
  {id:'TXN-003',date:'2025-01-07 11:45',from:'ACC-2024-042',to:'SHELL-2024-008',amount:245000,risk:92,status:'BLOCKED'},
  {id:'TXN-004',date:'2025-01-07 10:20',from:'ACC-2024-089',to:'ACC-2024-090',amount:15000,risk:45,status:'NORMAL'},
  {id:'TXN-005',date:'2025-01-07 09:10',from:'ACC-2024-120',to:'ACC-2024-121',amount:125000,risk:88,status:'FLAGGED'}
];

const tbody = document.querySelector('#txTable tbody');
txData.forEach(t=>{
  const tr=document.createElement('tr');
  tr.innerHTML = `<td>${t.id}</td><td>${t.date}</td><td>${t.from}</td><td>${t.to}</td><td>$${t.amount.toLocaleString()}</td><td>${t.risk}</td><td>${t.status}</td>`;
  tbody.appendChild(tr);
});

// Chart.js Line chart
const lineCtx = document.getElementById('lineChart').getContext('2d');
new Chart(lineCtx,{
  type:'line',
  data:{labels:['2025-01-01','2025-01-02','2025-01-03','2025-01-04','2025-01-05','2025-01-06','2025-01-07'],datasets:[{label:'Volume',data:[45000,52000,48000,61000,55000,71000,63000],borderColor:'#00d4ff',backgroundColor:'rgba(0,212,255,0.08)',fill:true},{label:'Risk Score',data:[12,15,8,22,18,31,25],borderColor:'#ff6b6b',backgroundColor:'rgba(255,107,107,0.06)',fill:true}]},options:{responsive:true,plugins:{legend:{position:'top'}}}
});

// Chart.js Bar chart (risk distribution)
const barCtx = document.getElementById('barChart').getContext('2d');
new Chart(barCtx,{type:'bar',data:{labels:['Personal','Corporate','Shell Co.'],datasets:[{label:'High',data:[5,2,1],backgroundColor:'#ff6b6b'},{label:'Medium',data:[12,8,3],backgroundColor:'#ffa500'},{label:'Low',data:[35,24,8],backgroundColor:'#4ade80'}]},options:{responsive:true,plugins:{legend:{position:'top'}}}});

// vis-network setup
const nodes = new vis.DataSet([
  {id:'ACC-001',label:'ACC-001\n(Primary)',value:500000,group:'high'},
  {id:'ACC-045',label:'ACC-045',value:200000,group:'medium'},
  {id:'ACC-052',label:'ACC-052\n(Receiver)',value:150000,group:'medium'},
  {id:'SHELL-008',label:'SHELL-008\n(Offshore)',value:300000,group:'high'},
  {id:'SHELL-015',label:'SHELL-015',value:250000,group:'high'},
  {id:'ACC-089',label:'ACC-089\n(Mule-1)',value:75000,group:'medium'},
  {id:'ACC-090',label:'ACC-090\n(Mule-2)',value:85000,group:'medium'},
  {id:'PERSON-X',label:'Person X\n(Beneficial Owner)',value:0,group:'high'},
  {id:'PERSON-Y',label:'Person Y\n(Accomplice)',value:0,group:'high'},
  {id:'INT-SG-001',label:'INT-SG-001\n(Singapore)',value:180000,group:'high'},
  {id:'INT-HK-002',label:'INT-HK-002\n(Hong Kong)',value:220000,group:'high'}
]);
const edges = new vis.DataSet([
  {from:'PERSON-X',to:'ACC-001',label:'$500,000'},
  {from:'ACC-001',to:'SHELL-008',label:'$245,000'},
  {from:'ACC-001',to:'SHELL-015',label:'$200,000'},
  {from:'SHELL-008',to:'ACC-089',label:'$75,000'},
  {from:'SHELL-008',to:'ACC-090',label:'$85,000'},
  {from:'SHELL-015',to:'ACC-052',label:'$150,000'},
  {from:'ACC-089',to:'INT-SG-001',label:'$50,000'},
  {from:'ACC-090',to:'INT-HK-002',label:'$60,000'},
  {from:'ACC-052',to:'INT-SG-001',label:'$80,000'},
  {from:'INT-SG-001',to:'ACC-045',label:'$120,000'},
  {from:'INT-HK-002',to:'ACC-045',label:'$140,000'},
  {from:'ACC-045',to:'PERSON-Y',label:'$200,000'}
]);
const container = document.getElementById('networkViz');
const data = {nodes,edges};

// Create a clear, centered 'spider' layout by fixing positions in concentric rings
(function createSpiderLayout(){
  const all = nodes.get();
  if(all.length === 0) return;

  // choose center node: node with max value (if present) otherwise first
  let centerNode = all.reduce((a,b)=>((a.value||0) > (b.value||0) ? a : b), all[0]);
  const centerId = centerNode.id;

  // prepare other nodes
  const others = all.filter(n=>n.id !== centerId);

  // ring configuration (pixels). Adjust radii for clarity.
  const rings = [160, 320, 480];

  // distribute nodes into rings: fill first ring up to 8, second up to 16, rest into third
  const ringBuckets = [[],[],[]];
  others.forEach((n,i)=>{
    if(i < 8) ringBuckets[0].push(n);
    else if(i < 24) ringBuckets[1].push(n);
    else ringBuckets[2].push(n);
  });

  // update center position at origin (vis uses coordinates in px)
  nodes.update([{id:centerId,x:0,y:0,fixed:true}]);

  // helper to place nodes evenly on a circle
  function placeRing(bucket, radius){
    const count = bucket.length;
    for(let i=0;i<count;i++){
      const angle = (2*Math.PI*i)/count;
      const x = Math.round(radius * Math.cos(angle));
      const y = Math.round(radius * Math.sin(angle));
      nodes.update([{id: bucket[i].id, x, y, fixed: true}]);
    }
  }

  placeRing(ringBuckets[0], rings[0]);
  if(ringBuckets[1].length) placeRing(ringBuckets[1], rings[1]);
  if(ringBuckets[2].length) placeRing(ringBuckets[2], rings[2]);
})();

const options = {
  nodes: { shape: 'dot', scaling: {min:12, max:48}, font: {size:14} },
  edges: { smooth: {enabled: true, type: 'curvedCW', roundness: 0.2}, color: {inherit:true} },
  physics: {enabled: false},
  interaction: {hover: true, navigationButtons: true, keyboard: true, zoomView: true, dragView: true}
};

const network = new vis.Network(container, data, options);
network.fit({animation:{duration:500}});

// Allow scrolling (mouse wheel) to pan the spider network vertically/horizontally.
// If user holds Ctrl while scrolling, allow default zoom behavior instead.
container.addEventListener('wheel', function(e){
  if (e.ctrlKey) {
    return;
  }
  e.preventDefault();
  const factor = 1;
  try {
    network.moveTo({offset: {x: -e.deltaX * factor, y: -e.deltaY * factor}});
  } catch (err) {
    console.warn('Wheel pan failed', err);
  }
}, {passive: false});
