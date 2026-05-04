// ============================================
// upload.component.ts — Redesigned
// ============================================
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DatasetService, DatasetSummary } from '../../core/services/dataset.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent {
  isDragging = signal(false);
  isUploading = signal(false);
  uploadProgress = signal(0);
  uploadError = signal<string | null>(null);
  uploadedDataset = signal<DatasetSummary | null>(null);
  recentDatasets = signal<DatasetSummary[]>([]);

  constructor(
    private datasetService: DatasetService,
    private router: Router
  ) {
    this.loadRecentDatasets();
  }

  private loadRecentDatasets(): void {
    this.datasetService.getAll().subscribe({
      next: (datasets: DatasetSummary[]) => this.recentDatasets.set(datasets),
      error: () => {},
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) this.handleFile(files[0]);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) this.handleFile(input.files[0]);
  }

  private handleFile(file: File): void {
    const validTypes = ['.csv', '.json'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validTypes.includes(ext)) {
      this.uploadError.set('Please upload a CSV or JSON file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.uploadError.set('File size must be under 10MB');
      return;
    }

    this.uploadError.set(null);
    this.isUploading.set(true);

    this.datasetService.upload(file).subscribe({
      next: (dataset: DatasetSummary) => {
        this.isUploading.set(false);
        this.uploadedDataset.set(dataset);
        this.loadRecentDatasets();
      },
      error: (err: any) => {
        this.isUploading.set(false);
        this.uploadError.set(err.error?.error || 'Upload failed. Please try again.');
      },
    });
  }

  viewDataset(id?: string): void {
    const datasetId = id || this.uploadedDataset()?._id;
    if (datasetId) this.router.navigate(['/datasets', datasetId]);
  }

  openDashboard(id?: string): void {
    const datasetId = id || this.uploadedDataset()?._id;
    if (datasetId) this.router.navigate(['/dashboard', datasetId]);
  }

  deleteDataset(id: string, event: Event): void {
    event.stopPropagation();
    this.datasetService.delete(id).subscribe({
      next: () => this.loadRecentDatasets(),
    });
  }

  uploadAnother(): void {
    this.uploadedDataset.set(null);
    this.uploadError.set(null);
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      number: '#',
      date: '📅',
      category: '◎',
      string: 'Aa',
      boolean: '⊘',
    };
    return icons[type] || '?';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}