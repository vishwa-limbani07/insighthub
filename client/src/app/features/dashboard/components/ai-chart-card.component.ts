import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType as ChartJSType } from 'chart.js';
import {
  ChartConfig,
  ChartDataPoint,
  GroupedChartDataPoint,
} from '../../../core/services/chart.service';

@Component({
  selector: 'app-ai-chart-card',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './ai-chart-card.component.html',
  styleUrls: ['./ai-chart-card.component.scss'],
})
export class AIChartCardComponent implements OnInit {
  @Input({ required: true }) config!: ChartConfig;
  @Input({ required: true }) data!: ChartDataPoint[] | GroupedChartDataPoint[];
  @Input({ required: true }) question!: string;
  @Input({ required: true }) explanation!: string;
  @Output() removed = new EventEmitter<void>();
  @Output() addToDashboard = new EventEmitter<ChartConfig>();

  chartType: ChartJSType = 'bar';
  chartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  chartOptions: ChartConfiguration['options'] = {};

  // For table view
  tableData = signal<ChartDataPoint[]>([]);

  private colors = [
    '#6c63ff', '#ff6384', '#36a2eb', '#ffce56',
    '#4bc0c0', '#9966ff', '#ff9f40', '#c9cbcf',
  ];

  ngOnInit(): void {
    this.chartType = this.mapChartType(this.config.chartType);
    this.chartOptions = this.buildOptions();

    if (this.config.chartType === 'table') {
      this.tableData.set(this.data as ChartDataPoint[]);
    } else {
      this.buildChartData();
    }
  }

  get isTableView(): boolean {
    return this.config.chartType === 'table';
  }

  get title(): string {
    return this.config.title || 'AI Generated Chart';
  }

  private buildChartData(): void {
    if (this.config.groupBy && this.data.length > 0 && 'series' in this.data[0]) {
      const grouped = this.data as GroupedChartDataPoint[];
      const labels = grouped.map((d: GroupedChartDataPoint) => d.name);

      const seriesNames = new Set<string>();
      grouped.forEach((d: GroupedChartDataPoint) =>
        d.series.forEach((s: { name: string; value: number }) =>
          seriesNames.add(s.name)
        )
      );

      const datasets = Array.from(seriesNames).map(
        (seriesName: string, i: number) => ({
          label: seriesName,
          data: grouped.map((d: GroupedChartDataPoint) => {
            const found = d.series.find(
              (s: { name: string; value: number }) => s.name === seriesName
            );
            return found ? found.value : 0;
          }),
          backgroundColor: this.colors[i % this.colors.length],
          borderColor: this.colors[i % this.colors.length],
          borderWidth:
            this.config.chartType === 'line' || this.config.chartType === 'area'
              ? 2
              : 0,
          fill: this.config.chartType === 'area',
          tension: 0.3,
        })
      );

      this.chartData = { labels, datasets };
    } else {
      const simple = this.data as ChartDataPoint[];
      const labels = simple.map((d: ChartDataPoint) => d.name);
      const values = simple.map((d: ChartDataPoint) => d.value);

      if (this.config.chartType === 'pie') {
        this.chartData = {
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: labels.map(
                (_: string, i: number) => this.colors[i % this.colors.length]
              ),
            },
          ],
        };
      } else {
        this.chartData = {
          labels,
          datasets: [
            {
              label: `${this.config.aggregation} of ${this.config.yAxis}`,
              data: values,
              backgroundColor: this.colors[0],
              borderColor: this.colors[0],
              borderWidth:
                this.config.chartType === 'line' || this.config.chartType === 'area'
                  ? 2
                  : 0,
              fill: this.config.chartType === 'area',
              tension: 0.3,
            },
          ],
        };
      }
    }
  }

  private mapChartType(type: string): ChartJSType {
    const mapping: Record<string, ChartJSType> = {
      bar: 'bar',
      'grouped-bar': 'bar',
      line: 'line',
      area: 'line',
      pie: 'pie',
    };
    return mapping[type] || 'bar';
  }

  private buildOptions(): ChartConfiguration['options'] {
    const isPie = this.config.chartType === 'pie';

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: !!this.config.groupBy || isPie,
          position: 'bottom' as const,
          labels: { color: '#aaa', padding: 15, font: { size: 11 } },
        },
        tooltip: {
          backgroundColor: '#1a1a2e',
          titleColor: '#e0e0e0',
          bodyColor: '#ccc',
          borderColor: '#2a2a40',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
        },
      },
      scales: isPie
        ? {}
        : {
            x: {
              ticks: { color: '#888', font: { size: 11 } },
              grid: { color: 'rgba(255,255,255,0.05)' },
            },
            y: {
              ticks: { color: '#888', font: { size: 11 } },
              grid: { color: 'rgba(255,255,255,0.05)' },
              beginAtZero: true,
            },
          },
      animation: { duration: 600, easing: 'easeOutQuart' as const },
    };
  }
}