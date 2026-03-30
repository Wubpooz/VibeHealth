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
import type {
  ExerciseCategory,
  WorkoutExerciseSuggestion,
  WorkoutPlan,
  WorkoutPlanExercise,
  HealthSyncProvider,
} from '../../core/metrics/metrics.types';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LucideDumbbell } from '@lucide/angular';
import { ToastService } from '../../core/toast/toast.service';

@Component({
  selector: 'app-workouts-page',
  imports: [CommonModule, TranslateModule, FormsModule, PageHeaderComponent, LucideDumbbell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="workouts-shell min-h-screen">
      <app-page-header
        [title]="'WORKOUTS.TITLE' | translate"
        [subtitle]="'WORKOUTS.SUBTITLE' | translate"
        [backLabel]="'common.back_to_dashboard' | translate"
        [showBackLabel]="true"
      >
        <div pageHeaderIcon class="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <span class="text-primary-500" aria-hidden="true">
            <svg lucideDumbbell [size]="24" [strokeWidth]="2"></svg>
          </span>
        </div>

        <div pageHeaderRight class="workout-chip-wrap">
            <span class="workout-chip">
              {{ 'WORKOUTS.DIFFICULTY.LABEL' | translate }}:
              @if (workoutSuggestions()?.difficulty) {
                {{ ('WORKOUTS.DIFFICULTY.' + workoutSuggestions()!.difficulty) | translate }}
              } @else {
                -
              }
            </span>
            @for (category of workoutSuggestions()?.categories ?? []; track category) {
              <span class="workout-chip workout-chip-muted">
                {{ ('WORKOUTS.CATEGORY.' + category) | translate }}
              </span>
            }
          </div>
      </app-page-header>

      <div class="px-4 sm:px-6 lg:px-8 py-8 pb-24">
        <div class="mx-auto max-w-6xl space-y-6">

        <section class="workout-surface">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-xl font-bold dark:text-white">{{ 'WORKOUTS.SUGGESTED_EXERCISES' | translate }}</h2>
            <span class="workout-pill">{{ suggestedExercises().length }}</span>
          </div>

          @if (!activePlan()) {
            <p class="mt-2 text-sm text-orange-700 dark:text-orange-300">{{ 'WORKOUTS.CREATE_PLAN_FIRST' | translate }}</p>
          }

          @if (suggestedExercises().length > 0) {
            <div class="mt-4 workout-type-grid">
              @for (exercise of suggestedExercises(); track exercise.id) {
                <article class="workout-type-card" [class.workout-type-card-selected]="isExerciseInActivePlan(exercise.id)">
                  <div class="flex items-start justify-between gap-3">
                    <span class="workout-type-icon">{{ categoryIcon(exercise.category) }}</span>
                    <span class="workout-type-meta">
                      {{ ('WORKOUTS.CATEGORY.' + exercise.category) | translate }}
                    </span>
                  </div>
                  <p class="mt-3 text-sm font-semibold dark:text-white leading-snug">{{ exercise.name }}</p>
                  <p class="mt-1 text-xs dark:text-white/65">
                    {{ exercise.defaultSets }} sets • {{ exercise.defaultRepsMin }}-{{ exercise.defaultRepsMax }} reps
                  </p>
                  <button
                    type="button"
                    class="mt-3 workout-action-button"
                    [class.workout-action-button-disabled]="isExerciseInActivePlan(exercise.id)"
                    [disabled]="planMutationLoading() || !activePlan() || isExerciseInActivePlan(exercise.id)"
                    (click)="addExerciseToPlan(exercise)"
                  >
                    {{ isExerciseInActivePlan(exercise.id) ? ('WORKOUTS.ALREADY_IN_PLAN' | translate) : ('WORKOUTS.ADD_TO_PLAN' | translate) }}
                  </button>
                </article>
              }
            </div>
          } @else {
            <p class="mt-3 text-sm dark:text-white/70">{{ 'WORKOUTS.NO_SUGGESTIONS' | translate }}</p>
          }
        </section>

        <section class="workout-surface space-y-4">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-xl font-bold dark:text-white">{{ 'WORKOUTS.ACTIVE_PLAN' | translate }}</h2>
            <span class="workout-pill">{{ workoutPlans().length }}</span>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-end gap-3">
            <label class="flex-1">
              <span class="block text-sm font-medium dark:text-white/90 mb-1">{{ 'WORKOUTS.NEW_PLAN_NAME' | translate }}</span>
              <input
                id="workout-plan-name"
                type="text"
                [ngModel]="newPlanName()"
                (ngModelChange)="newPlanName.set($event)"
                class="workout-input"
                [placeholder]="'WORKOUTS.NEW_PLAN_PLACEHOLDER' | translate"
              />
            </label>
            <button
              type="button"
              (click)="createPlan()"
              class="workout-create-button"
            >
              {{ 'WORKOUTS.CREATE_PLAN' | translate }}
            </button>
          </div>

          @if (workoutPlans().length > 0) {
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
              @for (plan of workoutPlans(); track plan.id; let i = $index) {
                <article class="plan-card" [style.background]="planGradient(i)">
                  <div class="plan-card-overlay"></div>
                  <div class="relative z-[1] space-y-1">
                    <p class="text-lg font-bold text-white">{{ plan.name }}</p>
                    <p class="text-xs text-white/85">
                      {{ ('WORKOUTS.DIFFICULTY.' + plan.difficulty) | translate }}
                    </p>
                    <p class="text-sm text-white/90">
                      {{ plan.exercises.length }} • {{ estimatedDurationMinutes(plan.exercises) }} min
                    </p>
                  </div>
                </article>
              }
            </div>
          }
        </section>

        @if (activePlanExercises().length > 0) {
          <section class="workout-surface space-y-4">
            <h2 class="text-xl font-bold dark:text-white">{{ 'WORKOUTS.LOG_SET' | translate }}</h2>

            <div class="grid gap-3">
              @for (exercise of activePlanExercises(); track exercise.id; let isFirst = $first; let isLast = $last) {
                <article #exerciseCard class="queue-card">
                  <div class="flex flex-wrap items-start justify-between gap-3">
                    <div class="flex items-start gap-3">
                      <span class="queue-icon">{{ categoryIcon(exercise.exercise.category) }}</span>
                      <div>
                        <p class="font-semibold dark:text-white">{{ exercise.exercise.name }}</p>
                        <p class="text-xs dark:text-white/65 mt-1">
                          {{ exercise.sets }} sets • {{ exercise.repsMin }}-{{ exercise.repsMax }} reps • {{ exercise.restSeconds }}s rest
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      class="queue-play-button"
                      [disabled]="planMutationLoading()"
                      (click)="logSet(exercise)"
                    >
                      ▶
                    </button>
                  </div>

                  <div class="mt-3 flex flex-wrap items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      [attr.aria-label]="'WORKOUTS.REPS_INPUT_ARIA' | translate:{ exercise: exercise.exercise.name }"
                      class="queue-input"
                      [ngModel]="repsByExercise()[exercise.id] || exercise.repsMin"
                      (ngModelChange)="setReps(exercise.id, $event)"
                    />

                    <button
                      type="button"
                      class="queue-control"
                      [disabled]="isFirst || planMutationLoading()"
                      (click)="moveExercise(exercise.id, 'up')"
                    >
                      {{ 'WORKOUTS.MOVE_UP' | translate }}
                    </button>
                    <button
                      type="button"
                      class="queue-control"
                      [disabled]="isLast || planMutationLoading()"
                      (click)="moveExercise(exercise.id, 'down')"
                    >
                      {{ 'WORKOUTS.MOVE_DOWN' | translate }}
                    </button>
                    <button
                      type="button"
                      class="queue-control queue-control-danger"
                      [disabled]="planMutationLoading()"
                      (click)="removeExerciseFromPlan(exercise)"
                    >
                      {{ 'WORKOUTS.REMOVE_EXERCISE' | translate }}
                    </button>
                  </div>

                  @if (restTimers()[exercise.id] && restTimers()[exercise.id]! > 0) {
                    <p class="mt-2 text-xs font-semibold text-orange-300">
                      {{ 'WORKOUTS.REST_TIMER' | translate }}: {{ restTimers()[exercise.id] }}s
                    </p>
                  }
                </article>
              }
            </div>
          </section>
        }

        <section class="workout-surface">
          <h2 class="text-xl font-bold dark:text-white">{{ 'WORKOUTS.SUMMARY_TITLE' | translate }}</h2>
          <p class="text-sm dark:text-white/70">{{ 'WORKOUTS.SUMMARY_SUBTITLE' | translate }}</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
            <div class="summary-card summary-card-green">
              <p class="text-xs uppercase tracking-wide text-orange-700 dark:text-orange-200">{{ 'WORKOUTS.CALORIES_TODAY' | translate }}</p>
              <p class="mt-1 text-2xl font-bold dark:text-white">{{ workoutSummary().calories }} kcal</p>
            </div>
            <div class="summary-card summary-card-purple">
              <p class="text-xs uppercase tracking-wide text-orange-600 dark:text-orange-200">{{ 'WORKOUTS.HEART_RATE_LAST' | translate }}</p>
              <p class="mt-1 text-2xl font-bold dark:text-white">
                @if (workoutSummary().heartRate !== null) {
                  {{ workoutSummary().heartRate }} bpm
                } @else {
                  {{ 'WORKOUTS.NO_HEART_RATE' | translate }}
                }
              </p>
            </div>
          </div>
        </section>

        <section class="workout-surface">
          <h2 class="text-xl font-bold dark:text-white">{{ 'WORKOUTS.SYNC_TITLE' | translate }}</h2>
          <p class="text-sm dark:text-white/70">{{ 'WORKOUTS.SYNC_SUBTITLE' | translate }}</p>

          <div class="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
            @for (provider of providers; track provider) {
              <article class="sync-card">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <p class="font-semibold dark:text-white">{{ providerLabel(provider) }}</p>
                  <button
                    type="button"
                    class="queue-control"
                    [class.workout-connect-button]="!isConnected(provider)"
                    [class.workout-connected-button]="isConnected(provider)"
                    (click)="connectProvider(provider)"
                  >
                    {{ isConnected(provider) ? ('WORKOUTS.CONNECTED' | translate) : ('WORKOUTS.CONNECT' | translate) }}
                  </button>
                </div>
                <div class="mt-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    [checked]="isAutoSync(provider)"
                    #autoSyncInput
                    (change)="toggleAutoSync(provider, autoSyncInput.checked)"
                    [disabled]="!isConnected(provider)"
                    [attr.aria-label]="'WORKOUTS.AUTO_SYNC' | translate"
                  />
                  <span class="text-sm dark:text-white/80">{{ 'WORKOUTS.AUTO_SYNC' | translate }}</span>
                </div>
                <button
                  type="button"
                  class="mt-3 queue-control workout-pull-button"
                  (click)="pullNow(provider)"
                  [disabled]="!isConnected(provider)"
                >
                  {{ 'WORKOUTS.PULL_NOW' | translate }}
                </button>
              </article>
            }
          </div>
        </section>
      </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    /* Light mode (default) */
    .workouts-shell {
      background:
        radial-gradient(circle at 15% 10%, rgba(255, 107, 107, 0.08), transparent 34%),
        radial-gradient(circle at 90% 18%, rgba(255, 160, 122, 0.06), transparent 30%),
        linear-gradient(180deg, #fffaf8 0%, #fff5f2 50%, #fff0ed 100%);
    }

    .workout-surface {
      border-radius: 1.5rem;
      border: 1px solid rgba(255, 107, 107, 0.15);
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(255, 250, 248, 0.88));
      padding: 1.25rem;
      backdrop-filter: saturate(120%);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      color: #1a1a1a;
    }

    /* Dark mode overrides */
    :host-context(.dark) .workouts-shell {
      background:
        radial-gradient(circle at 15% 10%, rgba(255, 107, 107, 0.16), transparent 34%),
        radial-gradient(circle at 90% 18%, rgba(255, 160, 122, 0.12), transparent 30%),
        linear-gradient(180deg, #0a0a0f 0%, #14111a 48%, #0f0d14 100%);
    }

    :host-context(.dark) .workout-surface {
      border-color: rgba(148, 163, 184, 0.25);
      background: linear-gradient(180deg, rgba(15, 23, 42, 0.88), rgba(3, 7, 18, 0.88));
      box-shadow: none;
      color: #f5f5f5;
    }

    .workout-header-panel {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 250, 248, 0.92));
      border: 1px solid rgba(255, 107, 107, 0.15);
    }

    :host-context(.dark) .workout-header-panel {
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.92));
      border-color: rgba(148, 163, 184, 0.25);
    }

    .workout-chip-wrap {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 0.5rem;
      max-width: 32rem;
    }

    .workout-chip {
      border-radius: 999px;
      border: 1.5px solid rgba(255, 107, 107, 0.3);
      background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 160, 122, 0.08));
      color: #8a2f2f;
      padding: 0.4rem 0.9rem;
      font-size: 0.75rem;
      font-weight: 700;
      line-height: 1.2;
      box-shadow: 0 1px 3px rgba(255, 107, 107, 0.08);
    }

    :host-context(.dark) .workout-chip {
      border: 1.5px solid rgba(255, 107, 107, 0.6);
      background: linear-gradient(135deg, rgba(255, 107, 107, 0.18), rgba(255, 160, 122, 0.12));
      color: #ffd4cc;
      box-shadow: 0 2px 8px rgba(255, 107, 107, 0.1);
    }

    .workout-chip-muted {
      border-color: rgba(192, 160, 200, 0.25);
      background: linear-gradient(135deg, rgba(192, 160, 200, 0.08), rgba(224, 214, 240, 0.05));
      color: #6d4a8a;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    }

    :host-context(.dark) .workout-chip-muted {
      border-color: rgba(192, 160, 200, 0.55);
      background: linear-gradient(135deg, rgba(192, 160, 200, 0.15), rgba(224, 214, 240, 0.08));
      color: #f5e8ff;
      box-shadow: 0 2px 6px rgba(192, 160, 200, 0.08);
    }

    .workout-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 2rem;
      height: 2rem;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 700;
      color: #8a2f2f;
      border: 1px solid rgba(255, 107, 107, 0.2);
      background: linear-gradient(135deg, rgba(255, 107, 107, 0.08), rgba(255, 160, 122, 0.06));
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }

    :host-context(.dark) .workout-pill {
      color: #ffb8a8;
      border: 1px solid rgba(255, 107, 107, 0.5);
      background: linear-gradient(135deg, rgba(255, 107, 107, 0.16), rgba(255, 160, 122, 0.1));
      box-shadow: 0 1px 4px rgba(255, 107, 107, 0.12);
    }

    .workout-type-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 0.75rem;
    }

    .workout-type-card {
      border-radius: 1rem;
      border: 1px solid rgba(255, 107, 107, 0.15);
      background: rgba(255, 255, 255, 0.85);
      padding: 0.75rem;
      transition: transform 0.25s ease, border-color 0.25s ease;
      color: #1a1a1a;
    }

    .workout-type-card:hover {
      transform: translateY(-2px);
      border-color: rgba(255, 107, 107, 0.3);
      background: rgba(255, 255, 255, 0.95);
    }

    .workout-type-card-selected {
      border-color: rgba(255, 107, 107, 0.4);
      box-shadow: inset 0 0 0 1px rgba(255, 107, 107, 0.2);
    }

    :host-context(.dark) .workout-type-card {
      border: 1px solid rgba(148, 163, 184, 0.28);
      background: rgba(15, 23, 42, 0.75);
      color: #f5f5f5;
    }

    :host-context(.dark) .workout-type-card:hover {
      border-color: rgba(255, 160, 122, 0.7);
    }

    :host-context(.dark) .workout-type-card-selected {
      border-color: rgba(255, 107, 107, 0.8);
      box-shadow: inset 0 0 0 1px rgba(255, 107, 107, 0.35);
    }

    .workout-type-icon {
      display: inline-flex;
      width: 2rem;
      height: 2rem;
      align-items: center;
      justify-content: center;
      border-radius: 0.75rem;
      background: rgba(255, 107, 107, 0.1);
      font-size: 1rem;
    }

    :host-context(.dark) .workout-type-icon {
      background: rgba(255, 107, 107, 0.2);
    }

    .workout-type-meta {
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      padding: 0.2rem 0.5rem;
      color: rgba(255, 255, 255, 0.78);
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    .workout-action-button,
    .workout-create-button,
    .queue-control {
      border: none;
      border-radius: 999px;
      padding: 0.45rem 0.95rem;
      font-size: 0.75rem;
      font-weight: 700;
      transition: transform 0.2s ease, opacity 0.2s ease;
    }

    .workout-action-button {
      // color: #0d0a05;
      color: white;
      background: #ff9d87;
    }

    :host-context(.dark) .workout-action-button {
      color: white;
    }

    .workout-action-button-disabled {
      background: rgba(200, 200, 200, 0.4);
      color: rgba(100, 100, 100, 0.8);
    }

    :host-context(.dark) .workout-action-button-disabled {
      background: rgba(148, 163, 184, 0.35);
      color: rgba(255, 255, 255, 0.8);
    }

    .workout-create-button {
      background: linear-gradient(90deg, #ff9d87, #ffa07a);
      color: white;
      align-self: flex-end;
      min-height: 2.75rem;
      padding-inline: 1.25rem;
    }

    .workout-input,
    .queue-input {
      width: 100%;
      border-radius: 0.9rem;
      border: 1px solid rgba(148, 163, 184, 0.4);
      background: #ffffff;
      color: #1a1a1a;
      padding: 0.65rem 0.8rem;
      font-size: 0.85rem;
    }

    :host-context(.dark) .workout-input,
    :host-context(.dark) .queue-input {
      background: rgba(2, 6, 23, 0.55);
      color: #f5f5f5;
      border-color: rgba(148, 163, 184, 0.6);
    }

    .queue-input {
      width: 5.25rem;
      padding: 0.45rem 0.65rem;
      text-align: center;
    }

    .plan-card {
      position: relative;
      overflow: hidden;
      border-radius: 1.15rem;
      min-height: 6.5rem;
      border: 1px solid rgba(255, 255, 255, 0.28);
      padding: 0.9rem;
    }

    .plan-card-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(15, 23, 42, 0.24));
      pointer-events: none;
    }

    .queue-card {
      border-radius: 1rem;
      border: 1px solid rgba(255, 107, 107, 0.15);
      background: linear-gradient(140deg, rgba(255, 255, 255, 0.9), rgba(255, 250, 248, 0.85));
      padding: 0.9rem;
      color: #1a1a1a;
    }

    :host-context(.dark) .queue-card {
      border: 1px solid rgba(255, 107, 107, 0.3);
      background: linear-gradient(140deg, rgba(30, 15, 12, 0.6), rgba(15, 10, 8, 0.75));
      color: #f5f5f5;
    }

    .queue-icon {
      display: inline-flex;
      width: 2rem;
      height: 2rem;
      align-items: center;
      justify-content: center;
      border-radius: 0.7rem;
      background: rgba(255, 107, 107, 0.1);
      color: white;
      font-size: 1rem;
      flex-shrink: 0;
    }

    :host-context(.dark) .queue-icon {
      background: rgba(255, 107, 107, 0.22);
      color: #ffb8a8;
    }

    .queue-play-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.3rem;
      height: 2.3rem;
      border-radius: 999px;
      border: none;
      background: #ff9d87;
      color: #0d0a05;
      font-weight: 800;
    }

    :host-context(.dark) .queue-play-button {
      color: white;
    }

    .queue-control {
      border: 1px solid rgba(255, 107, 107, 0.2);
      background: rgba(255, 255, 255, 0.8);
      color: #1a1a1a;
    }

    .queue-control-danger {
      border-color: rgba(220, 38, 38, 0.25);
      color: #b91c1c;
      background: rgba(254, 202, 202, 0.12);
    }

    :host-context(.dark) .queue-control {
      border: 1px solid rgba(148, 163, 184, 0.45);
      background: rgba(15, 23, 42, 0.64);
      color: rgba(255, 255, 255, 0.9);
    }

    :host-context(.dark) .queue-control-danger {
      border-color: rgba(248, 113, 113, 0.55);
      color: #fecaca;
      background: rgba(127, 29, 29, 0.26);
    }

    .summary-card {
      border-radius: 1rem;
      border: 1px solid rgba(255, 107, 107, 0.15);
      padding: 0.75rem;
      color: black;
    }
    
    :host-context(.dark) .summary-card {
      border: 1px solid rgba(148, 163, 184, 0.35);
      color: #1a1a1a;
      color: #f5f5f5;
    }

    .summary-card-green {
      background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 160, 122, 0.08));
    }

    :host-context(.dark) .summary-card-green {
      background: linear-gradient(135deg, rgba(255, 107, 107, 0.38), rgba(255, 160, 122, 0.28));
    }

    .summary-card-purple {
      background: linear-gradient(135deg, rgba(192, 160, 200, 0.1), rgba(224, 214, 240, 0.08));
    }

    :host-context(.dark) .summary-card-purple {
      background: linear-gradient(135deg, rgba(255, 160, 122, 0.42), rgba(255, 200, 150, 0.3));
    }

    .sync-card {
      border-radius: 1rem;
      border: 1px solid rgba(255, 107, 107, 0.15);
      background: rgba(255, 255, 255, 0.8);
      padding: 0.85rem;
      color: #1a1a1a;
    }

    :host-context(.dark) .sync-card {
      border: 1px solid rgba(148, 163, 184, 0.35);
      background: rgba(15, 23, 42, 0.65);
      color: #f5f5f5;
    }

    .workout-connect-button {
      background: rgba(255, 107, 107, 0.08);
      border-color: rgba(255, 107, 107, 0.25);
      color: #8a2f2f;
    }

    :host-context(.dark) .workout-connect-button {
      background: rgba(255, 107, 107, 0.18);
      border-color: rgba(255, 107, 107, 0.7);
      color: #ffb8a8;
    }

    .workout-connected-button {
      background: rgba(255, 107, 107, 0.12);
      border-color: rgba(255, 107, 107, 0.2);
      color: #8a2f2f;
    }

    :host-context(.dark) .workout-connected-button {
      background: rgba(255, 157, 135, 0.24);
      border-color: rgba(255, 160, 122, 0.75);
      color: #fff0ea;
    }

    .workout-pull-button {
      border-color: rgba(192, 160, 200, 0.25);
      color: #6d4a8a;
      background: rgba(192, 160, 200, 0.08);
    }

    :host-context(.dark) .workout-pull-button {
      border-color: rgba(224, 214, 240, 0.55);
      color: #f5e8ff;
      background: rgba(192, 160, 200, 0.18);
    }

    button:not(:disabled):hover {
      transform: translateY(-1px);
    }

    button:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    button:focus-visible,
    input:focus-visible {
      outline: 2px solid #ff9d87;
      outline-offset: 2px;
    }

    @media (max-width: 640px) {
      .workout-surface {
        padding: 1rem;
      }

      .workout-chip-wrap {
        justify-content: flex-start;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .workout-type-card,
      .workout-action-button,
      .workout-create-button,
      .queue-control,
      .queue-play-button {
        transition: none;
      }
    }
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
  readonly planMutationLoading = signal(false);
  private readonly timerHandles = new Map<string, ReturnType<typeof setInterval>>();
  @ViewChildren('exerciseCard') private readonly exerciseCards!: QueryList<ElementRef<HTMLElement>>;

  readonly activePlan = computed<WorkoutPlan | null>(() => this.workoutPlans()[0] ?? null);
  readonly activePlanExercises = computed(() => this.activePlan()?.exercises ?? []);
  readonly activePlanExerciseCatalogIds = computed(
    () => new Set(this.activePlanExercises().map((exercise) => exercise.exerciseCatalogId)),
  );
  readonly suggestedExercises = computed(() => this.workoutSuggestions()?.exercises ?? []);
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

  categoryIcon(category: ExerciseCategory): string {
    switch (category) {
      case 'STRENGTH':
        return '🏋️';
      case 'CARDIO':
        return '🏃';
      case 'MOBILITY':
        return '🤸';
      case 'FLEXIBILITY':
        return '🧘';
      case 'RECOVERY':
        return '🫶';
      default:
        return '💪';
    }
  }

  planGradient(index: number): string {
    const gradients = [
      'linear-gradient(135deg, rgba(56, 189, 248, 0.72), rgba(30, 64, 175, 0.72))',
      'linear-gradient(135deg, rgba(236, 72, 153, 0.72), rgba(124, 58, 237, 0.72))',
      'linear-gradient(135deg, rgba(250, 204, 21, 0.72), rgba(217, 119, 6, 0.72))',
      'linear-gradient(135deg, rgba(34, 197, 94, 0.72), rgba(5, 150, 105, 0.72))',
    ];
    return gradients[index % gradients.length] ?? gradients[0];
  }

  estimatedDurationMinutes(exercises: WorkoutPlanExercise[]): number {
    if (exercises.length === 0) {
      return 0;
    }

    const totalSeconds = exercises.reduce((sum, exercise) => {
      const setTimeSeconds = exercise.sets * 40;
      const restTimeSeconds = Math.max(exercise.sets - 1, 0) * exercise.restSeconds;
      return sum + setTimeSeconds + restTimeSeconds;
    }, 0);

    return Math.max(5, Math.round(totalSeconds / 60));
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

  isExerciseInActivePlan(exerciseCatalogId: string): boolean {
    return this.activePlanExerciseCatalogIds().has(exerciseCatalogId);
  }

  async addExerciseToPlan(exercise: WorkoutExerciseSuggestion): Promise<void> {
    const plan = this.activePlan();
    if (!plan || this.isExerciseInActivePlan(exercise.id)) return;

    this.planMutationLoading.set(true);
    try {
      await this.metricsService.addExerciseToWorkoutPlan(plan.id, {
        exerciseCatalogId: exercise.id,
      });
    } finally {
      this.planMutationLoading.set(false);
    }
  }

  async removeExerciseFromPlan(exercise: WorkoutPlanExercise): Promise<void> {
    const plan = this.activePlan();
    if (!plan) return;

    this.planMutationLoading.set(true);
    try {
      await this.metricsService.removeExerciseFromWorkoutPlan(plan.id, exercise.id);
      this.clearTimer(exercise.id);
      this.restTimers.update((state) => {
        const next = { ...state };
        delete next[exercise.id];
        return next;
      });
      this.repsByExercise.update((state) => {
        const next = { ...state };
        delete next[exercise.id];
        return next;
      });
    } finally {
      this.planMutationLoading.set(false);
    }
  }

  async moveExercise(exerciseId: string, direction: 'up' | 'down'): Promise<void> {
    const plan = this.activePlan();
    if (!plan) return;

    const ordered = [...this.activePlanExercises()];
    const currentIndex = ordered.findIndex((exercise) => exercise.id === exerciseId);
    if (currentIndex < 0) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= ordered.length) return;

    const [moved] = ordered.splice(currentIndex, 1);
    ordered.splice(targetIndex, 0, moved);

    this.planMutationLoading.set(true);
    try {
      await this.metricsService.reorderWorkoutPlanExercises(plan.id, {
        exerciseIds: ordered.map((exercise) => exercise.id),
      });
    } finally {
      this.planMutationLoading.set(false);
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
    if (!globalThis.location.search) return;
    const currentUrl = new URL(globalThis.location.href);
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
    globalThis.history.replaceState({}, '', cleanedUrl);
  }

  private buildUrlFromParts(pathname: string, params: URLSearchParams, hash: string): string {
    const query = params.toString();
    return pathname + (query ? `?${query}` : '') + (hash || '');
  }
}
