# Threat Analyzer — Run Instructions

This repository now contains a self-contained frontend (static) and a simple Node.js backend that serves the frontend and provides API endpoints.

Folders:
- `frontend/`: static frontend files (HTML, CSS, JS, CSV data)
- `backend/`: Node.js + Express server (serves the frontend and provides APIs)

Local setup (Windows PowerShell):

1. Install backend dependencies

```powershell
cd "d:\Programming\Threat Analyzer\backend"
npm install
```

2. From repository root, start the backend (serves frontend and APIs on port 4000)

```powershell
cd "d:\Programming\Threat Analyzer"
npm start
# open http://localhost:4000
```

3. Optional: serve frontend as static-only on port 8080 (no API)

```powershell
cd "d:\Programming\Threat Analyzer"
npm run start:static
# open http://localhost:8080
```

API endpoints (backend running on default port 4000):
- `GET /api/transactions` — returns JSON parsed from `frontend/data/detailed_transaction_data.csv`
- `GET /api/network` — returns a simple nodes/edges network derived from the CSV

Upload & analysis endpoint:
- `POST /api/upload` — accepts a `multipart/form-data` upload with key `file` (CSV). Returns JSON: `{ rows, analysis, nodes, edges }` where `analysis` contains `totalTransactions`, `totalVolume`, `avgRisk`, and `riskCounts`.

How to upload from the frontend:
- Open the app (e.g. `http://localhost:4000`) and go to the "Transaction Monitoring" tab. Use the file chooser and click "Upload & Analyze". The frontend will display the parsed rows, a few analysis cards, and update the network visualization.

Notes:
- If you delete or move `frontend/data/detailed_transaction_data.csv`, the APIs will return 404.
- I added a small PowerShell script at `scripts/cleanup-archives.ps1` to remove old archive folders if you want to clean them locally.
