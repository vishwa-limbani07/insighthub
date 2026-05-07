import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent {
  features: Array<{ icon: SafeHtml; title: string; desc: string; color: string }> = [];
  techStack = [
    { name: 'Angular 21', role: 'Frontend' },
    { name: 'Chart.js', role: 'Visualisation' },
    { name: 'Node.js + Express', role: 'Backend' },
    { name: 'MongoDB Atlas', role: 'Database' },
    { name: 'Claude AI', role: 'AI Engine' },
    { name: 'Socket.IO', role: 'Real-time' },
  ];

  stats = [
    { value: '6+', label: 'Chart Types' },
    { value: 'AI', label: 'Natural Language' },
    { value: '∞', label: 'Datasets' },
    { value: '< 1s', label: 'Live Updates' },
  ];

  constructor(private router: Router, private sanitizer: DomSanitizer) {
    this.features = [
      {
        color: 'indigo',
        icon: this.sanitizer.bypassSecurityTrustHtml(
          `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>`
        ),
        title: 'Smart Data Ingestion',
        desc: 'Drag & drop any CSV or JSON file. Column types — numbers, dates, categories, booleans — are detected automatically. Zero configuration.',
      },
      {
        color: 'teal',
        icon: this.sanitizer.bypassSecurityTrustHtml(
          `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="12" width="4" height="9" rx="1"/>
            <rect x="10" y="7" width="4" height="14" rx="1"/>
            <rect x="17" y="3" width="4" height="18" rx="1"/>
          </svg>`
        ),
        title: 'Interactive Visualisations',
        desc: 'Bar, line, area, pie, doughnut, scatter, and data tables. Configure axes, aggregations, and groupings with a visual builder — no code needed.',
      },
      {
        color: 'violet',
        icon: this.sanitizer.bypassSecurityTrustHtml(
          `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3c-1 2.5-3.5 4-3.5 4S11 8.5 12 11c1-2.5 3.5-4 3.5-4S13 5.5 12 3z"/>
            <path d="M5 11c-.7 1.7-2.3 2.7-2.3 2.7S4.5 14.8 5 16.5c.5-1.7 2.3-2.8 2.3-2.8S5.7 12.7 5 11z"/>
            <path d="M18.5 7c-.5 1.4-1.8 2.2-1.8 2.2s1.5 1 1.8 2.3c.3-1.3 1.8-2.3 1.8-2.3S19 8.4 18.5 7z"/>
            <path d="M9 17c-.6 1.5-2 2.5-2 2.5s1.6 1 2 2.5c.4-1.5 2-2.5 2-2.5S9.6 18.5 9 17z"/>
            <circle cx="17" cy="17" r="1" fill="currentColor" stroke="none"/>
          </svg>`
        ),
        title: 'AI-Powered Queries',
        desc: 'Ask questions in plain English — "Show me revenue by region" — and AI selects the right chart type, axes, and aggregation automatically.',
      },
      {
        color: 'rose',
        icon: this.sanitizer.bypassSecurityTrustHtml(
          `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>`
        ),
        title: 'Real-Time Live Feed',
        desc: 'Watch live e-commerce orders stream in with auto-updating charts, revenue counters, and a real-time order ticker — powered by WebSockets.',
      },
    ];
  }

  goToUpload(): void {
    this.router.navigate(['/upload']);
  }

  goToLive(): void {
    this.router.navigate(['/live']);
  }
}
