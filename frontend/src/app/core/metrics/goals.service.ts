import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

// ─── Types ───────────────────────────────────────────────────────────────────

export type GoalType =
  | 'STEPS'
  | 'HYDRATION'
  | 'CALORIES_IN'
  | 'CALORIES_OUT'
  | 'SLEEP'
  | 'ACTIVITY_MINUTES'
  | 'WEIGHT'
  | 'CUSTOM';

export type GoalFreq = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface Goal {
  id: string;
  userId: string;
  type: GoalType;
  title: string;
  description?: string;
  targetValue: number;
  targetUnit: string;
  frequency: GoalFreq;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  progress?: GoalProgress[];
}

export interface GoalProgress {
  id: string;
  goalId: string;
  date: string;
  value: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoalWithProgress extends Goal {
  currentValue: number;
  progressPercentage: number;
  isCompleted: boolean;
}

export interface CreateGoalDto {
  type: GoalType;
  title: string;
  description?: string;
  targetValue: number;
  targetUnit: string;
  frequency: GoalFreq;
  startDate?: string;
  endDate?: string;
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export const GOAL_TYPE_INFO: Record<
  GoalType,
  { label: string; emoji: string; defaultUnit: string; defaultTarget: number; hint: string }
> = {
  STEPS: {
    label: 'Daily Steps',
    emoji: '👟',
    defaultUnit: 'steps',
    defaultTarget: 10000,
    hint: 'e.g. 10 000 steps per day',
  },
  HYDRATION: {
    label: 'Water Intake',
    emoji: '💧',
    defaultUnit: 'ml',
    defaultTarget: 2500,
    hint: 'e.g. 2 500 ml per day',
  },
  CALORIES_IN: {
    label: 'Calorie Intake',
    emoji: '🍽️',
    defaultUnit: 'kcal',
    defaultTarget: 2000,
    hint: 'e.g. 2 000 kcal per day',
  },
  CALORIES_OUT: {
    label: 'Calories Burned',
    emoji: '🔥',
    defaultUnit: 'kcal',
    defaultTarget: 500,
    hint: 'e.g. 500 kcal burned per day',
  },
  SLEEP: {
    label: 'Sleep Duration',
    emoji: '😴',
    defaultUnit: 'hours',
    defaultTarget: 8,
    hint: 'e.g. 8 hours per night',
  },
  ACTIVITY_MINUTES: {
    label: 'Active Minutes',
    emoji: '⚡',
    defaultUnit: 'minutes',
    defaultTarget: 30,
    hint: 'e.g. 30 minutes per day',
  },
  WEIGHT: {
    label: 'Target Weight',
    emoji: '⚖️',
    defaultUnit: 'kg',
    defaultTarget: 70,
    hint: 'e.g. 70 kg',
  },
  CUSTOM: {
    label: 'Custom Goal',
    emoji: '🎯',
    defaultUnit: 'times',
    defaultTarget: 1,
    hint: 'Define your own goal',
  },
};

export const GOAL_FREQ_INFO: Record<GoalFreq, { label: string; emoji: string }> = {
  DAILY: { label: 'Daily', emoji: '📅' },
  WEEKLY: { label: 'Weekly', emoji: '📆' },
  MONTHLY: { label: 'Monthly', emoji: '🗓️' },
};

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class GoalsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/metrics/goals`;

  // ── State ──────────────────────────────────────────────────────────────────
  private readonly _goals = signal<Goal[]>([]);
  private readonly _loading = signal(false);
  private readonly _saving = signal(false);
  private readonly _error = signal<string | null>(null);

  // ── Public readonly ────────────────────────────────────────────────────────
  readonly goals = this._goals.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly error = this._error.asReadonly();

  // ── Computed ───────────────────────────────────────────────────────────────

  readonly activeGoals = computed(() => this._goals().filter((g) => g.isActive));

  readonly completedGoals = computed(() => this._goals().filter((g) => !g.isActive));

  readonly goalsByType = computed(() => {
    const map = new Map<GoalType, Goal[]>();
    for (const goal of this._goals()) {
      const existing = map.get(goal.type) ?? [];
      map.set(goal.type, [...existing, goal]);
    }
    return map;
  });

  readonly hasGoals = computed(() => this._goals().length > 0);

  // ── CRUD ───────────────────────────────────────────────────────────────────

  async loadGoals(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const response = await firstValueFrom(
        this.http.get<{ goals: Goal[] }>(this.apiUrl, { withCredentials: true })
      );
      this._goals.set(response.goals ?? []);
    } catch (err) {
      console.error('[GoalsService] loadGoals failed:', err);
      this._error.set('Failed to load goals');
    } finally {
      this._loading.set(false);
    }
  }

  async createGoal(dto: CreateGoalDto): Promise<Goal | null> {
    this._saving.set(true);
    this._error.set(null);
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; goal: Goal }>(this.apiUrl, dto, {
          withCredentials: true,
        })
      );
      if (response.success && response.goal) {
        this._goals.update((prev) => [response.goal, ...prev]);
        return response.goal;
      }
      return null;
    } catch (err) {
      console.error('[GoalsService] createGoal failed:', err);
      this._error.set('Failed to create goal');
      return null;
    } finally {
      this._saving.set(false);
    }
  }

  async updateGoal(id: string, updates: Partial<CreateGoalDto>): Promise<Goal | null> {
    this._saving.set(true);
    this._error.set(null);
    try {
      const response = await firstValueFrom(
        this.http.patch<{ success: boolean; goal: Goal }>(`${this.apiUrl}/${id}`, updates, {
          withCredentials: true,
        })
      );
      if (response.success && response.goal) {
        this._goals.update((prev) =>
          prev.map((g) => (g.id === id ? response.goal : g))
        );
        return response.goal;
      }
      return null;
    } catch (err) {
      console.error('[GoalsService] updateGoal failed:', err);
      this._error.set('Failed to update goal');
      return null;
    } finally {
      this._saving.set(false);
    }
  }

  async deleteGoal(id: string): Promise<boolean> {
    this._saving.set(true);
    this._error.set(null);
    try {
      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true })
      );
      this._goals.update((prev) => prev.filter((g) => g.id !== id));
      return true;
    } catch (err) {
      console.error('[GoalsService] deleteGoal failed:', err);
      this._error.set('Failed to delete goal');
      return false;
    } finally {
      this._saving.set(false);
    }
  }

  async logProgress(goalId: string, value: number, notes?: string): Promise<GoalProgress | null> {
    this._saving.set(true);
    this._error.set(null);
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; progress: GoalProgress }>(
          `${this.apiUrl}/${goalId}/progress`,
          { value, notes },
          { withCredentials: true }
        )
      );
      return response.success ? response.progress : null;
    } catch (err) {
      console.error('[GoalsService] logProgress failed:', err);
      this._error.set('Failed to log progress');
      return null;
    } finally {
      this._saving.set(false);
    }
  }

  async getGoalWithProgress(goalId: string): Promise<GoalWithProgress | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ goal: GoalWithProgress }>(`${this.apiUrl}/${goalId}`, {
          withCredentials: true,
        })
      );
      return response.goal ?? null;
    } catch (err) {
      console.error('[GoalsService] getGoalWithProgress failed:', err);
      return null;
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Returns a human-readable progress description for a goal.
   */
  describeProgress(goal: Goal, currentValue: number): string {
    const pct = Math.min(Math.round((currentValue / goal.targetValue) * 100), 100);
    return `${currentValue} / ${goal.targetValue} ${goal.targetUnit} (${pct}%)`;
  }

  /**
   * Returns the progress percentage clamped to [0, 100].
   */
  progressPct(goal: Goal, currentValue: number): number {
    if (goal.targetValue <= 0) return 0;
    return Math.min(Math.round((currentValue / goal.targetValue) * 100), 100);
  }
}
