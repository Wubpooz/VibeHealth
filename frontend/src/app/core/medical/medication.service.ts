import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export type MedicationRecurrence = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ONE_TIME';

export interface MedicationReminder {
  id: string;
  medicationId: string;
  timeOfDay: string;
  dosage: string;
  recurrence: MedicationRecurrence;
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
  recurrence: MedicationRecurrence;
  dayOfWeek?: number;
  dayOfMonth?: number;
  date?: string;
}

export interface OpenFdaDrugIntel {
  name: string;
  officialName: string;
  openfda: Record<string, unknown>;
  sideEffects: string[];
  interactions: string[];
  warnings: string[];
  dosage: string[];
}

export interface AddMedicationPayload {
  name: string;
  standardName?: string;
  notes?: string;
  duration?: number;
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

  async fetchDrugIntel(name: string): Promise<OpenFdaDrugIntel | null> {
    if (!name.trim()) {
      return null;
    }

    try {
      const response = await firstValueFrom(
        this.http.get<OpenFdaDrugIntel>(`${this.apiUrl}/openfda?name=${encodeURIComponent(name.trim())}`, { withCredentials: true })
      );
      return response;
    } catch (err) {
      console.error('Unable to fetch drug intel', err);
      this._error.set('Failed to fetch drug information');
      return null;
    }
  }

  async addMedication(name: string, standardName?: string, notes?: string, duration?: number): Promise<boolean> {
    if (!name.trim()) return false;

    try {
      const body: AddMedicationPayload = { name: name.trim() };
      if (standardName?.trim()) {
        body.standardName = standardName.trim();
      }
      if (notes?.trim()) {
        body.notes = notes.trim();
      }
      if (typeof duration === 'number') {
        body.duration = duration;
      }

      const response = await firstValueFrom(
        this.http.post<{ success: boolean; medication: Medication }>(
          this.apiUrl,
          body,
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

  async updateMedication(id: string, data: Partial<AddMedicationPayload>): Promise<boolean> {
    try {
      const body: Partial<AddMedicationPayload> = {};
      if (data.name !== undefined) body.name = data.name;
      if (data.standardName !== undefined) body.standardName = data.standardName;
      if (data.notes !== undefined) body.notes = data.notes;
      if (data.duration !== undefined) body.duration = data.duration;

      const response = await firstValueFrom(
        this.http.put<{ success: boolean; medication: Medication }>(
          `${this.apiUrl}/${id}`,
          body,
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
    payload: MedicationReminderPayload
  ): Promise<boolean> {
    try {
      const body: MedicationReminderPayload = {
        timeOfDay: payload.timeOfDay,
        dosage: payload.dosage,
        recurrence: payload.recurrence,
      };
      if (payload.recurrence === 'WEEKLY') body.dayOfWeek = payload.dayOfWeek;
      if (payload.recurrence === 'MONTHLY') body.dayOfMonth = payload.dayOfMonth;
      if (payload.recurrence === 'ONE_TIME') body.date = payload.date;

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
