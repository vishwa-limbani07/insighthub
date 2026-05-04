import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'grouped-bar' | 'table';
export type Aggregation = 'sum' | 'avg' | 'count' | 'min' | 'max';

export interface ChartConfig {
  chartType: ChartType;
  xAxis: string;
  yAxis: string;
  aggregation: Aggregation;
  groupBy?: string;
  title?: string;
  sortBy?: 'label' | 'value';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface GroupedChartDataPoint {
  name: string;
  series: { name: string; value: number }[];
}

export interface ChartResponse {
  datasetId: string;
  config: Partial<ChartConfig>;
  data: ChartDataPoint[] | GroupedChartDataPoint[];
}

@Injectable({ providedIn: 'root' })
export class ChartService {
  private baseUrl = `${environment.apiUrl}/charts`;

  constructor(private http: HttpClient) {}

  getChartData(datasetId: string, config: ChartConfig): Observable<ChartResponse> {
    let params = new HttpParams()
      .set('xAxis', config.xAxis)
      .set('yAxis', config.yAxis)
      .set('aggregation', config.aggregation);

    if (config.groupBy) params = params.set('groupBy', config.groupBy);
    if (config.sortBy) params = params.set('sortBy', config.sortBy);
    if (config.sortOrder) params = params.set('sortOrder', config.sortOrder);
    if (config.limit) params = params.set('limit', config.limit.toString());

    return this.http.get<ChartResponse>(`${this.baseUrl}/${datasetId}`, { params });
  }
}