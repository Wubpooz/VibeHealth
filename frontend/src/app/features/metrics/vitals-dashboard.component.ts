import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { MetricsService } from '../../core/metrics/metrics.service';
import { CarrotFeedComponent } from '../../shared/components/carrot-feed/carrot-feed.component';
import { TrendChartComponent, type TrendDataPoint } from '../../shared/components/trend-chart/trend-chart.component';
import { HydrationTrackerComponent } from './hydration-tracker.component';
import { VitalsLoggerComponent } from './vitals-logger.component';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import { LucideHeartPulse } from '@lucide/angular';

@Component({
  selector: 'app-vitals-dashboard',
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    CarrotFeedComponent,
    TrendChartComponent,
    HydrationTrackerComponent,
    VitalsLoggerComponent,
    BackButtonComponent,
    LucideHeartPulse,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#fdf8f8] dark:bg-gray-950 transition-colors duration-300 no-select">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 space-y-6">

        <!-- Page Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span class="text-white inline-flex" aria-hidden="true">
                <svg lucideHeartPulse [size]="24" [strokeWidth]="2"></svg>
              </span>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white font-heading">
                {{ 'METRICS.TITLE' | translate }}
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ 'METRICS.CONSISTENCY_KEY' | translate }}
              </p>
            </div>
          </div>
          <app-back-button [label]="'common.back_to_dashboard' | translate" [showLabel]="true" />
        </div>

        <!-- Stats Grid + Carrot Feed -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <app-carrot-feed />
        </div>

        <!-- Vitals Logger + Hydration Tracker -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <app-vitals-logger />
          <app-hydration-tracker />
        </div>

        <!-- 7-Day Steps Trend -->
        <app-trend-chart
          [title]="'METRICS.VITALS.STEPS' | translate"
          [subtitle]="'METRICS.LAST_7_DAYS' | translate"
          [data]="weeklyStepsData()"
          unit=" steps"
        />

        <!-- 7-Day Sleep Trend -->
        <app-trend-chart
          [title]="'METRICS.VITALS.SLEEP' | translate"
          [subtitle]="'METRICS.LAST_7_DAYS' | translate"
          [data]="weeklySleepData()"
          unit="h"
        />

      </div>
    </div>
  `,
  styles: [`
    .no-select {
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
    }

    .btn-go-back {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.45rem 0.8rem;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 0.8125rem;
      color: #4b5563;
      background: #ffffff;
      border: 1px solid #d1d5db;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-go-back:hover {
      background: #f8fafc;
      color: #4338ca;
      border-color: #c7d2fe;
    }

    .btn-go-back:focus-visible {
      outline: 2px solid #a78bfa;
      outline-offset: 2px;
    }

    /* Quick-action gradient tiles (desktop) */
    .quick-tile {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 0.625rem 0.875rem;
      border-radius: 1rem;
      background: white;
      border: 2px solid transparent;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .quick-tile:hover {
      transform: translateY(-2px);
      border-color: var(--tile-color, #7c4dff);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    }

    :host-context([data-theme="dark"]) .quick-tile {
      background: rgba(31, 41, 55, 0.8);
    }

    .tile-emoji {
      font-size: 1.5rem;
    }

    .tile-label {
      font-family: 'Satoshi', sans-serif;
      font-size: 0.625rem;
      font-weight: 700;
      color: #637074;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    :host-context([data-theme="dark"]) .tile-label {
      color: #9ca3af;
    }

    /* Quick-action tiles (mobile) */
    .quick-tile-mobile {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 5rem;
      height: 5rem;
      border-radius: 1.25rem;
      text-decoration: none;
      transition: transform 0.2s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .quick-tile-mobile:active {
      transform: scale(0.95);
    }

    @media (prefers-reduced-motion: reduce) {
      .quick-tile,
      .quick-tile-mobile {
        transition: none;
      }
    }
  `],
})
export class VitalsDashboardComponent {
  private readonly metricsService = inject(MetricsService);

  // ── 7-day trend data ──────────────────────────────────────────────────────

  /**
   * NOTE: wire to real weekly vitals API (GET /api/v1/metrics/vitals?type=STEPS&startDate=...)
   * For now uses today's step count on the current day and placeholders for the rest.
   */
  readonly weeklyStepsData = computed<TrendDataPoint[]>(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const todayIdx = (new Date().getDay() + 6) % 7; // 0 = Mon

    // Seed with plausible placeholder values
    const placeholders = [7200, 8500, 9100, 6800, 10300, 5400, 7800];

    return days.map((label, i) => ({
      label,
      value: i === todayIdx ? 0 : placeholders[i],
      target: 10000,
    }));
  });

  /**
   * NOTE: wire to real weekly vitals API (GET /api/v1/metrics/vitals?type=SLEEP_HOURS&startDate=...)
   */
  readonly weeklySleepData = computed<TrendDataPoint[]>(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const todayIdx = (new Date().getDay() + 6) % 7;
    const placeholders = [7.5, 6, 8, 7, 6.5, 9, 7.5];

    return days.map((label, i) => ({
      label,
      value: i === todayIdx ? 0 : placeholders[i],
      target: 8,
    }));
  });
}
