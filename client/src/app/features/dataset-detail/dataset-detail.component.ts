// ============================================
// dataset-detail.component.ts — Redesigned
// ============================================
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DatasetService, DatasetPreview } from '../../core/services/dataset.service';

@Component({
  selector: 'app-dataset-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dataset-detail.component.html',
  styleUrls: ['./dataset-detail.component.scss'],
})
export class DatasetDetailComponent implements OnInit {
  dataset = signal<DatasetPreview | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private datasetService: DatasetService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/upload']); return; }

    this.datasetService.getPreview(id).subscribe({
      next: (data: DatasetPreview) => { this.dataset.set(data); this.isLoading.set(false); },
      error: (err: any) => { this.error.set(err.error?.error || 'Failed to load'); this.isLoading.set(false); },
    });
  }

  getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      number: '#059669', date: '#2563EB', category: '#D97706',
      string: '#64748B', boolean: '#DB2777',
    };
    return colors[type] || '#64748B';
  }

  getTypeBg(type: string): string {
    const bgs: Record<string, string> = {
      number: '#F0FDF4', date: '#EFF6FF', category: '#FFFBEB',
      string: '#F7F8FA', boolean: '#FDF2F8',
    };
    return bgs[type] || '#F7F8FA';
  }

  goBack(): void { this.router.navigate(['/upload']); }

  goToDashboard(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.router.navigate(['/dashboard', id]);
  }
}