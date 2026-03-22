import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  afterNextRender,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import {
  GoalsService,
  GOAL_TYPE_INFO,
  GOAL_FREQ_INFO,
  type Goal,
} from "../../core/metrics/goals.service";
import { RewardsService } from "../../core/rewards/rewards.service";
import { GoalWizardComponent } from "./goal-wizard.component";
// import {
//   TrendChartComponent,
//   type TrendDataPoint,
// } from "../../shared/components/trend-chart/trend-chart.component";

@Component({
  selector: "app-goals-page",
  imports: [
    CommonModule,
    TranslateModule,
    GoalWizardComponent,
    // TrendChartComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="min-h-screen bg-[#fdf8f8] dark:bg-gray-950 px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-6"
    >
      <!-- Page Header -->
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/20"
          >
            <span class="text-2xl">🎯</span>
          </div>
          <div>
            <h1
              class="text-2xl font-bold text-gray-900 dark:text-white font-heading"
            >
              {{ "GOALS.TITLE" | translate }}
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {{ "GOALS.SUBTITLE" | translate }}
            </p>
          </div>
        </div>

        <button class="new-goal-btn" (click)="showWizard.set(true)">
          <span class="text-lg">+</span>
          {{ "GOALS.NEW_GOAL" | translate }}
        </button>
      </div>

      <!-- Summary strip -->
      @if (goalsService.hasGoals()) {
        <div class="grid grid-cols-3 gap-4">
          <div class="summary-card">
            <span class="summary-emoji">🎯</span>
            <p class="summary-value">{{ goalsService.activeGoals().length }}</p>
            <p class="summary-label">{{ "GOALS.ACTIVE" | translate }}</p>
          </div>
          <div class="summary-card">
            <span class="summary-emoji">✅</span>
            <p class="summary-value">{{ completedTodayCount() }}</p>
            <p class="summary-label">
              {{ "GOALS.COMPLETED_TODAY" | translate }}
            </p>
          </div>
          <div class="summary-card">
            <span class="summary-emoji">🔥</span>
            <p class="summary-value">{{ rewardsService.streak() }}</p>
            <p class="summary-label">{{ "STATS.DAY_STREAK" | translate }}</p>
          </div>
        </div>
      }

      <!-- Loading state -->
      @if (goalsService.loading()) {
        <div class="flex flex-col items-center justify-center py-16 gap-4">
          <div class="loading-ring"></div>
          <p class="text-sm text-gray-400 font-medium">
            {{ "common.loading" | translate }}
          </p>
        </div>
      }

      <!-- Empty state -->
      @if (!goalsService.loading() && !goalsService.hasGoals()) {
        <div class="empty-state">
          <div class="empty-mascot">🐰</div>
          <h2 class="empty-title">{{ "GOALS.EMPTY_TITLE" | translate }}</h2>
          <p class="empty-subtitle">{{ "GOALS.EMPTY_SUBTITLE" | translate }}</p>
          <button class="new-goal-btn large" (click)="showWizard.set(true)">
            🎯 {{ "GOALS.CREATE_FIRST" | translate }}
          </button>
        </div>
      }

      <!-- Active Goals -->
      @if (!goalsService.loading() && goalsService.activeGoals().length > 0) {
        <section class="space-y-4">
          <h2 class="section-heading">
            <span>🎯</span> {{ "GOALS.ACTIVE_GOALS" | translate }}
            <span class="count-badge">{{
              goalsService.activeGoals().length
            }}</span>
          </h2>

          <div class="goals-grid">
            @for (goal of goalsService.activeGoals(); track goal.id) {
              <div class="goal-card" [class.completed]="isGoalComplete(goal)">
                <!-- Card header -->
                <div class="goal-header">
                  <div
                    class="goal-icon-wrap"
                    [style.background]="typeColor(goal.type) + '22'"
                  >
                    <span class="goal-icon">{{
                      typeInfo[goal.type].emoji
                    }}</span>
                  </div>
                  <div class="goal-meta">
                    <h3 class="goal-title">{{ goal.title }}</h3>
                    <p class="goal-freq">
                      {{ freqInfo[goal.frequency].emoji }}
                      {{ freqInfo[goal.frequency].label }}
                      @if (goal.endDate) {
                        · until {{ goal.endDate | date: "mediumDate" }}
                      }
                    </p>
                  </div>
                  <!-- Complete badge -->
                  @if (isGoalComplete(goal)) {
                    <span class="complete-badge">✓ Done</span>
                  }
                  <!-- Delete button -->
                  <button
                    class="delete-btn"
                    (click)="deleteGoal(goal.id)"
                    [disabled]="goalsService.saving()"
                    aria-label="Remove goal"
                  >
                    ✕
                  </button>
                </div>

                <!-- Progress bar -->
                <div class="progress-section">
                  <div class="progress-labels">
                    <span
                      class="progress-current"
                      [style.color]="typeColor(goal.type)"
                    >
                      {{ currentValue(goal) }} {{ goal.targetUnit }}
                    </span>
                    <span class="progress-target">
                      / {{ goal.targetValue }} {{ goal.targetUnit }}
                    </span>
                  </div>
                  <div class="progress-track">
                    <div
                      class="progress-fill"
                      [style.width.%]="progressPct(goal)"
                      [style.background]="progressGradient(goal.type)"
                    ></div>
                  </div>
                  <div class="progress-footer">
                    <span class="pct-label">{{ progressPct(goal) }}%</span>
                    @if (!isGoalComplete(goal)) {
                      <span class="remaining-label">
                        {{ goal.targetValue - currentValue(goal) }}
                        {{ goal.targetUnit }} to go
                      </span>
                    } @else {
                      <span class="achieved-label">🎉 Goal achieved!</span>
                    }
                  </div>
                </div>

                <!-- Quick-log button -->
                @if (!isGoalComplete(goal)) {
                  <button
                    class="log-progress-btn"
                    (click)="toggleLogForm(goal.id)"
                    [style.border-color]="typeColor(goal.type) + '66'"
                  >
                    {{
                      showLogForm() === goal.id ? "▲ Hide" : "📊 Log Progress"
                    }}
                  </button>

                  <!-- Inline log form -->
                  @if (showLogForm() === goal.id) {
                    <div class="log-form">
                      <input
                        type="number"
                        class="log-input"
                        [placeholder]="'Value in ' + goal.targetUnit"
                        [value]="logValue()"
                        (input)="logValue.set(+$any($event.target).value)"
                        min="0"
                      />
                      <button
                        class="log-submit"
                        [disabled]="logValue() <= 0 || goalsService.saving()"
                        (click)="submitProgress(goal)"
                        [style.background]="progressGradient(goal.type)"
                      >
                        @if (goalsService.saving()) {
                          <span class="mini-spinner"></span>
                        } @else {
                          Save
                        }
                      </button>
                    </div>
                  }
                }
              </div>
            }
          </div>
        </section>
      }

      <!-- Completed / Inactive Goals -->
      @if (
        !goalsService.loading() && goalsService.completedGoals().length > 0
      ) {
        <section class="space-y-4">
          <h2 class="section-heading muted">
            <span>✅</span> {{ "GOALS.PAST_GOALS" | translate }}
          </h2>
          <div class="goals-grid">
            @for (goal of goalsService.completedGoals(); track goal.id) {
              <div class="goal-card inactive">
                <div class="goal-header">
                  <div class="goal-icon-wrap">
                    <span class="goal-icon">{{
                      typeInfo[goal.type].emoji
                    }}</span>
                  </div>
                  <div class="goal-meta">
                    <h3 class="goal-title">{{ goal.title }}</h3>
                    <p class="goal-freq muted">
                      {{ goal.targetValue }} {{ goal.targetUnit }} ·
                      {{ freqInfo[goal.frequency].label }}
                    </p>
                  </div>
                  <span class="inactive-badge">Archived</span>
                </div>
              </div>
            }
          </div>
        </section>
      }

      <!-- Goal Wizard overlay -->
      @if (showWizard()) {
        <app-goal-wizard
          (goalCreated)="onGoalCreated()"
          (closed)="showWizard.set(false)"
        />
      }
    </div>
  `,
  styles: [
    `
      /* ── New-goal button ──────────────────────────────────────────────── */
      .new-goal-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.375rem;
        background: linear-gradient(135deg, #7c4dff 0%, #651fff 100%);
        color: white;
        font-family: "Satoshi", sans-serif;
        font-weight: 700;
        font-size: 0.9375rem;
        border: none;
        border-radius: 1rem;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 4px 14px rgba(124, 77, 255, 0.3);
      }

      .new-goal-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(124, 77, 255, 0.4);
      }

      .new-goal-btn.large {
        padding: 1rem 2rem;
        font-size: 1rem;
      }

      /* ── Summary strip ────────────────────────────────────────────────── */
      .summary-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        padding: 1.25rem 1rem;
        background: white;
        border-radius: 1.25rem;
        border: 1px solid #f1f3f4;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        text-align: center;
      }

      :host-context([data-theme="dark"]) .summary-card {
        background: rgba(31, 41, 55, 0.8);
        border-color: #374151;
      }

      .summary-emoji {
        font-size: 1.5rem;
      }

      .summary-value {
        font-family: "Satoshi", sans-serif;
        font-weight: 800;
        font-size: 1.75rem;
        color: #111827;
        line-height: 1;
        margin: 0;
      }

      :host-context([data-theme="dark"]) .summary-value {
        color: #f9fafb;
      }

      .summary-label {
        font-family: "Satoshi", sans-serif;
        font-size: 0.6875rem;
        font-weight: 600;
        color: #9ca3af;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0;
      }

      /* ── Loading ring ────────────────────────────────────────────────── */
      .loading-ring {
        width: 3rem;
        height: 3rem;
        border: 3px solid #e5e7eb;
        border-top-color: #7c4dff;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* ── Empty state ─────────────────────────────────────────────────── */
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 4rem 1.5rem;
        text-align: center;
      }

      .empty-mascot {
        font-size: 4rem;
        animation: float 3s ease-in-out infinite;
      }

      @keyframes float {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }

      .empty-title {
        font-family: "Satoshi", sans-serif;
        font-weight: 800;
        font-size: 1.375rem;
        color: #111827;
        margin: 0;
      }

      :host-context([data-theme="dark"]) .empty-title {
        color: #f9fafb;
      }

      .empty-subtitle {
        font-family: "Satoshi", sans-serif;
        font-size: 0.9375rem;
        color: #6b7280;
        margin: 0;
        max-width: 320px;
      }

      /* ── Section heading ─────────────────────────────────────────────── */
      .section-heading {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-family: "Satoshi", sans-serif;
        font-weight: 700;
        font-size: 1.0625rem;
        color: #111827;
        margin: 0;
      }

      :host-context([data-theme="dark"]) .section-heading {
        color: #f9fafb;
      }

      .section-heading.muted {
        color: #6b7280;
      }

      .count-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 1.5rem;
        height: 1.5rem;
        padding: 0 0.375rem;
        background: #7c4dff;
        color: white;
        border-radius: 0.5rem;
        font-size: 0.75rem;
        font-weight: 700;
      }

      /* ── Goals grid ──────────────────────────────────────────────────── */
      .goals-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
      }

      /* ── Goal card ───────────────────────────────────────────────────── */
      .goal-card {
        background: white;
        border-radius: 1.25rem;
        padding: 1.25rem;
        border: 1.5px solid #f1f3f4;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
        transition:
          box-shadow 0.2s ease,
          transform 0.2s ease;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .goal-card:hover {
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.09);
        transform: translateY(-2px);
      }

      .goal-card.completed {
        border-color: rgba(16, 185, 129, 0.3);
        background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
      }

      .goal-card.inactive {
        opacity: 0.6;
        background: #f9fafb;
      }

      :host-context([data-theme="dark"]) .goal-card {
        background: rgba(31, 41, 55, 0.8);
        border-color: #374151;
      }

      :host-context([data-theme="dark"]) .goal-card.completed {
        background: rgba(16, 185, 129, 0.1);
        border-color: rgba(16, 185, 129, 0.3);
      }

      :host-context([data-theme="dark"]) .goal-card.inactive {
        background: rgba(31, 41, 55, 0.4);
        border-color: #374151;
      }

      /* ── Goal header ─────────────────────────────────────────────────── */
      .goal-header {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
      }

      .goal-icon-wrap {
        width: 2.75rem;
        height: 2.75rem;
        border-radius: 0.875rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: #f3e5f5;
      }

      .goal-icon {
        font-size: 1.5rem;
      }

      .goal-meta {
        flex: 1;
        min-width: 0;
      }

      .goal-title {
        font-family: "Satoshi", sans-serif;
        font-weight: 700;
        font-size: 0.9375rem;
        color: #111827;
        margin: 0 0 0.2rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      :host-context([data-theme="dark"]) .goal-title {
        color: #f3f4f6;
      }

      .goal-freq {
        font-family: "Satoshi", sans-serif;
        font-size: 0.75rem;
        color: #9ca3af;
        margin: 0;
      }

      .goal-freq.muted {
        color: #d1d5db;
      }

      .complete-badge {
        flex-shrink: 0;
        padding: 0.25rem 0.625rem;
        background: rgba(16, 185, 129, 0.15);
        color: #059669;
        font-family: "Satoshi", sans-serif;
        font-weight: 700;
        font-size: 0.6875rem;
        border-radius: 0.5rem;
        align-self: center;
      }

      .inactive-badge {
        flex-shrink: 0;
        padding: 0.25rem 0.625rem;
        background: #f3f4f6;
        color: #9ca3af;
        font-family: "Satoshi", sans-serif;
        font-weight: 700;
        font-size: 0.6875rem;
        border-radius: 0.5rem;
        align-self: center;
      }

      .delete-btn {
        flex-shrink: 0;
        width: 1.75rem;
        height: 1.75rem;
        border-radius: 0.5rem;
        border: none;
        background: transparent;
        color: #d1d5db;
        font-size: 0.75rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s ease;
        align-self: flex-start;
      }

      .delete-btn:hover {
        background: #fef2f2;
        color: #ef4444;
      }

      .delete-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      /* ── Progress section ────────────────────────────────────────────── */
      .progress-section {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .progress-labels {
        display: flex;
        align-items: baseline;
        gap: 0.25rem;
      }

      .progress-current {
        font-family: "Satoshi", sans-serif;
        font-weight: 700;
        font-size: 1.125rem;
      }

      .progress-target {
        font-family: "Satoshi", sans-serif;
        font-size: 0.8125rem;
        color: #9ca3af;
      }

      .progress-track {
        height: 0.5rem;
        background: #f1f3f4;
        border-radius: 0.5rem;
        overflow: hidden;
      }

      :host-context([data-theme="dark"]) .progress-track {
        background: #374151;
      }

      .progress-fill {
        height: 100%;
        border-radius: 0.5rem;
        transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        min-width: 0.5rem;
      }

      .progress-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .pct-label {
        font-family: "Satoshi", sans-serif;
        font-size: 0.6875rem;
        font-weight: 700;
        color: #6b7280;
      }

      .remaining-label {
        font-family: "Satoshi", sans-serif;
        font-size: 0.6875rem;
        color: #9ca3af;
      }

      .achieved-label {
        font-family: "Satoshi", sans-serif;
        font-size: 0.6875rem;
        font-weight: 700;
        color: #059669;
      }

      /* ── Inline log form ─────────────────────────────────────────────── */
      .log-progress-btn {
        padding: 0.5rem 0.875rem;
        background: transparent;
        border: 1.5px solid #e5e7eb;
        border-radius: 0.75rem;
        font-family: "Satoshi", sans-serif;
        font-size: 0.8125rem;
        font-weight: 600;
        color: #6b7280;
        cursor: pointer;
        transition: all 0.15s ease;
        align-self: flex-start;
      }

      .log-progress-btn:hover {
        background: #f9fafb;
        color: #374151;
      }

      :host-context([data-theme="dark"]) .log-progress-btn {
        border-color: #4b5563;
        color: #9ca3af;
      }

      :host-context([data-theme="dark"]) .log-progress-btn:hover {
        background: #374151;
        color: #e5e7eb;
      }

      .log-form {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        animation: slideDown 0.2s ease;
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-6px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .log-input {
        flex: 1;
        padding: 0.5rem 0.75rem;
        font-family: "Satoshi", sans-serif;
        font-size: 0.9375rem;
        font-weight: 600;
        color: #111827;
        background: #f9fafb;
        border: 1.5px solid #e5e7eb;
        border-radius: 0.75rem;
        outline: none;
        transition: border-color 0.15s ease;
        -moz-appearance: textfield;
      }

      .log-input::-webkit-outer-spin-button,
      .log-input::-webkit-inner-spin-button {
        -webkit-appearance: none;
      }

      .log-input:focus {
        border-color: #7c4dff;
        background: white;
      }

      :host-context([data-theme="dark"]) .log-input {
        background: #374151;
        border-color: #4b5563;
        color: #f9fafb;
      }

      .log-submit {
        flex-shrink: 0;
        padding: 0.5rem 1rem;
        color: white;
        font-family: "Satoshi", sans-serif;
        font-weight: 700;
        font-size: 0.875rem;
        border: none;
        border-radius: 0.75rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.375rem;
        transition: opacity 0.15s ease;
        min-width: 4rem;
      }

      .log-submit:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .mini-spinner {
        display: inline-block;
        width: 0.875rem;
        height: 0.875rem;
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
      }

      /* ── Reduced motion ──────────────────────────────────────────────── */
      @media (prefers-reduced-motion: reduce) {
        .new-goal-btn,
        .goal-card,
        .progress-fill,
        .log-form,
        .empty-mascot,
        .loading-ring,
        .mini-spinner {
          animation: none;
          transition: none;
        }
      }
    `,
  ],
})
export class GoalsPageComponent {
  readonly goalsService = inject(GoalsService);
  readonly rewardsService = inject(RewardsService);

  readonly showWizard = signal(false);
  readonly showLogForm = signal<string | null>(null);
  readonly logValue = signal(0);

  readonly typeInfo = GOAL_TYPE_INFO;
  readonly freqInfo = GOAL_FREQ_INFO;

  // ── Computed ──────────────────────────────────────────────────────────────

  readonly completedTodayCount = computed(
    () =>
      this.goalsService.activeGoals().filter((g) => this.isGoalComplete(g))
        .length,
  );

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  constructor() {
    afterNextRender(() => {
      this.goalsService.loadGoals();
    });
  }

  // ── Goal helpers ──────────────────────────────────────────────────────────

  /**
   * Returns the most recent logged value for a goal (from its progress array if present).
   * Falls back to 0 when no progress has been recorded yet.
   */
  currentValue(goal: Goal): number {
    const progress = (goal as Goal & { progress?: { value: number }[] })
      .progress;
    if (!progress?.length) return 0;
    return progress[0].value;
  }

  progressPct(goal: Goal): number {
    return this.goalsService.progressPct(goal, this.currentValue(goal));
  }

  isGoalComplete(goal: Goal): boolean {
    return this.progressPct(goal) >= 100;
  }

  typeColor(type: string): string {
    const colors: Record<string, string> = {
      STEPS: "#6366f1",
      HYDRATION: "#0ea5e9",
      CALORIES_IN: "#f97316",
      CALORIES_OUT: "#ef4444",
      SLEEP: "#8b5cf6",
      ACTIVITY_MINUTES: "#10b981",
      WEIGHT: "#64748b",
      CUSTOM: "#7c4dff",
    };
    return colors[type] ?? "#7c4dff";
  }

  progressGradient(type: string): string {
    const color = this.typeColor(type);
    // Darken slightly for end stop
    return `linear-gradient(90deg, ${color}cc, ${color})`;
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  toggleLogForm(goalId: string): void {
    if (this.showLogForm() === goalId) {
      this.showLogForm.set(null);
    } else {
      this.showLogForm.set(goalId);
      this.logValue.set(0);
    }
  }

  async submitProgress(goal: Goal): Promise<void> {
    const value = this.logValue();
    if (value <= 0) return;

    const result = await this.goalsService.logProgress(goal.id, value);

    if (result) {
      // Update in-memory progress on the goal object for immediate UI feedback
      const goals = this.goalsService.goals();
      const idx = goals.findIndex((g) => g.id === goal.id);
      if (idx !== -1) {
        //TODO
        // const updated = {
        //   ...goals[idx],
        //   progress: [
        //     result,
        //     ...((goals[idx] as Goal & { progress?: unknown[] }).progress ?? []),
        //   ],
        // };
        // Re-trigger reactivity via service (the signal will reflect on next load)
        await this.goalsService.loadGoals();
      }

      // Award carrots for logging progress
      const pct = this.goalsService.progressPct(goal, value);
      if (pct >= 100) {
        this.rewardsService.awardCarrots(
          10,
          `Goal achieved: ${goal.title} 🎉`,
          "milestone",
        );
      } else {
        this.rewardsService.awardCarrots(
          2,
          `Progress logged: ${goal.title}`,
          "logging",
        );
      }

      this.showLogForm.set(null);
      this.logValue.set(0);
    }
  }

  async deleteGoal(id: string): Promise<void> {
    await this.goalsService.deleteGoal(id);
  }

  onGoalCreated(): void {
    // Wizard already added to service state; just close after a beat
    //TODO
    setTimeout(() => this.showWizard.set(false), 1800);
  }
}
