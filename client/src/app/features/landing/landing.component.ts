import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent {
  constructor(private router: Router) {}

  goToUpload(): void {
    this.router.navigate(['/upload']);
  }

  goToLive(): void {
    this.router.navigate(['/live']);
  }

  features = [
    {
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
      title: 'Smart Data Ingestion',
      desc: 'Upload CSV or JSON files. Auto-detects column types — numbers, dates, categories, booleans — with zero configuration.',
    },
    {
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg>`,
      title: 'Interactive Visualizations',
      desc: 'Bar, line, pie, area, grouped bar, and data tables. Configure axes, aggregations, and groupings with a visual builder.',
    },
    {
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a5 5 0 0 1 5 5c0 2.76-2.24 5-5 5s-5-2.24-5-5a5 5 0 0 1 5-5z"/><path d="M20 21v-2a4 4 0 0 0-3-3.87"/><path d="M4 21v-2a4 4 0 0 1 3-3.87"/><circle cx="12" cy="12" r="10" stroke-dasharray="4 4"/></svg>`,
      title: 'AI-Powered Queries',
      desc: 'Ask questions in plain English — "Show me revenue by region" — and the AI picks the right chart, axes, and aggregation.',
    },
    {
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
      title: 'Real-Time Live Feed',
      desc: 'Server-Sent Events stream simulated e-commerce data with auto-updating charts, stats, and an order ticker.',
    },
  ];

  techStack = [
    { name: 'Angular 21', role: 'Frontend' },
    { name: 'Chart.js', role: 'Visualization' },
    { name: 'Node.js + Express', role: 'Backend' },
    { name: 'MongoDB Atlas', role: 'Database' },
    { name: 'Google Gemini', role: 'AI Engine' },
    { name: 'SSE', role: 'Real-time' },
  ];
}