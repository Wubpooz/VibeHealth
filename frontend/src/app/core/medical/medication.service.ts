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
  nextDueAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  id: string;
  profileId: string;
  name: string;
  standardName?: string | null;
  notes?: string | null;
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

  async addMedication(name: string, standardName?: string, notes?: string): Promise<boolean> {
    if (!name.trim()) return false;

    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; medication: Medication }>(
          this.apiUrl,
          { name: name.trim(), standardName: standardName?.trim() || null, notes: notes?.trim() || null },
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
          { name: data.name, standardName: data.standardName, notes: data.notes },
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
}
