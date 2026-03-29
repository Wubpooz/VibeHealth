import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Profile {
  id: string;
  userId: string;
  dateOfBirth: string | null;
  biologicalSex: string | null;
  height: number | null;
  weight: number | null;
  fitnessLevel: string | null;
  preferredActivityKey: string | null;
  preferredCountryCode: string | null;
  goals: string[];
  medicalConditions: string[];
  allergies: string[];
  currentMedications: string[];
  notificationPreferences: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/profile`;
  
  private readonly profileSignal = signal<Profile | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly hasProfileSignal = signal<boolean | null>(null);
  
  readonly profile = this.profileSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();
  readonly hasProfile = this.hasProfileSignal.asReadonly();
  
  async loadProfile(): Promise<Profile | null> {
    this.loadingSignal.set(true);
    
    try {
      const response = await firstValueFrom(
        this.http.get<{ profile: Profile | null; hasProfile: boolean }>(this.apiUrl, {
          withCredentials: true,
        }).pipe(
          catchError(error => {
            console.error('Failed to load profile:', error);
            return of({ profile: null, hasProfile: false });
          })
        )
      );
      
      this.profileSignal.set(response?.profile || null);
      this.hasProfileSignal.set(response?.hasProfile ?? false);
      return response?.profile || null;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async updatePreferredWorkout(preferredActivityKey: string | null): Promise<Profile | null> {
    try {
      const response = await firstValueFrom(
        this.http.patch<{ success: boolean; profile: Profile }>(
          `${this.apiUrl}/preferred-workout`,
          { preferredActivityKey },
          { withCredentials: true },
        )
      );

      if (response?.profile) {
        this.profileSignal.set(response.profile);
        this.hasProfileSignal.set(true);
      }

      return response?.profile || null;
    } catch (error) {
      console.error('Failed to update preferred workout:', error);
      return null;
    }
  }

  async updatePreferredCountry(preferredCountryCode: string | null): Promise<Profile | null> {
    try {
      const response = await firstValueFrom(
        this.http.patch<{ success: boolean; profile: Profile }>(
          `${this.apiUrl}/preferred-country`,
          { preferredCountryCode },
          { withCredentials: true },
        )
      );

      if (response?.profile) {
        this.profileSignal.set(response.profile);
        this.hasProfileSignal.set(true);
      }

      return response?.profile || null;
    } catch (error) {
      console.error('Failed to update preferred country:', error);
      return null;
    }
  }
  
  clearProfile(): void {
    this.profileSignal.set(null);
    this.hasProfileSignal.set(null);
  }
}
