import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import { connectDB } from './config/db';
import datasetRoutes from './modules/dataset/dataset.routes';
import chartRoutes from './modules/chart/chart.routes';
import aiRoutes from './modules/ai/ai.routes';
import liveRoutes from './modules/live/live.routes';

const app = express();

// For portfolio projects, allow all origins — simplest and most reliable
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, x-session-id'
  );

  // Respond immediately to preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
});

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
    console.log(`🚀 Vizora server running on port ${ENV.PORT}`);
  });
};

startServer();