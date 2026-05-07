# InsightHub — Portfolio Project Documentation

> **Built by:** Vishwa Limbani  
> **Stack:** Angular 21 · Node.js/Express · MongoDB · Claude AI · Chart.js · Socket.IO  
> **Type:** Full-Stack SaaS-style Analytics Dashboard  

---

## Project Overview

InsightHub is an AI-powered data analytics platform. Users upload a CSV or JSON dataset, and the app automatically detects column types, generates interactive charts, and lets users ask questions in plain English — the AI then builds the perfect visualization in response. A live feed mode streams real-time mock order data with live charts updating in sub-second intervals.

---

## Feature Summary

| Feature | Description |
|---|---|
| Dataset Upload | Drag-and-drop CSV/JSON with automatic type detection |
| AI Chart Builder | Natural language query → chart via Claude AI |
| Manual Chart Builder | Choose chart type, X/Y axes, filters manually |
| Dashboard | View all charts for a dataset; annotate and explore |
| Live Feed | Real-time streaming data with auto-updating charts |
| Session Persistence | Datasets persist across sessions via MongoDB |

---

## Technical Architecture

```
Client (Angular 21 SSR)
  ├── Landing Page
  ├── Upload Page  →  POST /api/datasets  →  MongoDB
  ├── Dashboard    →  GET  /api/charts    →  MongoDB
  │     ├── AI Query Bar  →  POST /api/ai/query  →  Claude API
  │     └── Chart Builder →  POST /api/charts    →  MongoDB
  └── Live Feed    →  WebSocket (Socket.IO)  →  Mock Data Service

Server (Express + TypeScript)
  ├── /api/datasets  — upload, parse, type-detect, persist
  ├── /api/charts    — CRUD for chart configurations
  ├── /api/ai        — Claude AI integration for NL→chart
  └── /live          — Socket.IO for real-time data streaming
```

---

## Interview Questions & Answers

### General / Overview

**Q: Walk me through InsightHub — what does it do and who is it for?**

InsightHub is a self-serve analytics tool. The target user is someone who has data (say, a sales CSV or a JSON export from another tool) but doesn't know how to write SQL or use Tableau. They upload the file, the app parses and understands the schema automatically, and within seconds they're looking at charts. The AI layer means they can type "show me revenue by region as a bar chart" and get exactly that — no configuration required.

---

**Q: Why did you build this project?**

I wanted to explore the intersection of AI and data visualization — specifically how LLMs can reduce the friction between raw data and insight. Most BI tools require you to know the schema and write queries. InsightHub removes both barriers. It was also a good full-stack challenge: file parsing, type inference, AI tool use, real-time streaming, and a polished UI all in one project.

---

### Frontend (Angular)

**Q: Why Angular over React or Vue for this project?**

Angular's opinionated structure — built-in DI, strong TypeScript support, reactive forms, and RxJS for async data streams — made it a natural fit for a data-heavy app. The live feed uses RxJS Observables to manage WebSocket streams elegantly. Angular's SSR (via `@angular/ssr`) also gives better SEO for the landing page. For a solo project it forces consistency that React leaves up to the developer.

**Q: How does Angular SSR work in this project?**

The app uses Angular's `@angular/ssr` package with an Express adapter. On the first request, the server renders the Angular app to HTML and sends it to the browser — the user sees content immediately without waiting for JavaScript to boot. The client then "hydrates" the static HTML, taking over interactivity. This matters for the landing page's perceived performance and SEO.

**Q: How did you handle real-time data in the frontend?**

The Live Feed page uses a service (`live.service.ts`) that wraps a Socket.IO connection in an RxJS Subject. When the user starts streaming, the service emits order events as Observables. The component subscribes and pushes data into Chart.js datasets, calling `chart.update()` with `'none'` animation mode for smooth sub-second updates without re-rendering the whole chart.

**Q: How is the app structured — what's the component hierarchy?**

The root `App` component holds the sticky navbar and a `<router-outlet>`. Routes load feature components lazily: `LandingComponent`, `UploadComponent`, `DashboardComponent`, and `LiveFeedComponent`. The dashboard has child components: `AiQueryBarComponent`, `ChartBuilderComponent`, `ChartCardComponent`, and `AiChartCardComponent`. All components are standalone (no NgModules).

**Q: How did you make the app responsive?**

The design system uses CSS custom properties for spacing, typography, and color — making global theming trivial. Every feature component has dedicated media queries at 1024px (tablet landscape), 768px (tablet portrait), 640px (large mobile), and 400px (small phones). The layout uses CSS Grid with `auto-fit` and `minmax()` so columns collapse naturally. The navbar becomes a hamburger menu below 640px using an Angular signal-driven boolean toggle.

