// ============================================
// live-feed.component.ts — Updated for light theme
// Only the chart color options change.
// Replace the buildBarOptions, buildPieOptions, buildLineOptions,
// and the colors array + updateRevenueByRegion methods.
// Below is the FULL file for clean replacement.
// ============================================

import { Component, OnDestroy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType as ChartJSType } from 'chart.js';
import {
  Chart, DoughnutController, BarController, LineController,
  ArcElement, BarElement, LineElement, PointElement,
  CategoryScale, LinearScale, Tooltip, Legend, Filler,
} from 'chart.js';
import { LiveService, LiveOrder } from '../../core/services/live.service';

Chart.register(
  DoughnutController, BarController, LineController,
  ArcElement, BarElement, LineElement, PointElement,
  CategoryScale, LinearScale, Tooltip, Legend, Filler
);

@Component({
  selector: 'app-live-feed',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './live-feed.component.html',
  styleUrls: ['./live-feed.component.scss'],
})
export class LiveFeedComponent implements OnDestroy {
  revenueByRegionType: ChartJSType = 'bar';
  revenueByRegionData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  revenueByRegionOptions: ChartConfiguration['options'];

  ordersByProductType: ChartJSType = 'doughnut';
  ordersByProductData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  ordersByProductOptions: ChartConfiguration['options'];

  revenueOverTimeType: ChartJSType = 'line';
  revenueOverTimeData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  revenueOverTimeOptions: ChartConfiguration['options'];

  private colors = ['#4F46E5', '#EC4899', '#14B8A6', '#F59E0B', '#8B5CF6', '#06B6D4', '#F97316', '#64748B'];

  constructor(public liveService: LiveService, private router: Router) {
    this.revenueByRegionOptions = this.buildBarOptions();
    this.ordersByProductOptions = this.buildPieOptions();
    this.revenueOverTimeOptions = this.buildLineOptions();

    effect(() => {
      const orders = this.liveService.orders();
      if (orders.length > 0) {
        this.updateRevenueByRegion(orders);
        this.updateOrdersByProduct(orders);
        this.updateRevenueOverTime(orders);
      }
    });
  }

  toggleStream(): void {
    if (this.liveService.isStreaming()) { this.liveService.stopStream(); }
    else { this.liveService.clearData(); this.liveService.startStream(); }
  }

  ngOnDestroy(): void { this.liveService.stopStream(); }
  goBack(): void { this.router.navigate(['/upload']); }

  private updateRevenueByRegion(orders: LiveOrder[]): void {
    const grouped = new Map<string, number>();
    orders.forEach((o: LiveOrder) => grouped.set(o.region, (grouped.get(o.region) || 0) + o.revenue));
    this.revenueByRegionData = {
      labels: Array.from(grouped.keys()),
      datasets: [{
        label: 'Revenue',
        data: Array.from(grouped.values()),
        backgroundColor: this.colors.slice(0, grouped.size).map((c) => c + '20'),
        borderColor: this.colors.slice(0, grouped.size),
        borderWidth: 1,
        borderRadius: 6,
      }],
    };
  }

  private updateOrdersByProduct(orders: LiveOrder[]): void {
    const grouped = new Map<string, number>();
    orders.forEach((o: LiveOrder) => grouped.set(o.product, (grouped.get(o.product) || 0) + 1));
    this.ordersByProductData = {
      labels: Array.from(grouped.keys()),
      datasets: [{
        data: Array.from(grouped.values()),
        backgroundColor: this.colors.slice(0, grouped.size).map((c) => c + 'CC'),
        borderColor: '#FFFFFF',
        borderWidth: 2,
      }],
    };
  }

  private updateRevenueOverTime(orders: LiveOrder[]): void {
    const grouped = new Map<string, number>();
    orders.forEach((o: LiveOrder) => {
      const date = new Date(o.timestamp);
      const rounded = new Date(Math.floor(date.getTime() / 10000) * 10000);
      const label = rounded.toLocaleTimeString();
      grouped.set(label, (grouped.get(label) || 0) + o.revenue);
    });
    const entries = Array.from(grouped.entries()).slice(-15);
    this.revenueOverTimeData = {
      labels: entries.map((e) => e[0]),
      datasets: [{
        label: 'Revenue',
        data: entries.map((e) => e[1]),
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#4F46E5',
      }],
    };
  }

  // --- Light theme chart options ---

  private buildBarOptions(): ChartConfiguration['options'] {
    return {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: '#111318', titleColor: '#FFF', bodyColor: '#E4E5EA', borderWidth: 0, padding: 10, cornerRadius: 8, titleFont: { size: 12, family: 'DM Sans' }, bodyFont: { size: 11, family: 'DM Sans' } },
      },
      scales: {
        x: { ticks: { color: '#8B8E99', font: { size: 11, family: 'DM Sans' } }, grid: { color: '#F0F1F4' }, border: { display: false } },
        y: { ticks: { color: '#8B8E99', font: { size: 11, family: 'DM Sans' } }, grid: { color: '#F0F1F4' }, border: { display: false }, beginAtZero: true },
      },
      animation: { duration: 400 },
    };
  }

  private buildPieOptions(): ChartConfiguration['options'] {
    return {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' as const, labels: { color: '#5C5F6A', padding: 12, font: { size: 11, family: 'DM Sans' }, usePointStyle: true, pointStyleWidth: 8 } },
        tooltip: { backgroundColor: '#111318', titleColor: '#FFF', bodyColor: '#E4E5EA', padding: 10, cornerRadius: 8 },
      },
      animation: { duration: 400 },
    };
  }

  private buildLineOptions(): ChartConfiguration['options'] {
    return {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: '#111318', titleColor: '#FFF', bodyColor: '#E4E5EA', padding: 10, cornerRadius: 8 },
      },
      scales: {
        x: { ticks: { color: '#8B8E99', maxRotation: 45, font: { size: 11, family: 'DM Sans' } }, grid: { color: '#F0F1F4' }, border: { display: false } },
        y: { ticks: { color: '#8B8E99', font: { size: 11, family: 'DM Sans' } }, grid: { color: '#F0F1F4' }, border: { display: false }, beginAtZero: true },
      },
      animation: { duration: 400 },
    };
  }
}