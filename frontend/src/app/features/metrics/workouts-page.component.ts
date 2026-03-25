import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
  afterNextRender,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { animate } from 'motion/mini';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MetricsService } from '../../core/metrics/metrics.service';
import type { WorkoutPlanExercise, HealthSyncProvider } from '../../core/metrics/metrics.types';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import { ToastService } from '../../core/toast/toast.service';

@Component({
  selector: 'app-workouts-page',
  imports: [CommonModule, TranslateModule, FormsModule, BackButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#fdf8f8] dark:bg-gray-950 px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-6">
      <div class="flex items-center justify-between">
        <app-back-button [label]="'common.back_to_dashboard' | translate" [showLabel]="true" />
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-heading">
          {{ 'WORKOUTS.TITLE' | translate }}
        </h1>
      </div>

      <section class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-5 sm:p-6 space-y-3">
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ 'WORKOUTS.SUBTITLE' | translate }}</p>
        <div class="flex flex-wrap gap-3 text-sm">
          <span class="px-3 py-1 rounded-full bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
            {{ 'WORKOUTS.DIFFICULTY' | translate }}: {{ workoutSuggestions()?.difficulty || '-' }}
          </span>
          @for (category of workoutSuggestions()?.categories ?? []; track category) {
            <span class="px-3 py-1 rounded-full bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
              {{ category }}
            </span>
          }
        </div>
      </section>

      <section class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-5 sm:p-6 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-end gap-3">
          <label class="flex-1">
            <span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ 'WORKOUTS.NEW_PLAN_NAME' | translate }}</span>
            <input
              id="workout-plan-name"
              type="text"
              [ngModel]="newPlanName()"
              (ngModelChange)="newPlanName.set($event)"
              class="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-300"
              [placeholder]="'WORKOUTS.NEW_PLAN_PLACEHOLDER' | translate"
            />
          </label>
          <button
            type="button"
            (click)="createPlan()"
            class="rounded-full bg-gradient-to-r from-primary-500 to-orange-500 text-white font-semibold px-5 py-2.5 shadow-md hover:shadow-lg transition-all"
          >
            {{ 'WORKOUTS.CREATE_PLAN' | translate }}
          </button>
        </div>
      </section>

      @if (activePlanExercises().length > 0) {
        <section class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-5 sm:p-6 space-y-4">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">{{ 'WORKOUTS.ACTIVE_PLAN' | translate }}</h2>
          <div class="grid gap-3">
            @for (exercise of activePlanExercises(); track exercise.id) {
              <div #exerciseCard class="rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ exercise.exercise.name }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {{ exercise.sets }} sets • {{ exercise.repsMin }}-{{ exercise.repsMax }} reps • {{ exercise.restSeconds }}s rest
                    </p>
                  </div>
                  <div class="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      [attr.aria-label]="'WORKOUTS.REPS_INPUT_ARIA' | translate:{ exercise: exercise.exercise.name }"
                      class="w-20 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm text-gray-900 dark:text-white"
                      [ngModel]="repsByExercise()[exercise.id] || exercise.repsMin"
                      (ngModelChange)="setReps(exercise.id, $event)"
                    />
                    <button
                      type="button"
                      class="rounded-full bg-primary-500 text-white text-sm font-semibold px-4 py-2"
                      (click)="logSet(exercise)"
                    >
                      {{ 'WORKOUTS.LOG_SET' | translate }}
                    </button>
                  </div>
                </div>
                @if (restTimers()[exercise.id] && restTimers()[exercise.id]! > 0) {
                  <p class="mt-2 text-xs text-orange-600 dark:text-orange-300">
                    {{ 'WORKOUTS.REST_TIMER' | translate }}: {{ restTimers()[exercise.id] }}s
                  </p>
                }
              </div>
            }
          </div>
        </section>
      }

      <section class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-5 sm:p-6 space-y-2">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white">{{ 'WORKOUTS.SUMMARY_TITLE' | translate }}</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ 'WORKOUTS.SUMMARY_SUBTITLE' | translate }}</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div class="rounded-2xl border border-primary-100 dark:border-primary-900/40 bg-primary-50/70 dark:bg-primary-900/20 p-3">
            <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300">{{ 'WORKOUTS.CALORIES_TODAY' | translate }}</p>
            <p class="mt-1 text-xl font-bold text-primary-900 dark:text-primary-100">{{ workoutSummary().calories }} kcal</p>
          </div>
          <div class="rounded-2xl border border-orange-100 dark:border-orange-900/40 bg-orange-50/70 dark:bg-orange-900/20 p-3">
            <p class="text-xs uppercase tracking-wide text-orange-700 dark:text-orange-300">{{ 'WORKOUTS.HEART_RATE_LAST' | translate }}</p>
            <p class="mt-1 text-xl font-bold text-orange-900 dark:text-orange-100">
              @if (workoutSummary().heartRate !== null) {
                {{ workoutSummary().heartRate }} bpm
              } @else {
                {{ 'WORKOUTS.NO_HEART_RATE' | translate }}
              }
            </p>
          </div>
        </div>
      </section>

      <section class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-5 sm:p-6 space-y-4">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white">{{ 'WORKOUTS.SYNC_TITLE' | translate }}</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ 'WORKOUTS.SYNC_SUBTITLE' | translate }}</p>
        @for (provider of providers; track provider) {
          <div class="rounded-2xl border border-gray-100 dark:border-gray-700 p-4 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <p class="font-semibold text-gray-900 dark:text-white">{{ providerLabel(provider) }}</p>
              <button
                type="button"
                class="rounded-full px-4 py-2 text-sm font-semibold text-white"
                [class.bg-primary-500]="!isConnected(provider)"
                [class.bg-gray-600]="isConnected(provider)"
                (click)="connectProvider(provider)"
              >
                {{ isConnected(provider) ? ('WORKOUTS.CONNECTED' | translate) : ('WORKOUTS.CONNECT' | translate) }}
              </button>
            </div>
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                [checked]="isAutoSync(provider)"
                #autoSyncInput
                (change)="toggleAutoSync(provider, autoSyncInput.checked)"
                [disabled]="!isConnected(provider)"
                [attr.aria-label]="'WORKOUTS.AUTO_SYNC' | translate"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ 'WORKOUTS.AUTO_SYNC' | translate }}</span>
            </div>
            <button
              type="button"
              class="rounded-full border border-primary-200 text-primary-700 dark:text-primary-300 text-sm font-semibold px-4 py-2"
              (click)="pullNow(provider)"
              [disabled]="!isConnected(provider)"
            >
              {{ 'WORKOUTS.PULL_NOW' | translate }}
            </button>
          </div>
        }
      </section>
    </div>
  `,
})
export class WorkoutsPageComponent implements AfterViewInit {
  private readonly metricsService = inject(MetricsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);
  readonly workoutSuggestions = this.metricsService.workoutSuggestions;
  readonly workoutPlans = this.metricsService.workoutPlans;
  readonly syncConnections = this.metricsService.syncConnections;
  readonly activityToday = this.metricsService.activityToday;
  readonly vitalsToday = this.metricsService.vitalsToday;

  readonly providers: HealthSyncProvider[] = ['GOOGLE_FIT', 'SAMSUNG_HEALTH'];
  readonly newPlanName = signal('');
  readonly repsByExercise = signal<Record<string, number>>({});
  readonly restTimers = signal<Record<string, number>>({});
  private readonly timerHandles = new Map<string, ReturnType<typeof setInterval>>();
  @ViewChildren('exerciseCard') private readonly exerciseCards!: QueryList<ElementRef<HTMLElement>>;

  readonly activePlanExercises = computed(() => this.workoutPlans()[0]?.exercises ?? []);
  readonly workoutSummary = computed(() => {
    const calories = this.activityToday()?.totalCalories ?? 0;
    const heartRate = this.vitalsToday()?.summary.HEART_RATE?.value;
    return {
      calories,
      heartRate: Number.isFinite(heartRate) ? heartRate : null,
    };
  });

  constructor() {
    afterNextRender(() => {
      void this.tryFinalizeSyncOAuthFromUrl();
      void this.metricsService.loadWorkoutSuggestions();
      void this.metricsService.loadWorkoutPlans();
      void this.metricsService.loadSyncConnections();
      void this.metricsService.loadActivityToday();
      void this.metricsService.loadVitalsToday();
    });
    this.destroyRef.onDestroy(() => this.clearAllTimers());
  }

  ngAfterViewInit(): void {
    this.exerciseCards.changes
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.animateExerciseCards());
    this.animateExerciseCards();
  }

  providerLabel(provider: HealthSyncProvider): string {
    return provider === 'GOOGLE_FIT' ? 'Google Fit' : 'Samsung Health';
  }

  isConnected(provider: HealthSyncProvider): boolean {
    return this.syncConnections().some((c) => c.provider === provider && c.connected);
  }

  isAutoSync(provider: HealthSyncProvider): boolean {
    return this.syncConnections().find((c) => c.provider === provider)?.autoSync ?? false;
  }

  async createPlan(): Promise<void> {
    const name = this.newPlanName().trim();
    if (!name) return;
    const plan = await this.metricsService.createWorkoutPlan(name);
    if (plan) {
      this.newPlanName.set('');
    }
  }

  setReps(exerciseId: string, value: number): void {
    const parsed = Number(value);
    if (Number.isNaN(parsed) || !Number.isInteger(parsed) || parsed <= 0) return;
    this.repsByExercise.update((state) => ({ ...state, [exerciseId]: parsed }));
  }

  async logSet(exercise: WorkoutPlanExercise): Promise<void> {
    const reps = this.repsByExercise()[exercise.id] ?? exercise.repsMin;
    const result = await this.metricsService.logWorkoutSet(exercise.id, reps);
    if (!result) return;

    this.restTimers.update((state) => ({ ...state, [exercise.id]: result.restSeconds }));
    this.startRestCountdown(exercise.id, result.restSeconds);
  }

  async connectProvider(provider: HealthSyncProvider): Promise<void> {
    const oauth = await this.metricsService.startSyncOAuth(provider);
    if (!oauth) {
      await this.metricsService.connectSyncProvider(provider);
      return;
    }
    const popup = window.open(oauth.authUrl, '_blank', 'noopener,noreferrer');
    if (!popup) {
      this.toast.warning(this.translate.instant('WORKOUTS.POPUP_BLOCKED'));
    }
  }

  async toggleAutoSync(provider: HealthSyncProvider, autoSync: boolean): Promise<void> {
    await this.metricsService.setSyncAuto(provider, autoSync);
  }

  async pullNow(provider: HealthSyncProvider): Promise<void> {
    await this.metricsService.runSyncPull(provider);
  }

  private startRestCountdown(exerciseId: string, seconds: number): void {
    if (seconds <= 0) return;
    this.clearTimer(exerciseId);
    const timer = setInterval(() => {
      const current = this.restTimers()[exerciseId] ?? 0;
      if (current <= 1) {
        this.clearTimer(exerciseId);
        this.restTimers.update((state) => ({ ...state, [exerciseId]: 0 }));
        return;
      }
      this.restTimers.update((state) => ({ ...state, [exerciseId]: current - 1 }));
    }, 1000);
    this.timerHandles.set(exerciseId, timer);
  }

  private animateExerciseCards(): void {
    this.exerciseCards.forEach((card, index) => {
      animate(
        card.nativeElement,
        { opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0)'] },
        { duration: 0.35, delay: index * 0.05, ease: 'easeOut' },
      );
    });
  }

  private clearTimer(exerciseId: string): void {
    const timer = this.timerHandles.get(exerciseId);
    if (timer !== undefined) {
      clearInterval(timer);
      this.timerHandles.delete(exerciseId);
    }
  }

  private clearAllTimers(): void {
    for (const timer of this.timerHandles.values()) {
      clearInterval(timer);
    }
    this.timerHandles.clear();
  }

  private async tryFinalizeSyncOAuthFromUrl(): Promise<void> {
    if (!window.location.search) return;
    const currentUrl = new URL(window.location.href);
    const state =
      currentUrl.searchParams.get('oauth_state') ??
      currentUrl.searchParams.get('state');
    const code =
      currentUrl.searchParams.get('oauth_code') ??
      currentUrl.searchParams.get('code');
    if (!state || !code) return;

    await this.metricsService.completeSyncOAuth(state, code);

    currentUrl.searchParams.delete('oauth_state');
    currentUrl.searchParams.delete('oauth_code');
    currentUrl.searchParams.delete('state');
    currentUrl.searchParams.delete('code');
    const cleanedUrl = this.buildUrlFromParts(
      currentUrl.pathname,
      currentUrl.searchParams,
      currentUrl.hash,
    );
    window.history.replaceState({}, '', cleanedUrl);
  }

  private buildUrlFromParts(pathname: string, params: URLSearchParams, hash: string): string {
    const query = params.toString();
    return `${pathname}${query ? `?${query}` : ''}${hash || ''}`;
  }
}
