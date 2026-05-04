import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ColumnMeta {
  name: string;
  type: 'number' | 'date' | 'string' | 'category' | 'boolean';
  sampleValues: any[];
  uniqueCount: number;
  nullCount: number;
}

export interface DatasetSummary {
  _id: string;
  name: string;
  originalFileName: string;
  fileType: 'csv' | 'json';
  columns: ColumnMeta[];
  rowCount: number;
  createdAt: string;
}

export interface DatasetPreview extends DatasetSummary {
  preview: Record<string, any>[];
}

export interface DatasetFull extends DatasetSummary {
  data: Record<string, any>[];
}

@Injectable({ providedIn: 'root' })
export class DatasetService {
  private baseUrl = `${environment.apiUrl}/datasets`;

  constructor(private http: HttpClient) {}

  upload(file: File): Observable<DatasetSummary> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<DatasetSummary>(`${this.baseUrl}/upload`, formData);
  }

  getAll(): Observable<DatasetSummary[]> {
    return this.http.get<DatasetSummary[]>(this.baseUrl);
  }

  getById(id: string): Observable<DatasetFull> {
    return this.http.get<DatasetFull>(`${this.baseUrl}/${id}`);
  }

  getPreview(id: string, limit = 50): Observable<DatasetPreview> {
    return this.http.get<DatasetPreview>(
      `${this.baseUrl}/${id}/preview?limit=${limit}`
    );
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}