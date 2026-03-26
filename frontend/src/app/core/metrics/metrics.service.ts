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
  ActivityCatalogEntry,
  MealCatalogEntry,
  ActivityLog,
  ActivitySummary,
  WeeklyActivitySummary,
  ActivityType,
  Intensity,
  MealLog,
  NutritionSummary,
  WeeklyNutritionSummary,
  MealType,
  WorkoutSuggestions,
  WorkoutPlan,
  WorkoutSetLogResult,
  HealthSyncConnection,
  HealthSyncProvider,
  HealthSyncOAuthStartResponse,
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
  private readonly _activityCatalog = signal<ActivityCatalogEntry[]>([]);
  private readonly _mealCatalog = signal<MealCatalogEntry[]>([]);
  private readonly _workoutSuggestions = signal<WorkoutSuggestions | null>(null);
  private readonly _workoutPlans = signal<WorkoutPlan[]>([]);
  private readonly _workoutSuggestionsLoading = signal(false);
  private readonly _workoutPlansLoading = signal(false);
  private readonly _syncConnections = signal<HealthSyncConnection[]>([]);
  private readonly _syncLoading = signal(false);

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
  readonly activityCatalog = this._activityCatalog.asReadonly();
  readonly mealCatalog = this._mealCatalog.asReadonly();
  readonly workoutSuggestions = this._workoutSuggestions.asReadonly();
  readonly workoutPlans = this._workoutPlans.asReadonly();
  readonly workoutSuggestionsLoading = this._workoutSuggestionsLoading.asReadonly();
  readonly workoutPlansLoading = this._workoutPlansLoading.asReadonly();
  readonly workoutLoading = computed(
    () => this._workoutSuggestionsLoading() || this._workoutPlansLoading(),
  );
  readonly syncConnections = this._syncConnections.asReadonly();
  readonly syncLoading = this._syncLoading.asReadonly();
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

  readonly activityCatalogByKey = computed(() => {
    const map = new Map<string, ActivityCatalogEntry>();
    for (const activity of this._activityCatalog()) {
      map.set(activity.key, activity);
    }
    return map;
  });

  readonly mealCatalogByKey = computed(() => {
    const map = new Map<string, MealCatalogEntry>();
    for (const meal of this._mealCatalog()) {
      map.set(meal.key, meal);
    }
    return map;
  });

  // Computed values - Nutrition
  readonly caloriesToday = computed(() => this._nutritionToday()?.totalCalories ?? 0);
  readonly proteinToday = computed(() => this._nutritionToday()?.totalProtein ?? 0);
  readonly carbsToday = computed(() => this._nutritionToday()?.totalCarbs ?? 0);
  readonly fatToday = computed(() => this._nutritionToday()?.totalFat ?? 0);
  readonly hasWorkoutPlan = computed(() => this._workoutPlans().length > 0);

  // =============================================================================
  // Hydration Methods
  // =============================================================================

  async loadActivityCatalog(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<ActivityCatalogEntry[]>(`${environment.apiUrl}/api/v1/references/activities`, {
          withCredentials: true,
        })
      );
      this._activityCatalog.set(response);
    } catch (error) {
      console.error('Failed to load activity catalog:', error);
      this._activityCatalog.set([]);
    }
  }

  async loadMealCatalog(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<MealCatalogEntry[]>(`${environment.apiUrl}/api/v1/references/meals`, {
          withCredentials: true,
        })
      );
      this._mealCatalog.set(response);
    } catch (error) {
      console.error('Failed to load meal catalog:', error);
      this._mealCatalog.set([]);
    }
  }

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
    activityCatalogId?: string;
    activityCatalogKey?: string;
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
    mealCatalogId?: string;
    mealCatalogKey?: string;
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
      this.loadActivityCatalog(),
      this.loadMealCatalog(),
      this.loadNutritionToday(),
    ]);
  }

  // =============================================================================
  // Workouts Methods
  // =============================================================================

  async loadWorkoutSuggestions(): Promise<void> {
    this._workoutSuggestionsLoading.set(true);
    try {
      const response = await firstValueFrom(
        this.http.get<{ suggestions: WorkoutSuggestions }>(`${this.apiUrl}/workouts/suggestions`, {
          withCredentials: true,
        })
      );
      this._workoutSuggestions.set(response.suggestions);
    } catch (error) {
      console.error('Failed to load workout suggestions:', error);
      this._workoutSuggestions.set(null);
    } finally {
      this._workoutSuggestionsLoading.set(false);
    }
  }

  async loadWorkoutPlans(): Promise<void> {
    this._workoutPlansLoading.set(true);
    try {
      const response = await firstValueFrom(
        this.http.get<{ plans: WorkoutPlan[] }>(`${this.apiUrl}/workout-plans`, {
          withCredentials: true,
        })
      );
      this._workoutPlans.set(response.plans ?? []);
    } catch (error) {
      console.error('Failed to load workout plans:', error);
      this._workoutPlans.set([]);
    } finally {
      this._workoutPlansLoading.set(false);
    }
  }

  async createWorkoutPlan(name: string, description?: string): Promise<WorkoutPlan | null> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; plan: WorkoutPlan }>(
          `${this.apiUrl}/workout-plans`,
          { name, description },
          { withCredentials: true }
        )
      );
      await this.loadWorkoutPlans();
      return response.plan;
    } catch (error) {
      console.error('Failed to create workout plan:', error);
      return null;
    }
  }

  async logWorkoutSet(workoutPlanExerciseId: string, repsCompleted: number): Promise<WorkoutSetLogResult | null> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; log: WorkoutSetLogResult }>(
          `${this.apiUrl}/workout-logs`,
          { workoutPlanExerciseId, repsCompleted },
          { withCredentials: true }
        )
      );
      return response.log;
    } catch (error) {
      console.error('Failed to log workout set:', error);
      return null;
    }
  }

  // =============================================================================
  // Health Sync Methods
  // =============================================================================

  async loadSyncConnections(): Promise<void> {
    this._syncLoading.set(true);
    try {
      const response = await firstValueFrom(
        this.http.get<{ connections: HealthSyncConnection[] }>(`${this.apiUrl}/sync/connections`, {
          withCredentials: true,
        })
      );
      this._syncConnections.set(response.connections ?? []);
    } catch (error) {
      console.error('Failed to load sync connections:', error);
      this._syncConnections.set([]);
    } finally {
      this._syncLoading.set(false);
    }
  }

  async connectSyncProvider(provider: HealthSyncProvider): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.post(
          `${this.apiUrl}/sync/connect`,
          { provider },
          { withCredentials: true }
        )
      );
      await this.loadSyncConnections();
      return true;
    } catch (error) {
      console.error('Failed to connect sync provider:', error);
      return false;
    }
  }

  async setSyncAuto(provider: HealthSyncProvider, autoSync: boolean): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.patch(
          `${this.apiUrl}/sync/${provider}/auto`,
          { autoSync },
          { withCredentials: true }
        )
      );
      await this.loadSyncConnections();
      return true;
    } catch (error) {
      console.error('Failed to update auto sync setting:', error);
      return false;
    }
  }

  async runSyncPull(provider: HealthSyncProvider): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.post(
          `${this.apiUrl}/sync/${provider}/pull`,
          {},
          { withCredentials: true }
        )
      );
      await this.loadSyncConnections();
      return true;
    } catch (error) {
      console.error('Failed to run pull sync:', error);
      return false;
    }
  }

  async startSyncOAuth(provider: HealthSyncProvider): Promise<HealthSyncOAuthStartResponse | null> {
    try {
      const response = await firstValueFrom(
        this.http.post<HealthSyncOAuthStartResponse>(
          `${this.apiUrl}/sync/oauth/start`,
          { provider },
          { withCredentials: true }
        )
      );
      return response;
    } catch (error) {
      console.error('Failed to start sync OAuth flow:', error);
      return null;
    }
  }

  async completeSyncOAuth(state: string, code: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.post(
          `${this.apiUrl}/sync/oauth/callback`,
          { state, code },
          { withCredentials: true }
        )
      );
      await this.loadSyncConnections();
      return true;
    } catch (error) {
      console.error('Failed to complete sync OAuth flow:', error);
      return false;
    }
  }
}
