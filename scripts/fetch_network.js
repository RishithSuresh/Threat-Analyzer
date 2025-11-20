const fs = require('fs');

const http = require('http');

function fetchNetwork(){
  http.get('http://localhost:4000/api/network', (res)=>{
    let data='';
    res.on('data', chunk=> data += chunk);
    res.on('end', ()=>{
      try{
        const j = JSON.parse(data);
        fs.writeFileSync('./tmp_network_sample.json', JSON.stringify(j.nodes ? { nodes: j.nodes.slice(0,5), edges: j.edges && j.edges.slice(0,10) } : j, null, 2), 'utf8');
        console.log('Saved sample to tmp_network_sample.json');
      }catch(e){ console.error('Parse error:', e.message); process.exit(1); }
    });
  }).on('error', e=>{ console.error('HTTP error:', e.message); process.exit(1); });
}

fetchNetwork();
