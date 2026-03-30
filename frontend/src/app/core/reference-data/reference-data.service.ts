import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReferenceDataService {
  private readonly http = inject(HttpClient);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);
  // Backend route is /api/v1/references
  private readonly baseUrl = `${environment.apiUrl}/api/v1/references`;

  // Signals for data
  conditions = signal<string[]>([]);
  allergies = signal<string[]>([]);
  medications = signal<string[]>([]);

  constructor() {
    this.loadData(this.getCurrentLocale());

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ lang }) => {
        this.loadData(this.normalizeLocale(lang));
      });
  }

  private loadData(locale: string) {
    const options = {
      headers: new HttpHeaders({
        'x-vibehealth-lang': locale,
      }),
    };

    // Load Conditions
    this.http
      .get<string[]>(`${this.baseUrl}/conditions`, options)
      .pipe(
        catchError((err) => {
          console.error('Failed to load conditions', err);
          return of([]);
        })
      )
      .subscribe((data) => this.conditions.set(data));

    // Load Allergies
    this.http
      .get<string[]>(`${this.baseUrl}/allergies`, options)
      .pipe(
        catchError((err) => {
          console.error('Failed to load allergies', err);
          return of([]);
        })
      )
      .subscribe((data) => this.allergies.set(data));

    // Load Medications
    this.http
      .get<string[]>(`${this.baseUrl}/medications`, options)
      .pipe(
        catchError((err) => {
          console.error('Failed to load medications', err);
          return of([]);
        })
      )
      .subscribe((data) => this.medications.set(data));
  }

  private getCurrentLocale(): string {
    const currentLang = this.translate.getCurrentLang();
    const fallbackLang = this.translate.getFallbackLang();
    return this.normalizeLocale(currentLang || fallbackLang || 'en');
  }

  private normalizeLocale(lang: string | undefined): string {
    return lang?.toLowerCase().startsWith('fr') ? 'fr' : 'en';
  }
}
