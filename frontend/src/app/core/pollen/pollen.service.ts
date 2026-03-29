import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PollenData {
  date: string;
  location: {
    lat: number;
    lng: number;
  };
  pollen: {
    tree: number;
    grass: number;
    weed: number;
    total: number;
  };
  dominant: 'tree' | 'grass' | 'weed' | null;
  recommendations: string[];
}

@Injectable({ providedIn: 'root' })
export class PollenService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/medical`;

  private readonly pollenSignal = signal<PollenData | null>(null);
  private readonly loadingSignal = signal(false);

  readonly pollen = this.pollenSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();

  async loadPollenData(): Promise<PollenData | null> {
    this.loadingSignal.set(true);

    try {
      const response = await firstValueFrom(
        this.http.get<PollenData>(`${this.apiUrl}/pollen`, {
          withCredentials: true,
        }).pipe(
          catchError(error => {
            console.error('Failed to load pollen data:', error);
            return of(null);
          })
        )
      );

      this.pollenSignal.set(response);
      return response;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  getPollenLevelDescription(level: number): string {
    switch (level) {
      case 0: return 'Very Low';
      case 1: return 'Low';
      case 2: return 'Moderate';
      case 3: return 'High';
      case 4: return 'Very High';
      case 5: return 'Extreme';
      default: return 'Unknown';
    }
  }

  getPollenLevelColor(level: number): string {
    switch (level) {
      case 0: return 'text-green-600';
      case 1: return 'text-green-500';
      case 2: return 'text-yellow-500';
      case 3: return 'text-orange-500';
      case 4: return 'text-red-500';
      case 5: return 'text-red-700';
      default: return 'text-gray-500';
    }
  }

  clearPollenData(): void {
    this.pollenSignal.set(null);
  }
}