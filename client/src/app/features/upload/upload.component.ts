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
  uploadError = signal<string | null>(null);
  uploadedDataset = signal<DatasetSummary | null>(null);

  constructor(
    private datasetService: DatasetService,
    private router: Router
  ) {}

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
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    // Validate file type
    const validTypes = ['.csv', '.json'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validTypes.includes(ext)) {
      this.uploadError.set('Please upload a CSV or JSON file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.uploadError.set('File size must be under 10MB');
      return;
    }

    this.uploadError.set(null);
    this.isUploading.set(true);

    this.datasetService.upload(file).subscribe({
      next: (dataset) => {
        this.isUploading.set(false);
        this.uploadedDataset.set(dataset);
      },
      error: (err) => {
        this.isUploading.set(false);
        this.uploadError.set(err.error?.error || 'Upload failed');
      },
    });
  }

  viewDataset(): void {
    const dataset = this.uploadedDataset();
    if (dataset) {
      this.router.navigate(['/datasets', dataset._id]);
    }
  }

  uploadAnother(): void {
    this.uploadedDataset.set(null);
    this.uploadError.set(null);
  }
  goToLive(): void {
  this.router.navigate(['/live']);
}
}