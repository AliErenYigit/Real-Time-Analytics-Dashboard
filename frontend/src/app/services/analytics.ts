// src/app/services/analytics.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HealthResponse {
  status: string;
  timestamp: number;
}

export interface MetricsResponse {
  cpuUsage: number;
  memoryUsage: number;
  requestPerSecond: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  // Şimdilik direkt localhost:4000
  private readonly API_BASE = 'http://localhost:4000';

  constructor(private http: HttpClient) {}

  getHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.API_BASE}/api/health`);
  }

  getMetrics(): Observable<MetricsResponse> {
    return this.http.get<MetricsResponse>(`${this.API_BASE}/api/metrics`);
  }
}
