import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AIService, AIQueryResponse } from '../../../core/services/ai.service';

@Component({
  selector: 'app-ai-query-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-query-bar.component.html',
  styleUrls: ['./ai-query-bar.component.scss'],
})
export class AIQueryBarComponent {
  @Input({ required: true }) datasetId!: string;
  @Output() queryResult = new EventEmitter<AIQueryResponse>();

  question = signal('');
  isLoading = signal(false);
  error = signal<string | null>(null);

  suggestions = [
    'Show me total revenue by region',
    'What is the average units sold per product?',
    'Compare revenue across categories',
    'Which product has the highest revenue?',
    'Show distribution of sales by region',
  ];

  constructor(private aiService: AIService) {}

  askQuestion(): void {
    const q = this.question().trim();
    if (!q || this.isLoading()) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.aiService.askQuestion(this.datasetId, q).subscribe({
      next: (response: AIQueryResponse) => {
        this.queryResult.emit(response);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.error.set(err.error?.error || 'Failed to process your question');
        this.isLoading.set(false);
      },
    });
  }

  useSuggestion(suggestion: string): void {
    this.question.set(suggestion);
    this.askQuestion();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.askQuestion();
    }
  }
}