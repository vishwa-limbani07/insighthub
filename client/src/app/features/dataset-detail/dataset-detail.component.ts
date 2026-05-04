import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  DatasetService,
  DatasetPreview,
} from '../../core/services/dataset.service';

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
    if (!id) {
      this.router.navigate(['/upload']);
      return;
    }

    this.datasetService.getPreview(id).subscribe({
      next: (data) => {
        this.dataset.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Failed to load dataset');
        this.isLoading.set(false);
      },
    });
  }

  getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      number: '#4caf50',
      date: '#2196f3',
      category: '#ff9800',
      string: '#9e9e9e',
      boolean: '#e91e63',
    };
    return colors[type] || '#9e9e9e';
  }
goToDashboard(): void {
  const id = this.route.snapshot.paramMap.get('id');
  this.router.navigate(['/dashboard', id]);
}
  goBack(): void {
    this.router.navigate(['/upload']);
  }
}