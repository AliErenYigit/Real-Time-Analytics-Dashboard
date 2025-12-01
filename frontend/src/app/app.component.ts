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
  // HealthResponse,
  // MetricsResponse,
  ShopSummary,
  ShopEvent,
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

  // // ---------- Health + REST ----------
  // healthStatus: string | null = null;
  // healthTimestamp: number | null = null;

  // metrics: MetricsResponse | null = null;
  // loadingMetrics = false;
  // metricsError: string | null = null;

  // // ---------- Real-time (Socket.IO) ----------
  realtimeMetrics: ShopSummary | null = null;
  realtimeLastUpdate: Date | null = null;
  realtimeError: string | null = null;
  realtimeUpdateCount = 0;
  private socket?: Socket;

  // ---------- 🔴 Real-Time Shop Metrics (Kafka shop.events) ----------
shopEvents: ShopEvent[] = [];
cartAddsLastMinute = 0;
ordersLastMinute = 0;

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
  shopSummary: ShopSummary | null = null;
  shopSummaryLoading = false;
  shopSummaryError: string | null = null;
  shopSummaryLastUpdate: Date | null = null;
  private shopSummaryTimer: any;   // setInterval id

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
    // this.loadHealth();
    // this.loadMetrics();
    this.initSocket();
    this.startShopSummaryPolling();
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // =====================================
  //  REST ENDPOINTLERİ
  // =====================================

  // loadHealth(): void {
  //   this.analyticsService.getHealth().subscribe({
  //     next: (res: HealthResponse) => {
  //       this.healthStatus = res.status;
  //       this.healthTimestamp = res.timestamp;
  //     },
  //     error: (err) => {
  //       console.error('Health error', err);
  //       this.healthStatus = 'error';
  //     },
  //   });
  // }

  // loadMetrics(): void {
  //   this.loadingMetrics = true;
  //   this.metricsError = null;

  //   this.analyticsService.getMetrics().subscribe({
  //     next: (res: MetricsResponse) => {
  //       this.metrics = res;
  //       this.loadingMetrics = false;
  //     },
  //     error: (err) => {
  //       console.error('Metrics error', err);
  //       this.metricsError = 'Metrics yüklenemedi';
  //       this.loadingMetrics = false;
  //     },
  //   });
  // }
  // ---------- 🔴 Shop Summary (Business Metrics) ----------
  loadShopSummary(): void {
    this.shopSummaryLoading = true;
    this.shopSummaryError = null;

    this.analyticsService.getShopSummary().subscribe({
      next: (res: ShopSummary) => {
        this.shopSummary = res;
        this.shopSummaryLastUpdate = new Date();
        this.shopSummaryLoading = false;

        this.cdr.detectChanges();

      },
      error: (err) => {
        console.error('Shop summary error', err);
        this.shopSummaryError = 'Shop metrics yüklenemedi';
        this.shopSummaryLoading = false;

         this.cdr.detectChanges();

      },
    });
  }

 startShopSummaryPolling(): void {
  // İlkini hemen çek
  this.loadShopSummary();

  // Sonrakileri zone içinde periyodik çalıştır
  this.shopSummaryTimer = setInterval(() => {
    this.ngZone.run(() => {
      console.log('[ShopSummary] polling tick'); // debug
      this.loadShopSummary();
    });
  }, 1000);
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

    this.socket.on('metrics-update', (data: ShopSummary) => {
      console.log('[Client] metrics-update', data);

      this.ngZone.run(() => {
        // karttaki metrikler
        this.realtimeMetrics = { ...data };
        this.realtimeLastUpdate = new Date();
        this.realtimeUpdateCount++;

        // // ---- ÇİZGİ GRAFİĞE YENİ NOKTA EKLE ----
        // const timeLabel = new Date(data.timestamp).toLocaleTimeString();

        // this.cpuLabels.push(timeLabel);
        // this.cpuSeries.push(Number(data.cpuUsage.toFixed(2)));

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
    this.socket.on('shop-event', (eventType: any) => {
  console.log('[Client] shop-event', eventType);

  this.ngZone.run(() => {
    const e = eventType as ShopEvent;

    // createdAt'i timestamp'e çevir
    const eventTime =
      typeof e.createdAt === 'string'
        ? new Date(e.createdAt).getTime()
        : (e.createdAt as number);

    const now = Date.now();
    const cutoff = now - 60_000; // son 1 dakika

    // Event'i listeye ekle
    this.shopEvents.push({
      ...e,
      createdAt: eventTime,
    });

    // Sadece son 1 dakikadakileri tut
    this.shopEvents = this.shopEvents.filter(
      (ev) => (ev.createdAt as number) >= cutoff
    );

    // Metrikleri hesapla
    this.cartAddsLastMinute = this.shopEvents.filter(
      (ev) => ev.eventType === 'cart_add'
    ).length;

    this.ordersLastMinute = this.shopEvents.filter(
      (ev) => ev.eventType === 'order_created'
    ).length;

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
