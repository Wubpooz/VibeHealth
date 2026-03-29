import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MedicationReminder {
  id: string;
  medicationId: string;
  timeOfDay: string;
  dosage: string;
  recurrence: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ONE_TIME';
  dayOfWeek?: number;
  dayOfMonth?: number;
  date?: string;
  nextDueAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationReminderPayload {
  timeOfDay: string;
  dosage: string;
  recurrence: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ONE_TIME';
  dayOfWeek?: number;
  dayOfMonth?: number;
  date?: string;
}

export interface Medication {
  id: string;
  profileId: string;
  name: string;
  standardName?: string | null;
  notes?: string | null;
  duration?: number | null; // Duration in days
  reminders: MedicationReminder[];
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class MedicationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/medical`;

  private readonly _medications = signal<Medication[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly medications = this._medications.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  async loadMedications(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.get<{ medications: Medication[] }>(this.apiUrl, { withCredentials: true })
      );
      this._medications.set(response.medications || []);
    } catch (err) {
      console.error('Unable to load medications', err);
      this._error.set('Failed to load medications');
    } finally {
      this._loading.set(false);
    }
  }

  async addMedication(name: string, standardName?: string, notes?: string, duration?: number): Promise<boolean> {
    if (!name.trim()) return false;

    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; medication: Medication }>(
          this.apiUrl,
          { name: name.trim(), standardName: standardName?.trim() || null, notes: notes?.trim() || null, duration: duration || null },
          { withCredentials: true }
        )
      );
      if (response?.medication) {
        this._medications.update((list) => [...list, response.medication]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Unable to add medication', err);
      this._error.set('Failed to add medication');
      return false;
    }
  }

  async updateMedication(id: string, data: Partial<Medication>): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.put<{ success: boolean; medication: Medication }>(
          `${this.apiUrl}/${id}`,
          { name: data.name, standardName: data.standardName, notes: data.notes, duration: data.duration },
          { withCredentials: true }
        )
      );

      if (response?.medication) {
        this._medications.update((list) =>
          list.map((m) => (m.id === id ? response.medication : m))
        );
        return true;
      }

      return false;
    } catch (err) {
      console.error('Unable to update medication', err);
      this._error.set('Failed to update medication');
      return false;
    }
  }

  async deleteMedication(id: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`, { withCredentials: true })
      );

      if (response?.success) {
        this._medications.update((list) => list.filter((m) => m.id !== id));
        return true;
      }

      return false;
    } catch (err) {
      console.error('Unable to delete medication', err);
      this._error.set('Failed to delete medication');
      return false;
    }
  }

  async addReminder(
    medicationId: string,
    timeOfDay: string,
    dosage: string,
    recurrence: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ONE_TIME',
    dayOfWeek?: number,
    dayOfMonth?: number,
    date?: string
  ): Promise<boolean> {
    try {
      const body: MedicationReminderPayload = { timeOfDay, dosage, recurrence };
      if (recurrence === 'WEEKLY') body.dayOfWeek = dayOfWeek;
      if (recurrence === 'MONTHLY') body.dayOfMonth = dayOfMonth;
      if (recurrence === 'ONE_TIME') body.date = date;

      const response = await firstValueFrom(
        this.http.post<{ success: boolean; reminder: MedicationReminder }>(
          `${this.apiUrl}/${medicationId}/reminders`,
          body,
          { withCredentials: true }
        )
      );

      if (response?.reminder) {
        this._medications.update((list) =>
          list.map((m) =>
            m.id === medicationId
              ? { ...m, reminders: [...m.reminders, response.reminder] }
              : m
          )
        );
        return true;
      }

      return false;
    } catch (err) {
      console.error('Unable to add reminder', err);
      this._error.set('Failed to add reminder');
      return false;
    }
  }

  async updateReminder(
    medicationId: string,
    reminderId: string,
    timeOfDay: string,
    dosage: string,
    recurrence: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ONE_TIME',
    dayOfWeek?: number,
    dayOfMonth?: number,
    date?: string
  ): Promise<boolean> {
    try {
      const body: MedicationReminderPayload = { timeOfDay, dosage, recurrence };
      if (recurrence === 'WEEKLY') body.dayOfWeek = dayOfWeek;
      if (recurrence === 'MONTHLY') body.dayOfMonth = dayOfMonth;
      if (recurrence === 'ONE_TIME') body.date = date;

      const response = await firstValueFrom(
        this.http.put<{ success: boolean; reminder: MedicationReminder }>(
          `${this.apiUrl}/${medicationId}/reminders/${reminderId}`,
          body,
          { withCredentials: true }
        )
      );

      if (response?.reminder) {
        this._medications.update((list) =>
          list.map((m) =>
            m.id === medicationId
              ? {
                  ...m,
                  reminders: m.reminders.map((r) =>
                    r.id === reminderId ? response.reminder : r
                  ),
                }
              : m
          )
        );
        return true;
      }

      return false;
    } catch (err) {
      console.error('Unable to update reminder', err);
      this._error.set('Failed to update reminder');
      return false;
    }
  }

  async deleteReminder(medicationId: string, reminderId: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.delete<{ success: boolean }>(
          `${this.apiUrl}/${medicationId}/reminders/${reminderId}`,
          { withCredentials: true }
        )
      );

      if (response?.success) {
        this._medications.update((list) =>
          list.map((m) =>
            m.id === medicationId
              ? { ...m, reminders: m.reminders.filter((r) => r.id !== reminderId) }
              : m
          )
        );
        return true;
      }

      return false;
    } catch (err) {
      console.error('Unable to delete reminder', err);
      this._error.set('Failed to delete reminder');
      return false;
    }
  }
}
