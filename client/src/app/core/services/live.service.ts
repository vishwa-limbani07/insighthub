import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LiveOrder {
  timestamp: string;
  product: string;
  region: string;
  category: string;
  revenue: number;
  units_sold: number;
  order_id: string;
}

@Injectable({ providedIn: 'root' })
export class LiveService {
  private baseUrl = `${environment.apiUrl}/live`;
  private eventSource: EventSource | null = null;

  // Reactive state using signals
  orders = signal<LiveOrder[]>([]);
  isStreaming = signal(false);
  latestOrder = signal<LiveOrder | null>(null);
  totalRevenue = computed(() =>
    this.orders().reduce((sum, o) => sum + o.revenue, 0)
  );
  totalOrders = computed(() => this.orders().length);

  constructor(private http: HttpClient) {}

  startStream(): void {
    if (this.eventSource) return; // Already streaming

    this.isStreaming.set(true);
    this.eventSource = new EventSource(`${this.baseUrl}/stream`);

    // Handle initial batch
    this.eventSource.addEventListener('initial', (event: MessageEvent) => {
      const initialOrders: LiveOrder[] = JSON.parse(event.data);
      this.orders.set(initialOrders);
    });

    // Handle new orders
    this.eventSource.addEventListener('new-order', (event: MessageEvent) => {
      const newOrder: LiveOrder = JSON.parse(event.data);
      this.latestOrder.set(newOrder);
      this.orders.update((prev) => [...prev, newOrder]);
    });

    // Handle errors
    this.eventSource.onerror = () => {
      this.stopStream();
    };
  }

  stopStream(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isStreaming.set(false);
  }

  clearData(): void {
    this.orders.set([]);
    this.latestOrder.set(null);
  }

  getSnapshot(): Observable<any> {
    return this.http.get(`${this.baseUrl}/snapshot`);
  }
}