**Q: Explain the design system approach in `styles.scss`.**

I defined all design tokens as CSS custom properties on `:root`: color palette, typography scale, spacing scale (8px base unit), border radii, shadows, and transitions. This means every component references variables like `var(--color-accent)` rather than hardcoded hex values — changing the accent color site-wide takes one line. The DM Sans + JetBrains Mono type pairing gives a clean editorial feel that still reads well in monospace-heavy data contexts.

---

### Backend (Node.js / Express)

**Q: How does the dataset upload and parsing pipeline work?**

1. The client posts a multipart file to `POST /api/datasets`.
2. Multer saves the file to disk temporarily.
3. `parser.service.ts` reads the file: CSV rows become JSON objects via a streaming parser; JSON files are loaded directly.
4. `type-detector.ts` samples each column's values and classifies each as `number`, `date`, `category`, `boolean`, or `string` using heuristics (regex for dates, numeric coercion checks, cardinality for category vs string).
5. The parsed metadata (column names, types, row count, sample rows) is saved to MongoDB; the raw file is deleted.
6. The API returns the dataset document, which the client uses to populate the column preview UI.

**Q: How does the AI query feature work end-to-end?**

1. User types a natural language query like "compare sales and expenses by month as a line chart".
2. The client sends `POST /api/ai/query` with the query string and dataset schema (column names + types).
3. `ai.service.ts` on the server builds a structured prompt to Claude, including the schema and a JSON response format definition describing a chart configuration object.
4. Claude returns a JSON response specifying `chartType`, `xAxis`, `yAxis`, `label`, and optional `filter`.
5. The server validates the response and saves it as a chart document in MongoDB.
6. The client receives the chart config and renders it using Chart.js via `ng2-charts`.

**Q: Why did you use Claude AI instead of OpenAI?**

Claude has strong instruction-following for structured JSON output — critical when you need the AI to return a strict chart config schema, not prose. Claude's context window also handles larger dataset schemas without truncation. I also had prior familiarity with the Anthropic API. That said, the AI service is abstracted behind a service class, so swapping providers would be a one-file change.

**Q: How is MongoDB used in this project?**

Two main collections:
- **datasets** — stores schema metadata, column definitions, row count, upload timestamp, and a session ID for user isolation (no auth, session-based).
- **charts** — stores chart configurations (type, axes, label, filters) linked to a dataset ID. Both manually-built and AI-generated charts use the same schema.

Mongoose ODM handles schema validation. Indexes on `sessionId` ensure fast per-session queries without full collection scans.

**Q: How do you handle CORS and session isolation without authentication?**

CORS is configured in Express to whitelist the Angular dev server origin and the production domain. Session isolation uses a UUID generated on first visit (stored in `localStorage`), sent as a custom header `X-Session-ID` on every request via an Angular HTTP interceptor (`session.interceptor.ts`). The server filters all dataset and chart queries by this session ID. It's not secure against spoofing, but for a portfolio/demo project it cleanly isolates data without requiring user accounts.

---

### Real-Time / WebSocket

**Q: How does the live feed work technically?**

The server has a `mock-data.service.ts` that generates realistic order events (product, region, revenue, timestamp) on a configurable interval. When a client connects via Socket.IO, it subscribes to this stream. The `live.controller.ts` manages room-based subscriptions so multiple clients can be connected independently. On the frontend, the `LiveFeedComponent` maintains four Chart.js instances (revenue over time, product breakdown, regional distribution, orders per minute) and updates them with each incoming event by appending to datasets and trimming to a rolling window of the last 50 points.

**Q: Why Socket.IO instead of plain WebSockets or SSE?**

Socket.IO provides automatic reconnection, room management, and a fallback to long-polling for environments where WebSockets are blocked (some corporate proxies). For a streaming dashboard where dropped events degrade the UX significantly, the reliability benefits outweigh the overhead. SSE would have worked for one-directional streams but doesn't support the start/stop control events the client sends.

---

### Data Visualization

**Q: Why Chart.js / ng2-charts instead of D3 or Recharts?**

Chart.js strikes the right balance for this use case: it has excellent performance for live-updating charts (Canvas-based rendering is faster than SVG for frequent updates), supports all the chart types needed (bar, line, pie, scatter, doughnut), and `ng2-charts` gives a clean Angular wrapper with declarative inputs. D3 would give more flexibility for custom visualizations but adds significant complexity for standard chart types. Recharts is React-specific.

**Q: How do you update live charts without performance issues?**

