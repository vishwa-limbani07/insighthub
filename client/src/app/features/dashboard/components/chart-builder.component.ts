import { Component, EventEmitter, Input, Output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColumnMeta } from '../../../core/services/dataset.service';
import { Aggregation, ChartConfig, ChartType } from '../../../core/services/chart.service';


@Component({
  selector: 'app-chart-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chart-builder.component.html',
  styleUrls: ['./chart-builder.component.scss'],
})
export class ChartBuilderComponent implements OnInit {
  @Input({ required: true }) columns!: ColumnMeta[];
  @Output() chartRequested = new EventEmitter<ChartConfig>();
  @Output() closed = new EventEmitter<void>();

  chartTypes: { value: ChartType; label: string; icon: string }[] = [
    { value: 'bar', label: 'Bar', icon: '📊' },
    { value: 'line', label: 'Line', icon: '📈' },
    { value: 'pie', label: 'Pie', icon: '🥧' },
    { value: 'area', label: 'Area', icon: '🏔️' },
    { value: 'grouped-bar', label: 'Grouped Bar', icon: '📊' },
    { value: 'table', label: 'Table', icon: '📋' },
  ];

  aggregations: { value: Aggregation; label: string }[] = [
    { value: 'sum', label: 'Sum' },
    { value: 'avg', label: 'Average' },
    { value: 'count', label: 'Count' },
    { value: 'min', label: 'Min' },
    { value: 'max', label: 'Max' },
  ];

  // Form state
  selectedChartType = signal<ChartType>('bar');
  selectedXAxis = signal<string>('');
  selectedYAxis = signal<string>('');
  selectedAggregation = signal<Aggregation>('sum');
  selectedGroupBy = signal<string>('');
  chartTitle = signal<string>('');

  // Computed column lists based on type
  get categoryColumns(): ColumnMeta[] {
    return this.columns.filter(
      (c) => c.type === 'category' || c.type === 'string' || c.type === 'date'
    );
  }

  get numericColumns(): ColumnMeta[] {
    return this.columns.filter((c) => c.type === 'number');
  }

  get groupByColumns(): ColumnMeta[] {
    return this.columns.filter(
      (c) =>
        (c.type === 'category' || c.type === 'string') &&
        c.name !== this.selectedXAxis()
    );
  }

  ngOnInit(): void {
    // Auto-select sensible defaults
    if (this.categoryColumns.length > 0) {
      this.selectedXAxis.set(this.categoryColumns[0].name);
    }
    if (this.numericColumns.length > 0) {
      this.selectedYAxis.set(this.numericColumns[0].name);
    }
  }

  onSubmit(): void {
    const config: ChartConfig = {
      chartType: this.selectedChartType(),
      xAxis: this.selectedXAxis(),
      yAxis: this.selectedYAxis(),
      aggregation: this.selectedAggregation(),
      title:
        this.chartTitle() ||
        `${this.selectedAggregation()} of ${this.selectedYAxis()} by ${this.selectedXAxis()}`,
    };

    if (this.selectedGroupBy()) {
      config.groupBy = this.selectedGroupBy();
    }

    this.chartRequested.emit(config);
  }

  get isValid(): boolean {
    return !!this.selectedXAxis() && !!this.selectedYAxis();
  }
}