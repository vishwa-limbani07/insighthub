import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType as ChartJSType } from 'chart.js';
import {
  Chart,
  BarController,
  LineController,
  PieController,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { ChartConfig, ChartDataPoint, ChartService, ChartResponse, GroupedChartDataPoint } from '../../../core/services/chart.service';


// Register Chart.js components
Chart.register(
  BarController,
  LineController,
  PieController,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
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

  // Chart.js config objects
  chartType: ChartJSType = 'bar';
  chartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  chartOptions: ChartConfiguration['options'] = {};

  // For table view
  tableData = signal<ChartDataPoint[]>([]);

  private colors = [
    '#6c63ff', '#ff6384', '#36a2eb', '#ffce56',
    '#4bc0c0', '#9966ff', '#ff9f40', '#c9cbcf',
  ];

  constructor(private chartService: ChartService) {}

  ngOnInit(): void {
    this.chartType = this.mapChartType(this.config.chartType);
    this.chartOptions = this.buildOptions();
    this.loadChartData();
  }

  get title(): string {
    return (
      this.config.title ||
      `${this.config.aggregation} of ${this.config.yAxis} by ${this.config.xAxis}`
    );
  }

  get isTableView(): boolean {
    return this.config.chartType === 'table';
  }

  private loadChartData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.chartService.getChartData(this.datasetId, this.config).subscribe({
      next: (response: ChartResponse) => {
        if (this.isTableView) {
          this.tableData.set(response.data as ChartDataPoint[]);
        } else {
          this.buildChartData(response.data);
        }
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.error.set(err.error?.error || 'Failed to load chart data');
        this.isLoading.set(false);
      },
    });
  }

  private buildChartData(
    data: ChartDataPoint[] | GroupedChartDataPoint[]
  ): void {
    if (this.config.groupBy && data.length > 0 && 'series' in data[0]) {
      this.buildGroupedChartData(data as GroupedChartDataPoint[]);
    } else {
      this.buildSimpleChartData(data as ChartDataPoint[]);
    }
  }

  private buildGroupedChartData(grouped: GroupedChartDataPoint[]): void {
    const labels = grouped.map((d: GroupedChartDataPoint) => d.name);

    // Collect all unique series names
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
          this.config.chartType === 'line' ||
          this.config.chartType === 'area'
            ? 2
            : 0,
        fill: this.config.chartType === 'area',
        tension: 0.3,
      })
    );

    this.chartData = { labels, datasets };
  }

  private buildSimpleChartData(simple: ChartDataPoint[]): void {
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
              this.config.chartType === 'line' ||
              this.config.chartType === 'area'
                ? 2
                : 0,
            fill: this.config.chartType === 'area',
            tension: 0.3,
          },
        ],
      };
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
          labels: {
            color: '#aaa',
            padding: 15,
            font: { size: 11 },
          },
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
              title: {
                display: true,
                text: this.config.xAxis,
                color: '#aaa',
              },
            },
            y: {
              ticks: { color: '#888', font: { size: 11 } },
              grid: { color: 'rgba(255,255,255,0.05)' },
              title: {
                display: true,
                text: this.config.yAxis,
                color: '#aaa',
              },
              beginAtZero: true,
            },
          },
      animation: {
        duration: 600,
        easing: 'easeOutQuart' as const,
      },
    };
  }
}