Three techniques:
1. **`chart.update('none')`** — skips animation on data updates, giving immediate visual response.
2. **Rolling window** — the data array is capped at 50 points. When a new point arrives, the oldest is shifted out, keeping array operations O(1).
3. **`ngZone.runOutsideAngular()`** — WebSocket event handlers run outside Angular's change detection zone to prevent unnecessary component re-renders on every incoming event.

---

### Architecture & Design Decisions

**Q: What was the hardest technical challenge?**

The type detection system for columns was unexpectedly tricky. A column like "2024-01" could be a date, a string, or a category. Sampling the first 100 rows and running multiple heuristics (ISO date regex, numeric coercion success rate, unique value ratio for category detection) gave about 90% accuracy on real-world CSVs, but edge cases like mixed-type columns or locale-specific date formats required additional fallback logic. The final implementation uses confidence scoring rather than a simple if/else chain.

**Q: How would you scale this to production?**

Key changes needed:
- **Auth** — Replace session IDs with JWT-based authentication (OAuth with Google/GitHub for quick onboarding).
- **File storage** — Move uploaded files to S3 instead of local disk; add virus scanning.
- **Job queue** — Parse large files (1M+ rows) in a background worker (BullMQ + Redis) instead of the request thread; stream progress via WebSocket.
- **Database** — Add compound indexes on `(sessionId, createdAt)`. For very large datasets, store data in a columnar format (Parquet on S3 + DuckDB queries) instead of MongoDB.
- **Rate limiting** — Add per-session rate limits on the AI endpoint to control API costs.
- **CDN** — Serve the Angular SSR output through a CDN edge cache.

**Q: What would you do differently if you rebuilt this?**

1. Use **Signals** throughout the Angular app instead of RxJS Subjects — Angular 21 Signals are better ergonomics for local state.
2. Extract the **AI prompt template** into a separate config file so it can be tuned without touching service code.
3. Add **E2E tests** with Playwright from the start — the upload → dashboard → AI query flow is exactly the kind of critical path that breaks silently.
4. Consider **tRPC** for the client-server API layer to get end-to-end type safety without manually duplicating types.

---

### Testing

**Q: How did you test this project?**

The project uses Vitest for unit tests (configured in the Angular workspace). The parser service and type detector have unit tests covering CSV/JSON parsing edge cases and type inference accuracy. The AI service has integration tests using mocked Anthropic responses to verify prompt construction and response parsing. Manual testing was used for the UI flows given the timeline.

For a production system I would add:
- Playwright E2E tests for the upload → dashboard → AI query critical path.
- Contract tests for the AI response schema to catch prompt drift.
- Load tests for the WebSocket server to validate concurrency limits.

---

### Deployment

**Q: How is this deployed / how would you deploy it?**

Current: Local dev with `concurrently` running both the Angular dev server and Express server.

Production-ready deployment:
- **Frontend**: Build Angular SSR bundle → deploy to Railway/Render (Node server) or a serverless adapter for Vercel.
- **Backend**: Dockerize the Express server → deploy to Railway, Render, or AWS ECS. 
- **Database**: MongoDB Atlas (managed).
- **Env vars**: `ANTHROPIC_API_KEY`, `MONGODB_URI`, `CORS_ORIGIN` — never committed to git.
- **CI/CD**: GitHub Actions → run tests → build → deploy on merge to `main`.

---

## Tech Stack Summary

| Layer | Technology | Why |
|---|---|---|
| Frontend Framework | Angular 21 (Standalone, SSR) | Strong TypeScript, RxJS, SSR out of the box |
| Styling | SCSS + CSS Custom Properties | Design tokens, component isolation |
| Charts | Chart.js 4 + ng2-charts 10 | Canvas performance, Angular bindings |
| Backend | Node.js + Express 5 + TypeScript | Familiar, fast to ship, good ecosystem |
| Database | MongoDB + Mongoose | Flexible schema for evolving chart configs |
| AI | Anthropic Claude API | Reliable structured JSON output |
| Real-time | Socket.IO | Reconnection, room management |
| Build | Angular CLI + esbuild | Fast incremental builds |
| Package Manager | npm (workspaces) | Monorepo: client + server |

---

## Key Numbers (for portfolio context)

- ~15 Angular components across 5 feature areas
- ~10 API endpoints (REST + WebSocket)
- Supports CSV and JSON datasets up to ~50MB
- Live feed processes ~1 event/second with <50ms chart update latency
- Responsive across mobile (375px) → 4K desktop
- Zero third-party UI component libraries — all custom CSS

---

*Built by Vishwa Limbani · May 2026*
