import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { io, Socket } from 'socket.io-client';

import {
  AnalyticsService,
  HealthResponse,
  MetricsResponse,
} from './services/analytics';

import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import {
  Chart,
  ChartData,
  ChartOptions,
  registerables,
} from 'chart.js';

// Chart.js bileşenlerini kaydet
Chart.register(...registerables);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NgChartsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  title = 'Real-Time Analytics Dashboard';

  // ---------- Health + REST ----------
  healthStatus: string | null = null;
  healthTimestamp: number | null = null;

  metrics: MetricsResponse | null = null;
  loadingMetrics = false;
  metricsError: string | null = null;

  // ---------- Real-time (Socket.IO) ----------
  realtimeMetrics: MetricsResponse | null = null;
  realtimeLastUpdate: Date | null = null;
  realtimeError: string | null = null;
  realtimeUpdateCount = 0;
  private socket?: Socket;

  // ---------- Line Chart State ----------
  maxPoints = 30; // son kaç nokta tutulacak

  // Asıl dizi referansları
  cpuLabels: string[] = [];
  cpuSeries: number[] = [];

  cpuLineData: ChartData<'line'> = {
    labels: this.cpuLabels,
    datasets: [
      {
        data: this.cpuSeries,
        label: 'CPU Usage (%)',
        fill: false,
        tension: 0.3,
        pointRadius: 2,
        borderWidth: 2,
      },
    ],
  };

  cpuLineOptions: ChartOptions<'line'> = {
    responsive: true,
    animation: false,
    scales: {
      y: {
        min: 0,
        max: 100,
        title: { display: true, text: 'CPU %' },
      },
      x: {
        title: { display: true, text: 'Zaman' },
      },
    },
    plugins: {
      legend: { display: true },
    },
  };

  constructor(
    private analyticsService: AnalyticsService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  // =====================================
  //  LIFECYCLE
  // =====================================

  ngOnInit(): void {
    console.log('[App] ngOnInit');
    this.loadHealth();
    this.loadMetrics();
    this.initSocket();
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // =====================================
  //  REST ENDPOINTLERİ
  // =====================================

  loadHealth(): void {
    this.analyticsService.getHealth().subscribe({
      next: (res: HealthResponse) => {
        this.healthStatus = res.status;
        this.healthTimestamp = res.timestamp;
      },
      error: (err) => {
        console.error('Health error', err);
        this.healthStatus = 'error';
      },
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
      },
    });
  }

  // =====================================
  //  SOCKET.IO REAL-TIME
  // =====================================

  private initSocket(): void {
    console.log('[Client] initSocket');

    this.socket = io('http://localhost:4000');

    this.socket.on('connect', () => {
      console.log('[Client] connected:', this.socket?.id);
    });

    this.socket.on('metrics-update', (data: MetricsResponse) => {
      console.log('[Client] metrics-update', data);

      this.ngZone.run(() => {
        // karttaki metrikler
        this.realtimeMetrics = { ...data };
        this.realtimeLastUpdate = new Date();
        this.realtimeUpdateCount++;

        // ---- ÇİZGİ GRAFİĞE YENİ NOKTA EKLE ----
        const timeLabel = new Date(data.timestamp).toLocaleTimeString();

        this.cpuLabels.push(timeLabel);
        this.cpuSeries.push(Number(data.cpuUsage.toFixed(2)));

        // maxPoints'tan fazlası olursa eskiyi sil
        if (this.cpuLabels.length > this.maxPoints) {
          this.cpuLabels.shift();
          this.cpuSeries.shift();
        }

        // Grafiği güncelle
        this.chart?.update();

        // Angular için
        this.cdr.detectChanges();
      });
    });

    this.socket.on('disconnect', () => {
      console.log('[Client] disconnected');
    });

    this.socket.on('connect_error', (err) => {
      console.error('[Client] connect_error', err);
      this.ngZone.run(() => {
        this.realtimeError = 'Real-time bağlantı hatası';
        this.cdr.detectChanges();
      });
    });
  }
}
