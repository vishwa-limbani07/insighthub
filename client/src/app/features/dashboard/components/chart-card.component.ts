// ============================================
// chart-card.component.ts — Redesigned for light theme
// ============================================
// ONLY the color/options need to change. The logic stays the same.
// Replace the private colors and buildOptions method in your existing file.
// Below is the FULL file for a clean replacement.
// ============================================

import {
  Component, Input, Output, EventEmitter, OnInit, signal, ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType as ChartJSType } from 'chart.js';
import {
  Chart, BarController, LineController, PieController,
  ArcElement, BarElement, LineElement, PointElement,
  CategoryScale, LinearScale, Tooltip, Legend, Filler,
} from 'chart.js';
import {
  ChartService, ChartConfig, ChartDataPoint,
  GroupedChartDataPoint, ChartResponse,
} from '../../../core/services/chart.service';

Chart.register(
  BarController, LineController, PieController,
  ArcElement, BarElement, LineElement, PointElement,
  CategoryScale, LinearScale, Tooltip, Legend, Filler
);

@Component({
  selector: 'app-chart-card',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './chart-card.component.html',
  styleUrls: ['./chart-card.component.scss'],
})
export class ChartCardComponent implements OnInit {
  @Input({ required: true }) datasetId!: string;
  @Input({ required: true }) config!: ChartConfig;
  @Output() removed = new EventEmitter<void>();
  @ViewChild(BaseChartDirective) chartDirective?: BaseChartDirective;

  isLoading = signal(true);
  error = signal<string | null>(null);
  chartType: ChartJSType = 'bar';
  chartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  chartOptions: ChartConfiguration['options'] = {};
  tableData = signal<ChartDataPoint[]>([]);

  // Updated palette for light theme
  private colors = [
    '#4F46E5', '#EC4899', '#14B8A6', '#F59E0B',
    '#8B5CF6', '#06B6D4', '#F97316', '#64748B',
  ];

  constructor(private chartService: ChartService) {}

  ngOnInit(): void {
    this.chartType = this.mapChartType(this.config.chartType);
    this.chartOptions = this.buildOptions();
    this.loadChartData();
  }

  get title(): string {
    return this.config.title || `${this.config.aggregation} of ${this.config.yAxis} by ${this.config.xAxis}`;
  }

  get isTableView(): boolean { return this.config.chartType === 'table'; }

  private loadChartData(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.chartService.getChartData(this.datasetId, this.config).subscribe({
      next: (response: ChartResponse) => {
        if (this.isTableView) { this.tableData.set(response.data as ChartDataPoint[]); }
        else { this.buildChartData(response.data); }
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.error.set(err.error?.error || 'Failed to load chart data');
        this.isLoading.set(false);
      },
    });
  }

  private buildChartData(data: ChartDataPoint[] | GroupedChartDataPoint[]): void {
    if (this.config.groupBy && data.length > 0 && 'series' in data[0]) {
      this.buildGroupedChartData(data as GroupedChartDataPoint[]);
    } else {
      this.buildSimpleChartData(data as ChartDataPoint[]);
    }
  }

  private buildGroupedChartData(grouped: GroupedChartDataPoint[]): void {
    const labels = grouped.map((d: GroupedChartDataPoint) => d.name);
    const seriesNames = new Set<string>();
    grouped.forEach((d: GroupedChartDataPoint) =>
      d.series.forEach((s: { name: string; value: number }) => seriesNames.add(s.name))
    );
    const datasets = Array.from(seriesNames).map((seriesName: string, i: number) => ({
      label: seriesName,
      data: grouped.map((d: GroupedChartDataPoint) => {
        const found = d.series.find((s: { name: string; value: number }) => s.name === seriesName);
        return found ? found.value : 0;
      }),
      backgroundColor: this.colors[i % this.colors.length] + '20',
      borderColor: this.colors[i % this.colors.length],
      borderWidth: this.config.chartType === 'line' || this.config.chartType === 'area' ? 2 : 1,
      fill: this.config.chartType === 'area',
      tension: 0.4,
      borderRadius: 6,
    }));
    this.chartData = { labels, datasets };
  }

  private buildSimpleChartData(simple: ChartDataPoint[]): void {
    const labels = simple.map((d: ChartDataPoint) => d.name);
    const values = simple.map((d: ChartDataPoint) => d.value);
    if (this.config.chartType === 'pie') {
      this.chartData = {
        labels,
        datasets: [{
          data: values,
          backgroundColor: labels.map((_: string, i: number) => this.colors[i % this.colors.length] + 'CC'),
          borderColor: '#FFFFFF',
          borderWidth: 2,
        }],
      };
    } else {
      this.chartData = {
        labels,
        datasets: [{
          label: `${this.config.aggregation} of ${this.config.yAxis}`,
          data: values,
          backgroundColor: this.colors[0] + '20',
          borderColor: this.colors[0],
          borderWidth: this.config.chartType === 'line' || this.config.chartType === 'area' ? 2 : 1,
          fill: this.config.chartType === 'area',
          tension: 0.4,
          borderRadius: 6,
        }],
      };
    }
  }

  private mapChartType(type: string): ChartJSType {
    const mapping: Record<string, ChartJSType> = {
      bar: 'bar', 'grouped-bar': 'bar', line: 'line', area: 'line', pie: 'pie',
    };
    return mapping[type] || 'bar';
  }

  // LIGHT THEME chart options
  private buildOptions(): ChartConfiguration['options'] {
    const isPie = this.config.chartType === 'pie';
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: !!this.config.groupBy || isPie,
          position: 'bottom' as const,
          labels: { color: '#5C5F6A', padding: 16, font: { size: 11, family: 'DM Sans' }, usePointStyle: true, pointStyleWidth: 8 },
        },
        tooltip: {
          backgroundColor: '#111318',
          titleColor: '#FFFFFF',
          bodyColor: '#E4E5EA',
          borderColor: '#2A2A40',
          borderWidth: 0,
          padding: 12,
          cornerRadius: 8,
          titleFont: { size: 12, weight: 600, family: 'DM Sans' },
          bodyFont: { size: 11, family: 'DM Sans' },
        },
      },
      scales: isPie ? {} : {
        x: {
          ticks: { color: '#8B8E99', font: { size: 11, family: 'DM Sans' } },
          grid: { color: '#F0F1F4', drawTicks: false },
          border: { display: false },
          title: { display: true, text: this.config.xAxis, color: '#5C5F6A', font: { size: 11, weight: 500, family: 'DM Sans' } },
        },
        y: {
          ticks: { color: '#8B8E99', font: { size: 11, family: 'DM Sans' }, padding: 8 },
          grid: { color: '#F0F1F4', drawTicks: false },
          border: { display: false },
          title: { display: true, text: this.config.yAxis, color: '#5C5F6A', font: { size: 11, weight: 500, family: 'DM Sans' } },
          beginAtZero: true,
        },
      },
      animation: { duration: 500, easing: 'easeOutQuart' as const },
    };
  }
}