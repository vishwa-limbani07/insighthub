import { Request, Response } from 'express';
import { generateMockOrder, generateInitialBatch, MockOrder } from './mock-data.service';

// Store active SSE connections
const activeConnections = new Map<string, Response>();

export const startLiveStream = (req: Request, res: Response) => {
  const sessionId = req.headers['x-session-id'] as string || 'anonymous';

  // SSE headers — these tell the browser to keep the connection open
  // and expect a stream of events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  // Send initial batch
  const initialData = generateInitialBatch(20);
  res.write(`event: initial\ndata: ${JSON.stringify(initialData)}\n\n`);

  // Send new order every 2-4 seconds
  const interval = setInterval(() => {
    const newOrder = generateMockOrder();
    res.write(`event: new-order\ndata: ${JSON.stringify(newOrder)}\n\n`);
  }, randomBetween(2000, 4000));

  // Store connection for cleanup
  activeConnections.set(sessionId, res);

  // Cleanup on disconnect
  req.on('close', () => {
    clearInterval(interval);
    activeConnections.delete(sessionId);
    res.end();
  });
};

export const getLiveSnapshot = (req: Request, res: Response) => {
  // Returns a one-time snapshot of mock data (for non-SSE usage)
  const data = generateInitialBatch(50);
  res.json({
    name: 'Live Orders',
    columns: [
      { name: 'timestamp', type: 'date', sampleValues: [data[0].timestamp], uniqueCount: 50, nullCount: 0 },
      { name: 'product', type: 'category', sampleValues: ['Widget A', 'Widget B', 'Widget C'], uniqueCount: 4, nullCount: 0 },
      { name: 'region', type: 'category', sampleValues: ['North', 'South', 'East'], uniqueCount: 4, nullCount: 0 },
      { name: 'category', type: 'category', sampleValues: ['Electronics', 'Clothing', 'Furniture'], uniqueCount: 4, nullCount: 0 },
      { name: 'revenue', type: 'number', sampleValues: [5000, 12000, 8500], uniqueCount: 50, nullCount: 0 },
      { name: 'units_sold', type: 'number', sampleValues: [10, 25, 42], uniqueCount: 50, nullCount: 0 },
    ],
    data,
    rowCount: data.length,
  });
};

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}