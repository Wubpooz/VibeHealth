import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

type MapProvider = 'openstreetmap' | 'google';

type PractitionerCategory = 'all' | 'GP' | 'Dentist' | 'Therapist' | 'Pediatrician';

interface Coordinates {
  lat: number;
  lng: number;
}

interface Practitioner {
  id: string;
  name: string;
  role: string;
  category: Exclude<PractitionerCategory, 'all'>;
  rating: number;
  distanceKm: number;
  location: Coordinates;
  avatarColor: string;
}

@Component({
  selector: 'app-practitioner-map',
  standalone: true,
  imports: [CommonModule, TranslateModule, PageHeaderComponent],
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
        <div class="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
          <section class="space-y-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm">
            <div class="flex flex-col gap-3">
              <input
                type="text"
                [value]="searchQuery()"
                (input)="searchQuery.set($any($event.target).value)"
                placeholder="{{ 'PRACTITIONER_MAP.SEARCH_PLACEHOLDER' | translate }}"
                class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-400 outline-none"
              />

              <div class="flex flex-wrap gap-2">
                @for (category of categories; track category) {
                  <button
                    type="button"
                    (click)="selectedCategory.set(category)"
                    [class.bg-primary-500]="selectedCategory() === category"
                    [class.text-white]="selectedCategory() === category"
                    [attr.aria-label]="('PRACTITIONER_MAP.CATEGORY_FILTER_LABEL' | translate:{ category: categoryLabel(category) })"
                    class="rounded-full border border-gray-300 dark:border-gray-700 px-3 py-1 text-xs font-medium transition"
                  >
                    {{ categoryLabel(category) }}
                  </button>
                }
              </div>

              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ 'PRACTITIONER_MAP.PRACTITIONER_COUNT' | translate:{ count: filteredPractitioners().length } }}
              </div>
            </div>

            <div class="max-h-[calc(100vh-240px)] overflow-y-auto space-y-3">
              @if (filteredPractitioners().length === 0) {
                <div class="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                  {{ 'PRACTITIONER_MAP.NO_PRACTITIONERS_FOUND' | translate }}
                </div>
              }
              @for (practitioner of filteredPractitioners(); track practitioner.id) {
                <article
                  (click)="selectPractitioner(practitioner)"
                  (keydown.enter)="selectPractitioner(practitioner)"
                  (keydown.space)="selectPractitioner(practitioner)"
                  tabindex="0"
                  role="button"
                  [attr.aria-label]="('PRACTITIONER_MAP.SELECT_PRACTITIONER' | translate:{ name: practitioner.name })"
                  [class.border-primary-500]="selectedPractitioner()?.id === practitioner.id"
                  class="cursor-pointer rounded-xl border p-3 transition hover:shadow-md hover:border-primary-500"
                >
                  <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-full" [ngStyle]="{ 'background-color': practitioner.avatarColor }">
                      <span class="text-xs font-bold text-white">{{ practitioner.name.split(' ').map(n => n[0]).join('') }}</span>
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ practitioner.name }}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">{{ practitioner.role }}</div>
                    </div>
                  </div>

                  <div class="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      {{ practitioner.rating.toFixed(1)}} ⭐
                    </span>
                    <span>
                      {{ practitioner.distanceKm.toFixed(1) }} km
                    </span>
                  </div>

                  <button
                    type="button"
                    class="mt-2 inline-flex items-center justify-center rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-600"
                  >
                    {{ 'PRACTITIONER_MAP.BOOK_APPOINTMENT' | translate }}
                  </button>
                </article>
              }
            </div>
          </section>

          <section class="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
            <div class="flex justify-between items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-800">
              <div class="text-sm font-semibold text-gray-700 dark:text-gray-100">
                {{ 'PRACTITIONER_MAP.SELECTED_PROVIDER' | translate }}:
                {{ provider() === 'openstreetmap' ? ('PRACTITIONER_MAP.OPENSTREETMAP' | translate) : ('PRACTITIONER_MAP.GOOGLE_MAPS' | translate) }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ 'PRACTITIONER_MAP.CURRENT_LOCATION' | translate }}: {{ location().lat.toFixed(5) }}, {{ location().lng.toFixed(5) }}
              </div>
            </div>

            @if (mapUrl()) {
              <iframe
                [src]="mapUrl()"
                loading="lazy"
                class="w-full h-[65vh]"
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
          </section>
        </div>

        <div class="mt-4 text-xs text-gray-500 dark:text-gray-400">
          {{ 'PRACTITIONER_MAP.IMPLICIT_PERMISSIONS' | translate }}
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
  readonly translateService = inject(TranslateService);

  readonly provider = signal<MapProvider>('openstreetmap');
  readonly location = signal<Coordinates>({ lat: 48.8566, lng: 2.3522 });
  readonly mapUrl = signal<SafeResourceUrl>(this.createMapUrl(this.location(), this.provider()));
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly practitioners = signal<Practitioner[]>([
    {
      id: 'p1',
      name: 'Dr. Sarah Chen',
      role: 'Therapist • Clinical Psychologist',
      category: 'Therapist',
      rating: 4.9,
      distanceKm: 0.8,
      location: { lat: 48.8605, lng: 2.3377 },
      avatarColor: '#7f9cf5',
    },
    {
      id: 'p2',
      name: 'Dr. James Wilson',
      role: 'General Practitioner',
      category: 'GP',
      rating: 4.8,
      distanceKm: 1.2,
      location: { lat: 48.8549, lng: 2.347 },
      avatarColor: '#f97316',
    },
    {
      id: 'p3',
      name: 'Dr. Elena Rodriguez',
      role: 'Dentist • Orthodontist',
      category: 'Dentist',
      rating: 5,
      distanceKm: 2.4,
      location: { lat: 48.849, lng: 2.3564 },
      avatarColor: '#2dd4bf',
    },
    {
      id: 'p4',
      name: 'Dr. Marc Dupont',
      role: 'Pediatrician',
      category: 'Pediatrician',
      rating: 4.7,
      distanceKm: 1.9,
      location: { lat: 48.858, lng: 2.349 },
      avatarColor: '#f43f5e',
    },
  ]);

  readonly categories = ['all', 'GP', 'Dentist', 'Therapist', 'Pediatrician'] as const;
  readonly selectedCategory = signal<PractitionerCategory>('all');
  readonly searchQuery = signal('');
  readonly selectedPractitioner = signal<Practitioner | null>(null);

  readonly filteredPractitioners = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const category = this.selectedCategory();

    return this.practitioners().filter((p) => {
      const matchesCategory = category === 'all' || p.category === category;
      const matchesQuery = [p.name, p.role, p.category].some((v) => v.toLowerCase().includes(query));
      return matchesCategory && matchesQuery;
    });
  });

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

  selectPractitioner(practitioner: Practitioner): void {
    this.selectedPractitioner.set(practitioner);
    this.location.set(practitioner.location);
    this.updateMapUrl();
  }

  categoryLabel(category: PractitionerCategory): string {
    return this.translateService.instant(`PRACTITIONER_MAP.CATEGORY_${category}`);
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
