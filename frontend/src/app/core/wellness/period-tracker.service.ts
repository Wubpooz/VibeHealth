import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  type PeriodLog,
  type PeriodLogsListResponse,
  type CycleInsights,
  type CycleInsightsResponse,
  type ContraceptivePillReminder,
  type ContraceptivePillReminderResponse,
  type PeriodLogCreatePayload,
  type PeriodLogUpdatePayload,
} from './period-tracker.types';

@Injectable({ providedIn: 'root' })
export class PeriodTrackerService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/wellness/period`;

  // Period logs state
  private readonly _periodLogs = signal<PeriodLog[]>([]);
  private readonly _periodLogsLoading = signal(false);
  private readonly _periodLogsError = signal<string | null>(null);
  private readonly _periodLogsPagination = signal({ limit: 12, offset: 0, total: 0, hasMore: false });

  // Cycle insights state
  private readonly _cycleInsights = signal<CycleInsights | null>(null);
  private readonly _cycleInsightsLoading = signal(false);
  private readonly _cycleInsightsError = signal<string | null>(null);

  // Pill reminder state
  private readonly _pillReminder = signal<ContraceptivePillReminder | null>(null);
  private readonly _pillReminderLoading = signal(false);
  private readonly _pillReminderError = signal<string | null>(null);

  // Expose as readonly
  readonly periodLogs = this._periodLogs.asReadonly();
  readonly periodLogsLoading = this._periodLogsLoading.asReadonly();
  readonly periodLogsError = this._periodLogsError.asReadonly();
  readonly periodLogsPagination = this._periodLogsPagination.asReadonly();

  readonly cycleInsights = this._cycleInsights.asReadonly();
  readonly cycleInsightsLoading = this._cycleInsightsLoading.asReadonly();
  readonly cycleInsightsError = this._cycleInsightsError.asReadonly();

  readonly pillReminder = this._pillReminder.asReadonly();
  readonly pillReminderLoading = this._pillReminderLoading.asReadonly();
  readonly pillReminderError = this._pillReminderError.asReadonly();

  // Computed
  readonly periodLogCount = computed(() => this._periodLogs().length);
  readonly hasPeriodData = computed(() => this._periodLogs().length > 0);
  readonly hasNextPeriodPrediction = computed(() => this._cycleInsights()?.predictedNextPeriodStart !== null);

  /**
   * Fetch recent period logs (paginated)
   */
  async fetchPeriodLogs(limit = 12, offset = 0): Promise<void> {
    this._periodLogsLoading.set(true);
    this._periodLogsError.set(null);

    try {
      const response = await firstValueFrom(
        this.http.get<PeriodLogsListResponse>(`${this.apiUrl}/logs`, {
          params: { limit: limit.toString(), offset: offset.toString() },
        }),
      );

      if (response.success) {
        this._periodLogs.set(response.data);
        this._periodLogsPagination.set(response.pagination);
      } else {
        this._periodLogsError.set('WELLNESS.period.error.fetchLogs');
      }
    } catch (error) {
      console.error('[PeriodTracker] Fetch period logs failed:', error);
      this._periodLogsError.set('WELLNESS.period.error.loadLogs');
    } finally {
      this._periodLogsLoading.set(false);
    }
  }

  /**
   * Create or update a period log entry
   */
  async savePeriodLog(payload: PeriodLogCreatePayload): Promise<PeriodLog | null> {
    this._periodLogsLoading.set(true);
    this._periodLogsError.set(null);

    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; data: PeriodLog; message: string }>(`${this.apiUrl}/log`, payload),
      );

      if (response.success) {
        // Check if this is an update or create
        const startDate = payload.startDate;
        const existingIndex = this._periodLogs().findIndex((log) => log.startDate === startDate);

        if (existingIndex >= 0) {
          // Update existing
          const updated = [...this._periodLogs()];
          updated[existingIndex] = response.data;
          this._periodLogs.set(updated);
        } else {
          // Add new (at beginning since sorted desc)
          this._periodLogs.update((logs) => [response.data, ...logs]);
        }

        // Refresh predictions
        await this.fetchCycleInsights();

        return response.data;
      } else {
        this._periodLogsError.set('WELLNESS.period.error.saveLog');
        return null;
      }
    } catch (error) {
      console.error('[PeriodTracker] Save period log failed:', error);
      this._periodLogsError.set('WELLNESS.period.error.saveLog');
      return null;
    } finally {
      this._periodLogsLoading.set(false);
    }
  }

  /**
   * Get a specific period log
   */
  async fetchPeriodLog(id: string): Promise<PeriodLog | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ success: boolean; data: PeriodLog }>(`${this.apiUrl}/${id}`),
      );

      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('[PeriodTracker] Fetch period log failed:', error);
      return null;
    }
  }

  /**
   * Update a specific period log
   */
  async updatePeriodLog(id: string, payload: PeriodLogUpdatePayload): Promise<PeriodLog | null> {
    this._periodLogsLoading.set(true);
    this._periodLogsError.set(null);

    try {
      const response = await firstValueFrom(
        this.http.patch<{ success: boolean; data: PeriodLog; message: string }>(`${this.apiUrl}/${id}`, payload),
      );

      if (response.success) {
        // Update in local list
        const index = this._periodLogs().findIndex((log) => log.id === id);
        if (index >= 0) {
          const updated = [...this._periodLogs()];
          updated[index] = response.data;
          this._periodLogs.set(updated);
        }

        // Refresh predictions
        await this.fetchCycleInsights();

        return response.data;
      } else {
        this._periodLogsError.set('WELLNESS.period.error.updateLog');
        return null;
      }
    } catch (error) {
      console.error('[PeriodTracker] Update period log failed:', error);
      this._periodLogsError.set('WELLNESS.period.error.updateLog');
      return null;
    } finally {
      this._periodLogsLoading.set(false);
    }
  }

  /**
   * Delete a period log
   */
  async deletePeriodLog(id: string): Promise<boolean> {
    this._periodLogsLoading.set(true);
    this._periodLogsError.set(null);

    try {
      const response = await firstValueFrom(
        this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`),
      );

      if (response.success) {
        this._periodLogs.update((logs) => logs.filter((log) => log.id !== id));
        // Refresh predictions
        await this.fetchCycleInsights();
        return true;
      } else {
        this._periodLogsError.set('WELLNESS.period.error.deleteLog');
        return false;
      }
    } catch (error) {
      console.error('[PeriodTracker] Delete period log failed:', error);
      this._periodLogsError.set('WELLNESS.period.error.deleteLog');
      return false;
    } finally {
      this._periodLogsLoading.set(false);
    }
  }

  /**
   * Fetch cycle predictions and insights
   */
  async fetchCycleInsights(): Promise<void> {
    this._cycleInsightsLoading.set(true);
    this._cycleInsightsError.set(null);

    try {
      const response = await firstValueFrom(
        this.http.get<CycleInsightsResponse>(`${this.apiUrl}/prediction/next`),
      );

      if (response.success) {
        this._cycleInsights.set(response.data);
      } else {
        this._cycleInsightsError.set('Failed to fetch cycle predictions');
      }
    } catch (error) {
      console.error('[PeriodTracker] Fetch cycle insights failed:', error);
      this._cycleInsightsError.set('Error loading predictions');
    } finally {
      this._cycleInsightsLoading.set(false);
    }
  }

  /**
   * Save pill reminder settings
   */
  async savePillReminder(payload: ContraceptivePillReminder): Promise<ContraceptivePillReminder | null> {
    this._pillReminderLoading.set(true);
    this._pillReminderError.set(null);

    try {
      const response = await firstValueFrom(
        this.http.post<ContraceptivePillReminderResponse>(`${this.apiUrl}/reminder/pill`, payload),
      );

      if (response.success) {
        this._pillReminder.set(response.data);
        return response.data;
      } else {
        this._pillReminderError.set('Failed to save pill reminder');
        return null;
      }
    } catch (error) {
      console.error('[PeriodTracker] Save pill reminder failed:', error);
      this._pillReminderError.set('Error saving pill reminder');
      return null;
    } finally {
      this._pillReminderLoading.set(false);
    }
  }

  /**
   * Fetch pill reminder settings
   */
  async fetchPillReminder(): Promise<void> {
    this._pillReminderLoading.set(true);
    this._pillReminderError.set(null);

    try {
      const response = await firstValueFrom(
        this.http.get<ContraceptivePillReminderResponse>(`${this.apiUrl}/reminder/pill`),
      );

      if (response.success) {
        this._pillReminder.set(response.data);
      } else {
        this._pillReminderError.set('Failed to fetch pill reminder settings');
      }
    } catch (error) {
      console.error('[PeriodTracker] Fetch pill reminder failed:', error);
      this._pillReminderError.set('Error loading pill reminder settings');
    } finally {
      this._pillReminderLoading.set(false);
    }
  }

  /**
   * Delete pill reminder settings
   */
  async deletePillReminder(): Promise<boolean> {
    this._pillReminderLoading.set(true);
    this._pillReminderError.set(null);

    try {
      const response = await firstValueFrom(
        this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/reminder/pill`),
      );

      if (response.success) {
        this._pillReminder.set(null);
        return true;
      } else {
        this._pillReminderError.set('Failed to delete pill reminder');
        return false;
      }
    } catch (error) {
      console.error('[PeriodTracker] Delete pill reminder failed:', error);
      this._pillReminderError.set('Error deleting pill reminder');
      return false;
    } finally {
      this._pillReminderLoading.set(false);
    }
  }
}
