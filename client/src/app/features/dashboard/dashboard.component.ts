// ============================================
// dashboard.component.ts — Redesigned
// ============================================
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DatasetService, DatasetSummary } from '../../core/services/dataset.service';
import { ChartConfig } from '../../core/services/chart.service';
import { AIQueryResponse } from '../../core/services/ai.service';
import { ChartBuilderComponent } from './components/chart-builder.component';
import { ChartCardComponent } from './components/chart-card.component';
import { AIQueryBarComponent } from './components/ai-query-bar.component';
import { AIChartCardComponent } from './components/ai-chart-card.component';

interface AIChartItem {
  question: string;
  config: ChartConfig;
  explanation: string;
  data: any[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ChartBuilderComponent,
    ChartCardComponent,
    AIQueryBarComponent,
    AIChartCardComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  dataset = signal<DatasetSummary | null>(null);
  charts = signal<ChartConfig[]>([]);
  aiCharts = signal<AIChartItem[]>([]);
  isLoading = signal(true);
  showBuilder = signal(false);

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private datasetService: DatasetService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/upload']); return; }

    this.datasetService.getAll().subscribe({
      next: (datasets: DatasetSummary[]) => {
        const found = datasets.find((d: DatasetSummary) => d._id === id);
        if (found) { this.dataset.set(found); }
        else { this.router.navigate(['/upload']); }
        this.isLoading.set(false);
      },
      error: () => { this.router.navigate(['/upload']); },
    });
  }

  onChartRequested(config: ChartConfig): void {
    this.charts.update((prev) => [...prev, config]);
    this.showBuilder.set(false);
  }

  onAIQueryResult(result: AIQueryResponse): void {
    this.aiCharts.update((prev) => [{
      question: result.question,
      config: result.config,
      explanation: result.explanation,
      data: result.data,
    }, ...prev]);
  }

  removeChart(index: number): void {
    this.charts.update((prev) => prev.filter((_: ChartConfig, i: number) => i !== index));
  }

  removeAIChart(index: number): void {
    this.aiCharts.update((prev) => prev.filter((_: AIChartItem, i: number) => i !== index));
  }

  get datasetId(): string { return this.dataset()?._id || ''; }
}