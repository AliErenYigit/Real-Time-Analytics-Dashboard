// src/app/pages/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../services/analytics';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  imports: [
    CommonModule, // NgIf, NgFor, ngClass, date, number, vs. buradan gelir
  ],
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {

  healthStatus: string | null = null;
  healthTimestamp: number | null = null;

  metrics: any = null;
  loadingMetrics = false;
  metricsError: string | null = null;

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadHealth();
    this.loadMetrics();
  }

  loadHealth(): void {
    this.analyticsService.getHealth().subscribe({
      next: (res) => {
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
      next: (res) => {
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
