import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  HydrationLog,
  HydrationSummary,
  HydrationPreset,
  VitalLog,
  VitalsSummary,
  VitalType,
  ActivityLog,
  ActivitySummary,
  WeeklyActivitySummary,
  ActivityType,
  Intensity,
  MealLog,
  NutritionSummary,
  WeeklyNutritionSummary,
  MealType,
} from './metrics.types';

@Injectable({ providedIn: 'root' })
export class MetricsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/metrics`;

  // Hydration state
  private readonly _hydrationToday = signal<HydrationSummary | null>(null);
  private readonly _hydrationLoading = signal(false);

  // Vitals state
  private readonly _vitalsToday = signal<VitalsSummary | null>(null);
  private readonly _vitalsLoading = signal(false);

  // Activity state
  private readonly _activityToday = signal<ActivitySummary | null>(null);
  private readonly _activityWeek = signal<WeeklyActivitySummary | null>(null);
  private readonly _activityLoading = signal(false);

  // Nutrition state
  private readonly _nutritionToday = signal<NutritionSummary | null>(null);
  private readonly _nutritionWeek = signal<WeeklyNutritionSummary | null>(null);
  private readonly _nutritionLoading = signal(false);

  // Expose as readonly
  readonly hydrationToday = this._hydrationToday.asReadonly();
  readonly hydrationLoading = this._hydrationLoading.asReadonly();
  readonly vitalsToday = this._vitalsToday.asReadonly();
  readonly vitalsLoading = this._vitalsLoading.asReadonly();
  readonly activityToday = this._activityToday.asReadonly();
  readonly activityWeek = this._activityWeek.asReadonly();
  readonly activityLoading = this._activityLoading.asReadonly();
  readonly nutritionToday = this._nutritionToday.asReadonly();
  readonly nutritionWeek = this._nutritionWeek.asReadonly();
  readonly nutritionLoading = this._nutritionLoading.asReadonly();

  // Computed values - Hydration
  readonly hydrationPercentage = computed(() => this._hydrationToday()?.percentage ?? 0);
  readonly hydrationTotal = computed(() => this._hydrationToday()?.totalMl ?? 0);
  readonly hydrationGoal = computed(() => this._hydrationToday()?.goalMl ?? 2500);
  readonly glassesCount = computed(() => this._hydrationToday()?.glassesCount ?? 0);

  // Computed values - Activity
  readonly activityMinutesToday = computed(() => this._activityToday()?.totalMinutes ?? 0);
  readonly activityCaloriesToday = computed(() => this._activityToday()?.totalCalories ?? 0);
  readonly activeDaysThisWeek = computed(() => this._activityWeek()?.activeDays ?? 0);

  // Computed values - Nutrition
  readonly caloriesToday = computed(() => this._nutritionToday()?.totalCalories ?? 0);
  readonly proteinToday = computed(() => this._nutritionToday()?.totalProtein ?? 0);
  readonly carbsToday = computed(() => this._nutritionToday()?.totalCarbs ?? 0);
  readonly fatToday = computed(() => this._nutritionToday()?.totalFat ?? 0);

  // =============================================================================
  // Hydration Methods
  // =============================================================================

  async loadHydrationToday(): Promise<void> {
    this._hydrationLoading.set(true);
    try {
      const response = await firstValueFrom(
        this.http.get<HydrationSummary>(`${this.apiUrl}/hydration/today`, {
          withCredentials: true,
        })
      );
      this._hydrationToday.set(response);
    } catch (error) {
      console.error('Failed to load hydration:', error);
      // Set default values on error
      this._hydrationToday.set({
        totalMl: 0,
        goalMl: 2500,
        percentage: 0,
        glassesCount: 0,
        logs: [],
      });
    } finally {
      this._hydrationLoading.set(false);
    }
  }

  async quickLogHydration(preset: HydrationPreset): Promise<{ success: boolean; carrots?: number }> {
    try {
      const response = await firstValueFrom(
        this.http.post<{
          success: boolean;
          log: HydrationLog;
          today: HydrationSummary;
        }>(`${this.apiUrl}/hydration/quick`, { preset }, { withCredentials: true })
      );

      if (response.success && response.today) {
        this._hydrationToday.set(response.today);
      }

      // Award carrots: +1 per drink, bonus +5 if goal reached
      const carrots = response.today?.percentage >= 100 && this.hydrationPercentage() < 100 ? 6 : 1;
      return { success: true, carrots };
    } catch (error) {
      console.error('Failed to log hydration:', error);
      return { success: false };
    }
  }

  async logHydration(amount: number, unit: 'ml' | 'oz' = 'ml'): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.post<{ success: boolean; log: HydrationLog }>(
          `${this.apiUrl}/hydration`,
          { amount, unit },
          { withCredentials: true }
        )
      );
      await this.loadHydrationToday();
      return true;
    } catch (error) {
      console.error('Failed to log hydration:', error);
      return false;
    }
  }

  // =============================================================================
  // Vitals Methods
  // =============================================================================

  async loadVitalsToday(): Promise<void> {
    this._vitalsLoading.set(true);
    try {
      const response = await firstValueFrom(
        this.http.get<VitalsSummary>(`${this.apiUrl}/vitals/today`, {
          withCredentials: true,
        })
      );
      this._vitalsToday.set(response);
    } catch (error) {
      console.error('Failed to load vitals:', error);
      this._vitalsToday.set({ summary: {} as VitalsSummary['summary'], logs: [] });
    } finally {
      this._vitalsLoading.set(false);
    }
  }

  async logVital(type: VitalType, value: number, unit: string, notes?: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.post<{ success: boolean; log: VitalLog }>(
          `${this.apiUrl}/vitals`,
          { type, value, unit, notes },
          { withCredentials: true }
        )
      );
      await this.loadVitalsToday();
      return true;
    } catch (error) {
      console.error('Failed to log vital:', error);
      return false;
    }
  }

  async getVitals(options?: {
    startDate?: string;
    endDate?: string;
    type?: VitalType;
  }): Promise<VitalLog[]> {
    try {
      const params = new URLSearchParams();
      if (options?.startDate) params.set('startDate', options.startDate);
      if (options?.endDate) params.set('endDate', options.endDate);
      if (options?.type) params.set('type', options.type);

      const response = await firstValueFrom(
        this.http.get<{ logs: VitalLog[] }>(
          `${this.apiUrl}/vitals?${params.toString()}`,
          { withCredentials: true }
        )
      );
      return response.logs;
    } catch (error) {
      console.error('Failed to get vitals:', error);
      return [];
    }
  }

  // =============================================================================
  // Activity Methods
  // =============================================================================

  async loadActivityToday(): Promise<void> {
    this._activityLoading.set(true);
    try {
      const response = await firstValueFrom(
        this.http.get<ActivitySummary>(`${this.apiUrl}/activities/today`, {
          withCredentials: true,
        })
      );
      this._activityToday.set(response);
    } catch (error) {
      console.error('Failed to load activity:', error);
      this._activityToday.set({
        totalMinutes: 0,
        totalCalories: 0,
        totalDistance: 0,
        activitiesCount: 0,
        byType: {},
        logs: [],
      });
    } finally {
      this._activityLoading.set(false);
    }
  }

  async loadActivityWeek(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<WeeklyActivitySummary>(`${this.apiUrl}/activities/week`, {
          withCredentials: true,
        })
      );
      this._activityWeek.set(response);
    } catch (error) {
      console.error('Failed to load weekly activity:', error);
    }
  }

  async logActivity(data: {
    type: ActivityType;
    name: string;
    duration: number;
    calories?: number;
    distance?: number;
    intensity?: Intensity;
    heartRateAvg?: number;
    notes?: string;
  }): Promise<{ success: boolean; carrots?: number }> {
    try {
      await firstValueFrom(
        this.http.post<{ success: boolean; log: ActivityLog }>(
          `${this.apiUrl}/activities`,
          data,
          { withCredentials: true }
        )
      );
      await this.loadActivityToday();
      
      // Award carrots: +1 per 10 minutes, bonus +5 if 30+ minutes
      const carrots = data.duration >= 30 ? Math.floor(data.duration / 10) + 5 : Math.floor(data.duration / 10);
      return { success: true, carrots: Math.max(1, carrots) };
    } catch (error) {
      console.error('Failed to log activity:', error);
      return { success: false };
    }
  }

  async getActivities(options?: {
    startDate?: string;
    endDate?: string;
    type?: ActivityType;
    limit?: number;
  }): Promise<ActivityLog[]> {
    try {
      const params = new URLSearchParams();
      if (options?.startDate) params.set('startDate', options.startDate);
      if (options?.endDate) params.set('endDate', options.endDate);
      if (options?.type) params.set('type', options.type);
      if (options?.limit) params.set('limit', options.limit.toString());

      const response = await firstValueFrom(
        this.http.get<{ logs: ActivityLog[] }>(
          `${this.apiUrl}/activities?${params.toString()}`,
          { withCredentials: true }
        )
      );
      return response.logs;
    } catch (error) {
      console.error('Failed to get activities:', error);
      return [];
    }
  }

  async deleteActivity(id: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/activities/${id}`, { withCredentials: true })
      );
      await this.loadActivityToday();
      return true;
    } catch (error) {
      console.error('Failed to delete activity:', error);
      return false;
    }
  }

  // =============================================================================
  // Nutrition/Meal Methods
  // =============================================================================

  async loadNutritionToday(): Promise<void> {
    this._nutritionLoading.set(true);
    try {
      const response = await firstValueFrom(
        this.http.get<NutritionSummary>(`${this.apiUrl}/meals/today`, {
          withCredentials: true,
        })
      );
      this._nutritionToday.set(response);
    } catch (error) {
      console.error('Failed to load nutrition:', error);
      this._nutritionToday.set({
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalFiber: 0,
        totalSugar: 0,
        mealsCount: 0,
        byMealType: {},
        logs: [],
      });
    } finally {
      this._nutritionLoading.set(false);
    }
  }

  async loadNutritionWeek(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<WeeklyNutritionSummary>(`${this.apiUrl}/meals/week`, {
          withCredentials: true,
        })
      );
      this._nutritionWeek.set(response);
    } catch (error) {
      console.error('Failed to load weekly nutrition:', error);
    }
  }

  async logMeal(data: {
    mealType: MealType;
    name: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    servingSize?: string;
    barcode?: string;
    notes?: string;
    imageUrl?: string;
  }): Promise<{ success: boolean; carrots?: number }> {
    try {
      await firstValueFrom(
        this.http.post<{ success: boolean; log: MealLog }>(
          `${this.apiUrl}/meals`,
          data,
          { withCredentials: true }
        )
      );
      await this.loadNutritionToday();
      
      // Award carrots: +1 per meal logged, +2 bonus if includes macros
      const hasMacros = data.protein || data.carbs || data.fat;
      const carrots = hasMacros ? 3 : 1;
      return { success: true, carrots };
    } catch (error) {
      console.error('Failed to log meal:', error);
      return { success: false };
    }
  }

  async getMeals(options?: {
    startDate?: string;
    endDate?: string;
    mealType?: MealType;
    limit?: number;
  }): Promise<MealLog[]> {
    try {
      const params = new URLSearchParams();
      if (options?.startDate) params.set('startDate', options.startDate);
      if (options?.endDate) params.set('endDate', options.endDate);
      if (options?.mealType) params.set('mealType', options.mealType);
      if (options?.limit) params.set('limit', options.limit.toString());

      const response = await firstValueFrom(
        this.http.get<{ logs: MealLog[] }>(
          `${this.apiUrl}/meals?${params.toString()}`,
          { withCredentials: true }
        )
      );
      return response.logs;
    } catch (error) {
      console.error('Failed to get meals:', error);
      return [];
    }
  }

  async deleteMeal(id: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/meals/${id}`, { withCredentials: true })
      );
      await this.loadNutritionToday();
      return true;
    } catch (error) {
      console.error('Failed to delete meal:', error);
      return false;
    }
  }

  // =============================================================================
  // Load All Today's Data
  // =============================================================================

  async loadAllTodayData(): Promise<void> {
    await Promise.all([
      this.loadHydrationToday(),
      this.loadVitalsToday(),
      this.loadActivityToday(),
      this.loadNutritionToday(),
    ]);
  }
}
