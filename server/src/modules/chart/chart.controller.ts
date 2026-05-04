import { Request, Response } from 'express';
import { Dataset } from '../dataset/dataset.model';
import { aggregateData } from './chart.service';

export const getChartData = async (req: Request, res: Response) => {
  try {
    const { datasetId } = req.params;
    const sessionId = req.headers['x-session-id'] as string;
    const {
      xAxis,
      yAxis,
      aggregation = 'sum',
      groupBy,
      sortBy,
      sortOrder,
      limit,
    } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    if (!xAxis || !yAxis) {
      return res.status(400).json({ error: 'xAxis and yAxis are required' });
    }

    const dataset = await Dataset.findOne({ _id: datasetId, sessionId });

    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    const result = aggregateData(dataset.data, {
      xAxis: xAxis as string,
      yAxis: yAxis as string,
      aggregation: aggregation as any,
      groupBy: groupBy as string | undefined,
      sortBy: sortBy as 'label' | 'value' | undefined,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json({
      datasetId,
      config: { xAxis, yAxis, aggregation, groupBy },
      data: result,
    });
  } catch (error: any) {
    console.error('Chart data error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate chart data' });
  }
};