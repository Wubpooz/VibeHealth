import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  type MoodLog,
  type JournalEntry,
  type MoodUpsertPayload,
  type JournalEntryCreatePayload,
  type JournalEntryUpdatePayload,
  type WellnessListResponse,
  type WellnessSingleResponse,
} from './wellness-journal.types';

@Injectable({ providedIn: 'root' })
export class WellnessJournalService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/wellness`;

  // Mood state
  private readonly _moodLogs = signal<MoodLog[]>([]);
  private readonly _moodLoading = signal(false);
  private readonly _moodError = signal<string | null>(null);

  // Journal state
  private readonly _journalEntries = signal<JournalEntry[]>([]);
  private readonly _journalLoading = signal(false);
  private readonly _journalError = signal<string | null>(null);
  private readonly _journalPagination = signal({ limit: 20, offset: 0, total: 0, hasMore: false });

  // Expose as readonly
  readonly moodLogs = this._moodLogs.asReadonly();
  readonly moodLoading = this._moodLoading.asReadonly();
  readonly moodError = this._moodError.asReadonly();

  readonly journalEntries = this._journalEntries.asReadonly();
  readonly journalLoading = this._journalLoading.asReadonly();
  readonly journalError = this._journalError.asReadonly();
  readonly journalPagination = this._journalPagination.asReadonly();

  // Computed
  readonly moodCount = computed(() => this._moodLogs().length);
  readonly journalCount = computed(() => this._journalEntries().length);

  /**
   * Fetch recent mood logs (paginated)
   */
  async fetchMoodLogs(limit = 30, offset = 0): Promise<void> {
    this._moodLoading.set(true);
    this._moodError.set(null);

    try {
      const response = await firstValueFrom(
        this.http.get<WellnessListResponse<MoodLog>>(`${this.apiUrl}/mood`, {
          params: { limit: limit.toString(), offset: offset.toString() },
        }),
      );

      if (response.success) {
        this._moodLogs.set(response.data);
      } else {
        this._moodError.set('Failed to fetch mood logs');
      }
    } catch (error) {
      console.error('[WellnessJournal] Fetch mood logs failed:', error);
      this._moodError.set('Error loading mood logs');
    } finally {
      this._moodLoading.set(false);
    }
  }

  /**
   * Upsert (create or update) a mood log for a specific date
   */
  async upsertMoodLog(payload: MoodUpsertPayload): Promise<MoodLog | null> {
    this._moodLoading.set(true);
    this._moodError.set(null);

    try {
      const response = await firstValueFrom(
        this.http.post<WellnessSingleResponse<MoodLog>>(`${this.apiUrl}/mood`, payload),
      );

      if (response.success) {
        // Update the local list
        const existingDate = new Date(payload.date).toISOString().split('T')[0];
        const existing = this._moodLogs().findIndex(
          (log) => new Date(log.date).toISOString().split('T')[0] === existingDate,
        );
        if (existing >= 0) {
          const updated = [...this._moodLogs()];
          updated[existing] = response.data;
          this._moodLogs.set(updated);
        } else {
          this._moodLogs.update((logs) => [response.data, ...logs]);
        }
        return response.data;
      } else {
        this._moodError.set('Failed to save mood');
        return null;
      }
    } catch (error) {
      console.error('[WellnessJournal] Upsert mood failed:', error);
      this._moodError.set('Error saving mood');
      return null;
    } finally {
      this._moodLoading.set(false);
    }
  }

  /**
   * Fetch journal entries (paginated)
   */
  async fetchJournalEntries(limit = 20, offset = 0): Promise<void> {
    this._journalLoading.set(true);
    this._journalError.set(null);

    try {
      const response = await firstValueFrom(
        this.http.get<WellnessListResponse<JournalEntry>>(`${this.apiUrl}/journal`, {
          params: { limit: limit.toString(), offset: offset.toString() },
        }),
      );

      if (response.success) {
        this._journalEntries.set(response.data);
        this._journalPagination.set(response.pagination);
      } else {
        this._journalError.set('Failed to fetch journal entries');
      }
    } catch (error) {
      console.error('[WellnessJournal] Fetch journal failed:', error);
      this._journalError.set('Error loading journal entries');
    } finally {
      this._journalLoading.set(false);
    }
  }

  /**
   * Get a single journal entry by ID
   */
  async fetchJournalEntry(id: string): Promise<JournalEntry | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<WellnessSingleResponse<JournalEntry>>(`${this.apiUrl}/journal/${id}`),
      );

      return response.success ? response.data : null;
    } catch (error) {
      console.error('[WellnessJournal] Fetch journal entry failed:', error);
      this._journalError.set('Error loading journal entry');
      return null;
    }
  }

  /**
   * Create a new journal entry
   */
  async createJournalEntry(payload: JournalEntryCreatePayload): Promise<JournalEntry | null> {
    this._journalLoading.set(true);
    this._journalError.set(null);

    try {
      const response = await firstValueFrom(
        this.http.post<WellnessSingleResponse<JournalEntry>>(`${this.apiUrl}/journal`, payload),
      );

      if (response.success) {
        this._journalEntries.update((entries) => [response.data, ...entries]);
        return response.data;
      } else {
        this._journalError.set('Failed to create journal entry');
        return null;
      }
    } catch (error) {
      console.error('[WellnessJournal] Create journal failed:', error);
      this._journalError.set('Error creating journal entry');
      return null;
    } finally {
      this._journalLoading.set(false);
    }
  }

  /**
   * Update a journal entry
   */
  async updateJournalEntry(id: string, payload: JournalEntryUpdatePayload): Promise<JournalEntry | null> {
    this._journalLoading.set(true);
    this._journalError.set(null);

    try {
      const response = await firstValueFrom(
        this.http.patch<WellnessSingleResponse<JournalEntry>>(`${this.apiUrl}/journal/${id}`, payload),
      );

      if (response.success) {
        const index = this._journalEntries().findIndex((e) => e.id === id);
        if (index >= 0) {
          const updated = [...this._journalEntries()];
          updated[index] = response.data;
          this._journalEntries.set(updated);
        }
        return response.data;
      } else {
        this._journalError.set('Failed to update journal entry');
        return null;
      }
    } catch (error) {
      console.error('[WellnessJournal] Update journal failed:', error);
      this._journalError.set('Error updating journal entry');
      return null;
    } finally {
      this._journalLoading.set(false);
    }
  }

  /**
   * Delete a journal entry
   */
  async deleteJournalEntry(id: string): Promise<boolean> {
    this._journalLoading.set(true);
    this._journalError.set(null);

    try {
      const response = await firstValueFrom(
        this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/journal/${id}`),
      );

      if (response.success) {
        this._journalEntries.update((entries) => entries.filter((e) => e.id !== id));
        return true;
      } else {
        this._journalError.set('Failed to delete journal entry');
        return false;
      }
    } catch (error) {
      console.error('[WellnessJournal] Delete journal failed:', error);
      this._journalError.set('Error deleting journal entry');
      return false;
    } finally {
      this._journalLoading.set(false);
    }
  }

  /**
   * Create a new journal entry with file attachments
   */
  async createJournalEntryWithMedia(
    payload: JournalEntryCreatePayload,
    files: File[]
  ): Promise<JournalEntry | null> {
    this._journalLoading.set(true);
    this._journalError.set(null);

    try {
      const formData = new FormData();
      formData.append('title', payload.title || '');
      formData.append('richText', payload.richText);

      // Append files with proper multipart form field name
      files.forEach((file) => {
        formData.append('media', file, file.name);
      });

      const response = await firstValueFrom(
        this.http.post<WellnessSingleResponse<JournalEntry>>(`${this.apiUrl}/journal`, formData),
      );

      if (response.success) {
        this._journalEntries.update((entries) => [response.data, ...entries]);
        return response.data;
      } else {
        this._journalError.set('Failed to create entry with media');
        return null;
      }
    } catch (error) {
      console.error('[WellnessJournal] Create entry with media failed:', error);
      this._journalError.set('Error creating entry with media');
      return null;
    } finally {
      this._journalLoading.set(false);
    }
  }

  /**
   * Clear all state (useful on logout)
   */
  clearState(): void {
    this._moodLogs.set([]);
    this._moodLoading.set(false);
    this._moodError.set(null);

    this._journalEntries.set([]);
    this._journalLoading.set(false);
    this._journalError.set(null);
    this._journalPagination.set({ limit: 20, offset: 0, total: 0, hasMore: false });
  }
}
