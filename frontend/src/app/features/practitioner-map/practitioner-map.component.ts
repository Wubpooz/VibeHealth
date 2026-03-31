import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

type MapProvider = 'openstreetmap' | 'google';

interface Coordinates {
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-practitioner-map',
  standalone: true,
  imports: [CommonModule, TranslateModule, PageHeaderComponent, RouterLink],
  template: `
    <div class="min-h-screen bg-[#fdf8f8] dark:bg-gray-950">
      <app-page-header
        [title]="'PRACTITIONER_MAP.TITLE' | translate"
        [subtitle]="'PRACTITIONER_MAP.SUBTITLE' | translate"
        [backLabel]="'PRACTITIONER_MAP.BACK_TO_DASHBOARD' | translate"
        [showBackLabel]="true"
      >
        <div pageHeaderRight>
          <button
            type="button"
            (click)="refreshLocation()"
            class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {{ 'PRACTITIONER_MAP.REFRESH_LOCATION' | translate }}
          </button>
        </div>
      </app-page-header>

      <main class="px-4 sm:px-8 py-6 pb-20">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            (click)="setProvider('openstreetmap')"
            [class.font-bold]="provider() === 'openstreetmap'"
            class="rounded-xl border px-4 py-2 text-sm transition-all hover:shadow focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            {{ 'PRACTITIONER_MAP.OPENSTREETMAP' | translate }}
          </button>
          <button
            type="button"
            (click)="setProvider('google')"
            [class.font-bold]="provider() === 'google'"
            class="rounded-xl border px-4 py-2 text-sm transition-all hover:shadow focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            {{ 'PRACTITIONER_MAP.GOOGLE_MAPS' | translate }}
          </button>
        </div>

        <div class="mb-4 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <strong>{{ 'PRACTITIONER_MAP.CURRENT_LOCATION' | translate }}:</strong>
            {{ location().lat.toFixed(5) }}, {{ location().lng.toFixed(5) }}
          </div>
          <div>
            <strong>{{ 'PRACTITIONER_MAP.SELECTED_PROVIDER' | translate }}:</strong>
            {{ provider() === 'openstreetmap' ? ('PRACTITIONER_MAP.OPENSTREETMAP' | translate) : ('PRACTITIONER_MAP.GOOGLE_MAPS' | translate) }}
          </div>
        </div>

        <div class="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm" style="min-height: 56vh;">
          @if (mapUrl()) {
            <iframe
              [src]="mapUrl()"
              loading="lazy"
              class="w-full h-[70vh]"
              title="{{ 'PRACTITIONER_MAP.MAP_TITLE' | translate }}"
              allowfullscreen
              sandbox="allow-scripts allow-same-origin allow-popups"
            ></iframe>
          }
          @if (loading()) {
            <div class="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
              {{ 'PRACTITIONER_MAP.LOADING_MAP' | translate }}
            </div>
          }
          @if (error()) {
            <div class="p-6 text-center text-sm text-red-600 dark:text-red-400">
              {{ error() | translate }}
            </div>
          }
        </div>

        <div class="mt-4 text-xs text-gray-500 dark:text-gray-400">
          {{ 'PRACTITIONER_MAP.IMPLICIT_PERMISSIONS' | translate }}
        </div>

        <div class="mt-6">
          <a
            routerLink="/dashboard"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white font-semibold hover:bg-primary-600 transition"
          >
            {{ 'PRACTITIONER_MAP.BACK_TO_DASHBOARD' | translate }}
          </a>
        </div>
      </main>
    </div>
  `,
  styles: [`
    iframe { border: 0; }
  `],
})
export class PractitionerMapComponent implements OnInit {
  readonly sanitizer = inject(DomSanitizer);

  readonly provider = signal<MapProvider>('openstreetmap');
  readonly location = signal<Coordinates>({ lat: 48.8566, lng: 2.3522 });
  readonly mapUrl = signal<SafeResourceUrl>(this.createMapUrl(this.location(), this.provider()));
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.setProvider(this.provider());
    this.locateUser();
  }

  setProvider(value: MapProvider): void {
    this.provider.set(value);
    this.updateMapUrl();
  }

  refreshLocation(): void {
    this.locateUser();
  }

  private locateUser(): void {
    this.loading.set(true);
    this.error.set(null);

    if (!navigator.geolocation) {
      this.error.set('PRACTITIONER_MAP.GEOLOCATION_UNSUPPORTED');
      this.loading.set(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.location.set({ lat: position.coords.latitude, lng: position.coords.longitude });
        this.updateMapUrl();
        this.loading.set(false);
      },
      (err) => {
        console.error('Geolocation error', err);
        this.error.set('PRACTITIONER_MAP.GEOLOCATION_DENIED');
        this.location.set({ lat: 48.8566, lng: 2.3522 });
        this.updateMapUrl();
        this.loading.set(false);
      },
      { timeout: 10000, maximumAge: 15_000, enableHighAccuracy: true },
    );
  }

  private updateMapUrl(): void {
    this.mapUrl.set(this.createMapUrl(this.location(), this.provider()));
  }

  private createMapUrl(loc: Coordinates, provider: MapProvider): SafeResourceUrl {
    if (provider === 'google') {
      const q = encodeURIComponent('doctor near me');
      const url = `https://www.google.com/maps?q=${q}@${loc.lat},${loc.lng}&z=13&output=embed`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    const delta = 0.05;
    const minLon = loc.lng - delta;
    const maxLon = loc.lng + delta;
    const minLat = loc.lat - delta;
    const maxLat = loc.lat + delta;
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${loc.lat}%2C${loc.lng}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
