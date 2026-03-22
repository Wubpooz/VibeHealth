import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
  afterNextRender,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MetricsService } from '../../core/metrics/metrics.service';
import { RewardsService } from '../../core/rewards/rewards.service';
import { NutritionLoggerComponent } from './nutrition-logger.component';
import { TrendChartComponent, type TrendDataPoint } from '../../shared/components/trend-chart/trend-chart.component';
import { StatsGridComponent } from '../../shared/components/stats-grid/stats-grid.component';
import { DAILY_GOALS, MEAL_TYPE_INFO } from '../../core/metrics/metrics.types';

@Component({
  selector: 'app-nutrition-page',
  imports: [
    CommonModule,
    TranslateModule,
    NutritionLoggerComponent,
    TrendChartComponent,
    StatsGridComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#fdf8f8] dark:bg-gray-950 px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-6 no-select">

      <!-- Page Header -->
      <div class="flex items-center justify-between flex-wrap gap-4">
        <a routerLink="/dashboard" class="btn-go-back">{{ 'common.back_to_dashboard' | translate }}</a>
        <div class="flex items-center gap-3">
          <span class="text-3xl">🥗</span>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white font-heading">
              {{ 'NUTRITION.TITLE' | translate }}
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {{ 'NUTRITION.SUBTITLE' | translate }}
            </p>
          </div>
        </div>

        <!-- Desktop summary pill -->
        <div class="hidden sm:flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div class="text-center">
            <p class="text-lg font-bold text-gray-900 dark:text-white font-heading">
              {{ caloriesToday() }}
            </p>
            <p class="text-xs text-gray-400 font-medium">kcal</p>
          </div>
          <div class="w-px h-8 bg-gray-100 dark:bg-gray-700"></div>
          <div class="text-center">
            <p class="text-lg font-bold text-blue-500 font-heading">{{ proteinToday() }}g</p>
            <p class="text-xs text-gray-400 font-medium">protein</p>
          </div>
          <div class="w-px h-8 bg-gray-100 dark:bg-gray-700"></div>
          <div class="text-center">
            <p class="text-lg font-bold text-amber-500 font-heading">{{ carbsToday() }}g</p>
            <p class="text-xs text-gray-400 font-medium">carbs</p>
          </div>
          <div class="w-px h-8 bg-gray-100 dark:bg-gray-700"></div>
          <div class="text-center">
            <p class="text-lg font-bold text-green-500 font-heading">{{ fatToday() }}g</p>
            <p class="text-xs text-gray-400 font-medium">fat</p>
          </div>
        </div>
      </div>

      <!-- Mobile summary strip -->
      <div class="sm:hidden grid grid-cols-4 gap-2">
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-3 text-center border border-gray-100 dark:border-gray-700">
          <p class="text-base font-bold text-gray-900 dark:text-white font-heading">{{ caloriesToday() }}</p>
          <p class="text-xs text-gray-400">kcal</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-3 text-center border border-gray-100 dark:border-gray-700">
          <p class="text-base font-bold text-blue-500 font-heading">{{ proteinToday() }}g</p>
          <p class="text-xs text-gray-400">protein</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-3 text-center border border-gray-100 dark:border-gray-700">
          <p class="text-base font-bold text-amber-500 font-heading">{{ carbsToday() }}g</p>
          <p class="text-xs text-gray-400">carbs</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-3 text-center border border-gray-100 dark:border-gray-700">
          <p class="text-base font-bold text-green-500 font-heading">{{ fatToday() }}g</p>
          <p class="text-xs text-gray-400">fat</p>
        </div>
      </div>

      <!-- Calorie progress bar -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 space-y-2">
        <div class="flex justify-between items-center text-sm">
          <span class="font-semibold text-gray-700 dark:text-gray-200">
            Daily Calorie Goal
          </span>
          <span class="font-bold" [class]="caloriesOverGoal() ? 'text-red-500' : 'text-green-500'">
            {{ caloriesToday() }} / {{ caloriesGoal }} kcal
            @if (caloriesOverGoal()) { <span class="ml-1">⚠️</span> }
          </span>
        </div>
        <div class="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            [class]="caloriesOverGoal()
              ? 'bg-gradient-to-r from-red-400 to-red-500'
              : 'bg-gradient-to-r from-green-400 to-emerald-500'"
            [style.width.%]="caloriesPct()"
          ></div>
        </div>
        <div class="flex justify-between text-xs text-gray-400">
          <span>{{ caloriesRemaining() > 0 ? caloriesRemaining() + ' kcal remaining' : 'Goal exceeded by ' + caloriesOverBy() + ' kcal' }}</span>
          <span>{{ caloriesPct() }}%</span>
        </div>
      </div>

      <!-- Macro breakdown rings -->
      <div class="grid grid-cols-3 gap-4">
        @for (macro of macroBreakdown(); track macro.label) {
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-2">
            <!-- Mini circular progress -->
            <div class="relative w-16 h-16">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" stroke-width="6"
                  class="text-gray-100 dark:text-gray-700" stroke="currentColor" />
                <circle
                  cx="32" cy="32" r="26" fill="none" stroke-width="6"
                  [attr.stroke]="macro.color"
                  stroke-linecap="round"
                  [attr.stroke-dasharray]="163.4"
                  [attr.stroke-dashoffset]="163.4 * (1 - macro.pct / 100)"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-xs font-bold" [style.color]="macro.color">{{ macro.pct }}%</span>
              </div>
            </div>
            <div class="text-center">
              <p class="text-base font-bold text-gray-900 dark:text-white font-heading">{{ macro.value }}g</p>
              <p class="text-xs text-gray-400 font-medium">{{ macro.label }}</p>
              <p class="text-xs" [style.color]="macro.color">/ {{ macro.goal }}g goal</p>
            </div>
          </div>
        }
      </div>

      <!-- Main content: logger + sidebar -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Nutrition Logger (2 cols) -->
        <div class="lg:col-span-2">
          <app-nutrition-logger />
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <app-stats-grid />

          <!-- Meal type breakdown -->
          @if (mealTypeBreakdown().length > 0) {
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 space-y-3">
              <h3 class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                Today's Meals
              </h3>
              @for (meal of mealTypeBreakdown(); track meal.type) {
                <div class="flex items-center gap-3">
                  <span class="text-xl">{{ meal.emoji }}</span>
                  <div class="flex-1">
                    <div class="flex justify-between text-xs mb-1">
                      <span class="font-semibold text-gray-700 dark:text-gray-200">{{ meal.label }}</span>
                      <span class="text-gray-400">{{ meal.calories }} kcal</span>
                    </div>
                    <div class="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all duration-300"
                        [style.width.%]="meal.pct"
                        [style.background]="meal.color"
                      ></div>
                    </div>
                  </div>
                  @if (meal.count > 0) {
                    <span class="text-xs font-bold text-gray-400">×{{ meal.count }}</span>
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Weekly Trend Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <app-trend-chart
          [title]="'Calories (7-day)'"
          [subtitle]="'METRICS.LAST_7_DAYS' | translate"
          [data]="weeklyCaloriesData()"
          unit=" kcal"
        />
        <app-trend-chart
          [title]="'Protein (7-day)'"
          [subtitle]="'METRICS.LAST_7_DAYS' | translate"
          [data]="weeklyProteinData()"
          unit="g"
        />
      </div>

    </div>
  `,
})
export class NutritionPageComponent {
  private readonly metricsService = inject(MetricsService);
  private readonly rewardsService = inject(RewardsService);

  readonly caloriesGoal = DAILY_GOALS.calories;
  readonly proteinGoal = DAILY_GOALS.protein;
  readonly carbsGoal = DAILY_GOALS.carbs;
  readonly fatGoal = DAILY_GOALS.fat;

  // ── Today's totals ────────────────────────────────────────────────────────

  readonly caloriesToday = this.metricsService.caloriesToday;
  readonly proteinToday = this.metricsService.proteinToday;
  readonly carbsToday = this.metricsService.carbsToday;
  readonly fatToday = this.metricsService.fatToday;

  readonly caloriesPct = computed(() =>
    Math.min(Math.round((this.caloriesToday() / this.caloriesGoal) * 100), 120),
  );

  readonly caloriesOverGoal = computed(() => this.caloriesToday() > this.caloriesGoal);

  readonly caloriesRemaining = computed(() =>
    Math.max(0, this.caloriesGoal - this.caloriesToday()),
  );

  readonly caloriesOverBy = computed(() =>
    Math.max(0, this.caloriesToday() - this.caloriesGoal),
  );

  // ── Macro breakdown ───────────────────────────────────────────────────────

  readonly macroBreakdown = computed(() => [
    {
      label: 'Protein',
      value: this.proteinToday(),
      goal: this.proteinGoal,
      pct: Math.min(Math.round((this.proteinToday() / this.proteinGoal) * 100), 100),
      color: '#3b82f6',
    },
    {
      label: 'Carbs',
      value: this.carbsToday(),
      goal: this.carbsGoal,
      pct: Math.min(Math.round((this.carbsToday() / this.carbsGoal) * 100), 100),
      color: '#f59e0b',
    },
    {
      label: 'Fat',
      value: this.fatToday(),
      goal: this.fatGoal,
      pct: Math.min(Math.round((this.fatToday() / this.fatGoal) * 100), 100),
      color: '#10b981',
    },
  ]);

  // ── Meal type breakdown ───────────────────────────────────────────────────

  readonly mealTypeBreakdown = computed(() => {
    const today = this.metricsService.nutritionToday();
    if (!today?.byMealType) return [];

    const totalCal = today.totalCalories || 1;
    const mealColors: Record<string, string> = {
      BREAKFAST: '#f97316',
      LUNCH:     '#3b82f6',
      DINNER:    '#8b5cf6',
      SNACK:     '#10b981',
    };

    return Object.entries(today.byMealType)
      .map(([type, stats]) => ({
        type,
        label: MEAL_TYPE_INFO[type as keyof typeof MEAL_TYPE_INFO]?.label ?? type,
        emoji: MEAL_TYPE_INFO[type as keyof typeof MEAL_TYPE_INFO]?.emoji ?? '🍽️',
        count: stats.count,
        calories: stats.calories,
        pct: Math.min(Math.round((stats.calories / totalCal) * 100), 100),
        color: mealColors[type] ?? '#6b7280',
      }))
      .filter((m) => m.count > 0)
      .sort((a, b) => b.calories - a.calories);
  });

  // ── Weekly chart data ─────────────────────────────────────────────────────

  readonly weeklyCaloriesData = computed((): TrendDataPoint[] => {
    const week = this.metricsService.nutritionWeek();
    const days = this._last7DayLabels();

    if (week?.dailySummary) {
      return days.map(({ label, key }) => ({
        label,
        value: Math.round(week.dailySummary[key]?.calories ?? 0),
        target: this.caloriesGoal,
      }));
    }

    return days.map(({ label }) => ({ label, value: 0, target: this.caloriesGoal }));
  });

  readonly weeklyProteinData = computed((): TrendDataPoint[] => {
    const week = this.metricsService.nutritionWeek();
    const days = this._last7DayLabels();

    if (week?.dailySummary) {
      return days.map(({ label, key }) => ({
        label,
        value: Math.round(week.dailySummary[key]?.protein ?? 0),
        target: this.proteinGoal,
      }));
    }

    return days.map(({ label }) => ({ label, value: 0, target: this.proteinGoal }));
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  constructor() {
    afterNextRender(() => {
      this.metricsService.loadNutritionToday();
      this.metricsService.loadNutritionWeek();
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
