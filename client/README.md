# InsightHub

A self-service analytics dashboard that turns raw data into interactive visualizations. Upload CSV/JSON datasets, build charts with a visual configurator, or ask questions in plain English and let AI generate the perfect chart.

**Live Demo:** [insighthub.vercel.app](https://insighthub.vercel.app) · **Backend:** [insighthub-api.onrender.com](https://insighthub-api.onrender.com)

---

## Features

**Smart Data Ingestion** — Upload CSV or JSON files with drag-and-drop. The engine auto-detects column types (numbers, dates, categories, booleans) with zero configuration.

**Interactive Chart Builder** — Create bar, line, pie, area, grouped bar, and data table visualizations. Configure axes, aggregation methods (sum, avg, count, min, max), and grouping through a visual panel.

**AI-Powered "Ask Your Data"** — Type natural language questions like "Show me total revenue by region" and the AI (Google Gemini) determines the best chart type, axes, and aggregation automatically. Includes explanation of its reasoning.

**Real-Time Live Feed** — Server-Sent Events stream simulated e-commerce orders with auto-updating charts, live stats (total revenue, order count, avg order value), and an animated order ticker.

**Responsive Design** — Fully responsive across desktop, tablet, and mobile. Clean white theme with DM Sans typography and an editorial design system.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 21, TypeScript, SCSS |
| Charts | Chart.js + ng2-charts |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB Atlas (free tier) |
| AI | Google Gemini 2.5 Flash API |
| Real-time | Server-Sent Events (SSE) |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Architecture

```
insighthub/
├── client/                    # Angular 21 frontend
│   └── src/app/
│       ├── core/              # Services, interceptors
│       │   ├── services/
│       │   │   ├── dataset.service.ts
│       │   │   ├── chart.service.ts
│       │   │   ├── ai.service.ts
│       │   │   ├── live.service.ts
│       │   │   └── session.service.ts
│       │   └── interceptors/
│       │       └── session.interceptor.ts
│       └── features/
│           ├── landing/       # Landing page
│           ├── upload/        # File upload + dataset list
│           ├── dataset-detail/# Data preview table
│           ├── dashboard/     # Chart grid + AI query
│           │   └── components/
│           │       ├── chart-builder.component
│           │       ├── chart-card.component
│           │       ├── ai-query-bar.component
│           │       └── ai-chart-card.component
│           └── live-feed/     # Real-time SSE dashboard
├── server/                    # Express + TypeScript backend
│   └── src/
│       ├── config/            # DB, env, multer
│       └── modules/
│           ├── dataset/       # Upload, parse, type detection, CRUD
│           ├── chart/         # Aggregation engine
│           ├── ai/            # Gemini integration
│           └── live/          # SSE mock data stream
└── README.md
```

### Key Architecture Decisions

**Session-based identity** — No traditional auth. A UUID stored in localStorage identifies each visitor. Auth was already demonstrated in two prior portfolio projects (ProjectNest and CollabBoard).

**Backend aggregation** — Chart data is aggregated server-side, not in the browser. Raw datasets could have thousands of rows; the frontend sends a chart config and receives only the small aggregated result.

**Schema-only AI prompts** — The AI sees column metadata (names, types, sample values) but never the actual data. This keeps token usage minimal and responses fast.

**SSE over WebSockets** — The live feed uses Server-Sent Events instead of WebSockets because data flows one direction (server → client). SSE is simpler, auto-reconnects, and uses plain HTTP.

**Type detection engine** — An 85% threshold approach. A column is classified as "number" if 85%+ of values parse as numeric. This handles real-world messy data where a numeric column might have a few N/A entries.

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free M0 cluster)
- Google Gemini API key ([get one free](https://aistudio.google.com/apikey))

### Setup

1. **Clone the repo**
```bash
git clone https://github.com/vishwalimbani/insighthub.git
cd insighthub
```

2. **Backend setup**
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and Gemini API key
npm run dev
```

3. **Frontend setup**
```bash
cd client
npm install
ng serve
```

4. **Open** `http://localhost:4200`

### Environment Variables

Create `server/.env`:
```
PORT=3000
MONGODB_URI=mongodb+srv://...
GEMINI_API_KEY=your_gemini_key
NODE_ENV=development
CLIENT_URL=http://localhost:4200
```

---

## Deployment

### Backend → Render (free tier)

1. Push to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Connect your GitHub repo
4. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node dist/app.js`
5. Add environment variables (MONGODB_URI, GEMINI_API_KEY, CLIENT_URL, NODE_ENV=production)

### Frontend → Vercel (free tier)

1. Create a new project on [vercel.com](https://vercel.com)
2. Connect your GitHub repo
3. Settings:
   - **Root Directory:** `client`
   - **Build Command:** `ng build --configuration production`
   - **Output Directory:** `dist/client/browser`
4. Add environment variable if needed

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/datasets/upload` | Upload CSV/JSON file |
| GET | `/api/datasets` | List all datasets |
| GET | `/api/datasets/:id` | Get full dataset |
| GET | `/api/datasets/:id/preview` | Get first N rows |
| DELETE | `/api/datasets/:id` | Delete dataset |
| GET | `/api/charts/:datasetId` | Get aggregated chart data |
| POST | `/api/ai/:datasetId/ask` | AI natural language query |
| GET | `/api/live/stream` | SSE live data stream |
| GET | `/api/live/snapshot` | One-time mock data batch |

All endpoints require `x-session-id` header (auto-attached by frontend interceptor).

---

## License

MIT