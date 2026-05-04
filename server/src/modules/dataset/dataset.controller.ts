import { Request, Response } from 'express';
import { Dataset } from './dataset.model';
import { parseCSV, parseJSON } from './parser.service';
import { detectAllColumns } from './type-detector';
import path from 'path';

export const uploadDataset = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const sessionId = req.headers['x-session-id'] as string;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    // Parse based on file type
    const ext = path.extname(file.originalname).toLowerCase();
    let data: Record<string, any>[];

    if (ext === '.csv') {
      data = parseCSV(file.buffer);
    } else if (ext === '.json') {
      data = parseJSON(file.buffer);
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    if (data.length === 0) {
      return res.status(400).json({ error: 'File contains no data' });
    }

    // Detect column types
    const columnDetections = detectAllColumns(data);
    const columns = columnDetections.map(({ name, detection }) => ({
      name,
      type: detection.type,
      sampleValues: detection.sampleValues,
      uniqueCount: detection.uniqueCount,
      nullCount: detection.nullCount,
    }));

    // Create dataset name from filename (without extension)
    const datasetName = path.basename(file.originalname, ext);

    // Save to MongoDB
    const dataset = await Dataset.create({
      name: datasetName,
      originalFileName: file.originalname,
      fileType: ext.replace('.', '') as 'csv' | 'json',
      columns,
      data,
      rowCount: data.length,
      sessionId,
    });

    // Return without the full data array (could be huge)
    res.status(201).json({
      _id: dataset._id,
      name: dataset.name,
      originalFileName: dataset.originalFileName,
      fileType: dataset.fileType,
      columns: dataset.columns,
      rowCount: dataset.rowCount,
      createdAt: dataset.createdAt,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
};

export const getDatasets = async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers['x-session-id'] as string;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    // Return list without the heavy 'data' field
    const datasets = await Dataset.find({ sessionId })
      .select('-data')
      .sort({ createdAt: -1 });

    res.json(datasets);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch datasets' });
  }
};

export const getDatasetById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sessionId = req.headers['x-session-id'] as string;

    const dataset = await Dataset.findOne({ _id: id, sessionId });

    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    res.json(dataset);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch dataset' });
  }
};

export const getDatasetPreview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sessionId = req.headers['x-session-id'] as string;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    const dataset = await Dataset.findOne({ _id: id, sessionId });

    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    res.json({
      _id: dataset._id,
      name: dataset.name,
      columns: dataset.columns,
      rowCount: dataset.rowCount,
      preview: dataset.data.slice(0, limit),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch preview' });
  }
};

export const deleteDataset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sessionId = req.headers['x-session-id'] as string;

    const result = await Dataset.findOneAndDelete({ _id: id, sessionId });

    if (!result) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    res.json({ message: 'Dataset deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete dataset' });
  }
};