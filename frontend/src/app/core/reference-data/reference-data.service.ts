import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError} from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReferenceDataService {
  private readonly http = inject(HttpClient);
  // Backend route is /api/v1/references
  private readonly baseUrl = `${environment.apiUrl}/api/v1/references`;

  // Signals for data
  conditions = signal<string[]>([]);
  allergies = signal<string[]>([]);
  medications = signal<string[]>([]);

  constructor() {
    this.loadData();
  }

  private loadData() {
    // Load Conditions
    this.http.get<string[]>(`${this.baseUrl}/conditions`)
      .pipe(
        catchError(err => {
          console.error('Failed to load conditions', err);
          return of([]);
        })
      )
      .subscribe(data => this.conditions.set(data));

    // Load Allergies
    this.http.get<string[]>(`${this.baseUrl}/allergies`)
      .pipe(
        catchError(err => {
          console.error('Failed to load allergies', err);
          return of([]);
        })
      )
      .subscribe(data => this.allergies.set(data));

    // Load Medications
    this.http.get<string[]>(`${this.baseUrl}/medications`)
      .pipe(
        catchError(err => {
          console.error('Failed to load medications', err);
          return of([]);
        })
      )
      .subscribe(data => this.medications.set(data));
  }
}
