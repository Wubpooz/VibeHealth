import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
  afterNextRender,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MetricsService } from '../../core/metrics/metrics.service';
import { RewardsService } from '../../core/rewards/rewards.service';
import { ActivityLoggerComponent } from './activity-logger.component';
import { TrendChartComponent, type TrendDataPoint } from '../../shared/components/trend-chart/trend-chart.component';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import { LucideActivity } from '@lucide/angular';

@Component({
  selector: 'app-activity-page',
  imports: [CommonModule, RouterModule, TranslateModule, ActivityLoggerComponent, TrendChartComponent, BackButtonComponent, LucideActivity],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#fdf8f8] dark:bg-gray-950 px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-6 no-select">

      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <app-back-button [label]="'common.back_to_dashboard' | translate" [showLabel]="true" />
        <div class="flex items-center gap-3">
          <span class="text-primary-500 inline-flex" aria-hidden="true">
            <svg lucideActivity [size]="30" [strokeWidth]="2"></svg>
          </span>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white font-heading">
              {{ 'ACTIVITY.TITLE' | translate }}
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {{ 'ACTIVITY.SUBTITLE' | translate }}
            </p>
          </div>
        </div>

        <!-- Today summary pill -->
        <div class="hidden sm:flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div class="text-center">
            <p class="text-lg font-bold text-gray-900 dark:text-white font-heading">{{ minutesToday() }}</p>
            <p class="text-xs text-gray-400 font-medium">{{ 'ACTIVITY.MIN' | translate }}</p>
          </div>
          <div class="w-px h-8 bg-gray-100 dark:bg-gray-700"></div>
          <div class="text-center">
            <p class="text-lg font-bold text-orange-500 font-heading">{{ caloriesToday() }}</p>
            <p class="text-xs text-gray-400 font-medium">{{ 'ACTIVITY.KCAL' | translate }}</p>
          </div>
          <div class="w-px h-8 bg-gray-100 dark:bg-gray-700"></div>
          <div class="text-center">
            <p class="text-lg font-bold text-primary-500 font-heading">{{ activeDays() }}</p>
            <p class="text-xs text-gray-400 font-medium">{{ 'ACTIVITY.ACTIVE_DAYS' | translate }}</p>
          </div>
        </div>
      </div>

      <!-- Mobile summary strip -->
      <div class="sm:hidden grid grid-cols-3 gap-3">
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-3 text-center border border-gray-100 dark:border-gray-700">
          <p class="text-xl font-bold text-gray-900 dark:text-white font-heading">{{ minutesToday() }}</p>
          <p class="text-xs text-gray-400">{{ 'ACTIVITY.MIN_TODAY' | translate }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-3 text-center border border-gray-100 dark:border-gray-700">
          <p class="text-xl font-bold text-orange-500 font-heading">{{ caloriesToday() }}</p>
          <p class="text-xs text-gray-400">{{ 'ACTIVITY.KCAL_BURNED' | translate }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-3 text-center border border-gray-100 dark:border-gray-700">
          <p class="text-xl font-bold text-primary-500 font-heading">{{ activeDays() }}</p>
          <p class="text-xs text-gray-400">{{ 'ACTIVITY.ACTIVE_DAYS' | translate }}</p>
        </div>
      </div>

      <!-- Main content: logger + stats -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Activity Logger (takes 2 cols) -->
        <div class="lg:col-span-2">
          <app-activity-logger />
        </div>

        <!-- Stats sidebar -->
        <div class="space-y-6">

          <!-- Activity breakdown by type -->
          @if (typeBreakdown().length > 0) {
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 space-y-3">
              <h3 class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{{ 'ACTIVITY.TODAY_BY_TYPE' | translate }}</h3>
              @for (entry of typeBreakdown(); track entry.type) {
                <div class="flex items-center gap-3">
                  <span class="inline-flex text-primary-500" aria-hidden="true">
                    <svg lucideActivity [size]="18" [strokeWidth]="2"></svg>
                  </span>
                  <div class="flex-1">
                    <div class="flex justify-between text-xs mb-1">
                      <span class="font-semibold text-gray-700 dark:text-gray-200">{{ entry.type }}</span>
                      <span class="text-gray-400">{{ entry.minutes }} min</span>
                    </div>
                    <div class="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        class="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full"
                        [style.width.%]="entry.pct"
                      ></div>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Weekly Trend Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <app-trend-chart
          [title]="'ACTIVITY.CHART_ACTIVE_MINUTES' | translate"
          [subtitle]="'METRICS.LAST_7_DAYS' | translate"
          [data]="weeklyMinutesData()"
          unit="min"
        />
        <app-trend-chart
          [title]="'ACTIVITY.CHART_CALORIES_BURNED' | translate"
          [subtitle]="'METRICS.LAST_7_DAYS' | translate"
          [data]="weeklyCaloriesData()"
          unit="kcal"
        />
      </div>

    </div>
  `,
})
export class ActivityPageComponent {
  private readonly metricsService = inject(MetricsService);
  private readonly rewardsService = inject(RewardsService);

  // ── Computed summaries ────────────────────────────────────────────────────

  readonly minutesToday = this.metricsService.activityMinutesToday;
  readonly caloriesToday = this.metricsService.activityCaloriesToday;
  readonly activeDays = this.metricsService.activeDaysThisWeek;

  readonly typeBreakdown = computed(() => {
    const today = this.metricsService.activityToday();
    if (!today?.byType) return [];

    const total = today.totalMinutes || 1;

    return Object.entries(today.byType)
      .map(([type, stats]) => ({
        type,
        minutes: stats.minutes,
        calories: stats.calories,
        pct: Math.min(Math.round((stats.minutes / total) * 100), 100),
      }))
      .filter((e) => e.minutes > 0)
      .sort((a, b) => b.minutes - a.minutes);
  });

  // ── Weekly chart data ─────────────────────────────────────────────────────

  readonly weeklyMinutesData = computed((): TrendDataPoint[] => {
    const week = this.metricsService.activityWeek();
    const days = this._last7DayLabels();

    if (week?.dailySummary) {
      return days.map(({ label, key }) => ({
        label,
        value: week.dailySummary[key]?.minutes ?? 0,
        target: 30, // 30-min daily goal
      }));
    }

    // Placeholder until real data loads
    return days.map(({ label }) => ({ label, value: 0, target: 30 }));
  });

  readonly weeklyCaloriesData = computed((): TrendDataPoint[] => {
    const week = this.metricsService.activityWeek();
    const days = this._last7DayLabels();

    if (week?.dailySummary) {
      return days.map(({ label, key }) => ({
        label,
        value: week.dailySummary[key]?.calories ?? 0,
        target: 500,
      }));
    }

    return days.map(({ label }) => ({ label, value: 0, target: 500 }));
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  constructor() {
    afterNextRender(() => {
      this.metricsService.loadActivityToday();
      this.metricsService.loadActivityWeek();
      this.rewardsService.logDailyActivity();
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private _last7DayLabels(): { label: string; key: string }[] {
    const result: { label: string; key: string }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = dayNames[d.getDay()];
      result.push({ label, key });
    }
    return result;
  }
}
