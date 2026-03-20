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

  // Expose as readonly
  readonly hydrationToday = this._hydrationToday.asReadonly();
  readonly hydrationLoading = this._hydrationLoading.asReadonly();
  readonly vitalsToday = this._vitalsToday.asReadonly();
  readonly vitalsLoading = this._vitalsLoading.asReadonly();

  // Computed values
  readonly hydrationPercentage = computed(() => this._hydrationToday()?.percentage ?? 0);
  readonly hydrationTotal = computed(() => this._hydrationToday()?.totalMl ?? 0);
  readonly hydrationGoal = computed(() => this._hydrationToday()?.goalMl ?? 2500);
  readonly glassesCount = computed(() => this._hydrationToday()?.glassesCount ?? 0);

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
}
