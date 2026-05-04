import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import { connectDB } from './config/db';
import datasetRoutes from './modules/dataset/dataset.routes';
import chartRoutes from './modules/chart/chart.routes';
import aiRoutes from './modules/ai/ai.routes';
import liveRoutes from './modules/live/live.routes';

const app = express();

const allowedOrigins = [
  'http://localhost:4200',
  'http://localhost:3000',
  'https://insighthub-cyan.vercel.app',
  ENV.CLIENT_URL,
].filter((o) => o && o.trim() !== '');

const corsOrigins = [...new Set(allowedOrigins)];
console.log('CORS Allowed Origins:', corsOrigins);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (corsOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-session-id',       // ← this was missing
  ],
  exposedHeaders: ['x-session-id'],
  optionsSuccessStatus: 204,
};

// Apply CORS before everything else
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight for all routes

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV,
  });
});

app.use('/api/datasets', datasetRoutes);
app.use('/api/charts', chartRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/live', liveRoutes);

// Global error handler
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
    });
  }
);

const startServer = async () => {
  await connectDB();
  app.listen(ENV.PORT, () => {
    console.log(`🚀 InsightHub server running on port ${ENV.PORT}`);
  });
};

startServer();