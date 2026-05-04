import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChartConfig, ChartDataPoint, GroupedChartDataPoint } from './chart.service';

export interface AIQueryResponse {
  question: string;
  config: ChartConfig;
  explanation: string;
  data: ChartDataPoint[] | GroupedChartDataPoint[];
}

export interface AIQueryHistoryItem {
  question: string;
  config: ChartConfig;
  explanation: string;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class AIService {
  private baseUrl = `${environment.apiUrl}/ai`;

  constructor(private http: HttpClient) {}

  askQuestion(datasetId: string, question: string): Observable<AIQueryResponse> {
    return this.http.post<AIQueryResponse>(
      `${this.baseUrl}/${datasetId}/ask`,
      { question }
    );
  }
}