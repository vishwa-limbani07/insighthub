import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import { connectDB } from './config/db';
import datasetRoutes from './modules/dataset/dataset.routes';
import chartRoutes from './modules/chart/chart.routes';
import aiRoutes from './modules/ai/ai.routes';
import liveRoutes from './modules/live/live.routes';

const app = express();

// CORS configuration
const corsOptions = {
  origin: ENV.CLIENT_URL || true, // Use env variable if set, otherwise allow all
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID'],
  optionsSuccessStatus: 200,
};

console.log(`✅ CORS Enabled for Origin: ${ENV.CLIENT_URL || 'ALL'}`);

// Apply CORS middleware to all routes
app.use(cors(corsOptions));
// Handle preflight requests explicitly
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api/live', liveRoutes);

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

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(ENV.PORT, () => {
    console.log(`🚀 InsightHub server running on port ${ENV.PORT}`);
  });
};

startServer();