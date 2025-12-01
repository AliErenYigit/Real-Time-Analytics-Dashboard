// src/app/services/analytics.service.ts
import { Injectable,NgZone  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

// export interface HealthResponse {
//   status: string;
//   timestamp: number;
// }

// export interface MetricsResponse {
//   cpuUsage: number;
//   memoryUsage: number;
//   requestPerSecond: number;
//   timestamp: number;
// }
// 🔴 Shop Summary (Business Metrics) interface
export interface ShopSummary {
  onlineUsers: number;
  lastMinuteOrders: number;
  lastMinuteCartAdds: number;
  activeSessions: number;
  generatedAt: string;
}
export interface ShopEvent {
  eventType: 'cart_add' | 'order_created';
  userId: number;
  productId?: number;
  quantity?: number;
  orderId?: number;
  totalPrice?: number;
  createdAt: string | number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly API_BASE = 'http://localhost:4000';
  private socket?: Socket;

  constructor(
    private http: HttpClient,
    private ngZone: NgZone,
  ) {}

  // getHealth(): Observable<HealthResponse> {
  //   return this.http.get<HealthResponse>(`${this.API_BASE}/api/health`);
  // }

  // getMetrics(): Observable<MetricsResponse> {
  //   return this.http.get<MetricsResponse>(`${this.API_BASE}/api/metrics`);
  // }

    getShopSummary(): Observable<ShopSummary> {
    return this.http.get<ShopSummary>(`${this.API_BASE}/api/metrics/shopmetrics`);
  }
  // 🔴 Real-time metrics
  connectToMetricsStream(): Observable<ShopSummary> {
    if (!this.socket) {
      // transports parametresini şimdilik KALDIRIYORUZ
      this.socket = io(this.API_BASE);

      this.socket.on('connect', () => {
        console.log('[Socket] connected:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('[Socket] disconnected');
      });
    }

    return new Observable<ShopSummary>((subscriber) => {
      const handler = (data: ShopSummary) => {
        console.log('[Socket] metrics-update', data);
          // 🔴 Angular'ın değişikliği fark etmesi için NgZone içinde çalıştır
      this.ngZone.run(() => {
        subscriber.next(data);
      });
    };

      this.socket!.on('metrics-update', handler);

      return () => {
        if (!this.socket) return;

        this.socket.off('metrics-update', handler);
        // Burada bağlantıyı kapatmıyoruz; Angular app kapanınca zaten gidecek.
      };
    });
  }
}
