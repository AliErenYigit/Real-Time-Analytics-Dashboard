import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AnalyticsService, HealthResponse, MetricsResponse } from './services/analytics';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  title = 'Real-Time Analytics Dashboard';

  healthStatus: string | null = null;
  healthTimestamp: number | null = null;

  metrics: MetricsResponse | null = null;
  loadingMetrics = false;
  metricsError: string | null = null;

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadHealth();
    this.loadMetrics();
  }

  loadHealth(): void {
    this.analyticsService.getHealth().subscribe({
      next: (res: HealthResponse) => {
        this.healthStatus = res.status;
        this.healthTimestamp = res.timestamp;
      },
      error: (err) => {
        console.error('Health error', err);
        this.healthStatus = 'error';
      }
    });
  }

  loadMetrics(): void {
    this.loadingMetrics = true;
    this.metricsError = null;

    this.analyticsService.getMetrics().subscribe({
      next: (res: MetricsResponse) => {
        this.metrics = res;
        this.loadingMetrics = false;
      },
      error: (err) => {
        console.error('Metrics error', err);
        this.metricsError = 'Metrics yüklenemedi';
        this.loadingMetrics = false;
      }
    });
  }
}
