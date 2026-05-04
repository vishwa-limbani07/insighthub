import { Request, Response } from 'express';
import { Dataset } from '../dataset/dataset.model';
import { generateChartConfig } from './ai.service';
import { aggregateData } from '../chart/chart.service';

export const askData = async (req: Request, res: Response) => {
  try {
    const { datasetId } = req.params;
    const { question } = req.body;
    const sessionId = req.headers['x-session-id'] as string;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    if (!question || typeof question !== 'string' || question.trim() === '') {
      return res.status(400).json({ error: 'Question is required' });
    }

    const dataset = await Dataset.findOne({ _id: datasetId, sessionId });

    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    // Send column schema to AI (NOT the actual data — keeps tokens low)
    const columnSchema = dataset.columns.map((col) => ({
      name: col.name,
      type: col.type,
      sampleValues: col.sampleValues,
      uniqueCount: col.uniqueCount,
    }));

    // Get AI-generated chart config
    const aiConfig = await generateChartConfig(
      question.trim(),
      columnSchema,
      dataset.name
    );

    // Use the AI config to aggregate the actual data
    const chartData = aggregateData(dataset.data, {
      xAxis: aiConfig.xAxis,
      yAxis: aiConfig.yAxis,
      aggregation: aiConfig.aggregation,
      groupBy: aiConfig.groupBy,
    });

    res.json({
      question: question.trim(),
      config: {
        chartType: aiConfig.chartType,
        xAxis: aiConfig.xAxis,
        yAxis: aiConfig.yAxis,
        aggregation: aiConfig.aggregation,
        groupBy: aiConfig.groupBy,
        title: aiConfig.title,
      },
      explanation: aiConfig.explanation,
      data: chartData,
    });
  } catch (error: any) {
    console.error('AI query error:', error);
    res.status(500).json({
      error: error.message || 'Failed to process your question',
    });
  }
};