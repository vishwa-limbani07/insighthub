import mongoose, { Document, Schema } from 'mongoose';

export interface IColumnMeta {
  name: string;
  type: 'number' | 'date' | 'string' | 'category' | 'boolean';
  sampleValues: any[];
  uniqueCount: number;
  nullCount: number;
}

export interface IDataset extends Document {
  name: string;
  originalFileName: string;
  fileType: 'csv' | 'json';
  columns: IColumnMeta[];
  data: Record<string, any>[];
  rowCount: number;
  sessionId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ColumnMetaSchema = new Schema<IColumnMeta>(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['number', 'date', 'string', 'category', 'boolean'],
      required: true,
    },
    sampleValues: [Schema.Types.Mixed],
    uniqueCount: { type: Number, default: 0 },
    nullCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const DatasetSchema = new Schema<IDataset>(
  {
    name: { type: String, required: true },
    originalFileName: { type: String, required: true },
    fileType: { type: String, enum: ['csv', 'json'], required: true },
    columns: [ColumnMetaSchema],
    data: [Schema.Types.Mixed],
    rowCount: { type: Number, default: 0 },
    sessionId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

export const Dataset = mongoose.model<IDataset>('Dataset', DatasetSchema);