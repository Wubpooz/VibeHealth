import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, inject, signal, computed } from '@angular/core';
import * as L from 'leaflet';

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

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
  avatarUrl?: string;
}

@Component({
  selector: 'app-practitioner-map',
  standalone: true,
  imports: [CommonModule, TranslateModule, PageHeaderComponent, ModalComponent],
  template: `
    <div class="min-h-screen bg-[#fdf8f8] dark:bg-gray-950">
      <app-page-header
        [title]="'PRACTITIONER_MAP.TITLE' | translate"
        [subtitle]="'PRACTITIONER_MAP.SUBTITLE' | translate"
        [backLabel]="'PRACTITIONER_MAP.BACK_TO_DASHBOARD' | translate"
        [showBackLabel]="true"
      >
        <div pageHeaderRight class="flex gap-2">
          <button
            type="button"
            (click)="refreshLocation()"
            class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {{ 'PRACTITIONER_MAP.REFRESH_LOCATION' | translate }}
          </button>
          <button
            type="button"
            (click)="toggleProvider()"
            class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {{ 'PRACTITIONER_MAP.SWITCH_PROVIDER' | translate }}
          </button>
        </div>
      </app-page-header>

      <main class="px-4 sm:px-8 py-6 pb-20">
        @if (bookingMessage()) {
          <div class="mb-4 rounded-lg border border-green-300 bg-green-100 p-3 text-sm font-medium text-green-700 dark:border-green-700 dark:bg-green-900/60 dark:text-green-200">
            {{ bookingMessage() }}
          </div>
        }
        <div class="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
          <section class="space-y-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm">
            <div class="flex flex-col gap-3">
              <input
                type="text"
                [value]="searchQuery()"
                (input)="onSearchQueryChanged($any($event.target).value)"
                placeholder="{{ 'PRACTITIONER_MAP.SEARCH_PLACEHOLDER' | translate }}"
                class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-400 outline-none"
              />

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label class="text-xs text-gray-500 dark:text-gray-400">
                  {{ 'PRACTITIONER_MAP.CUSTOM_LATITUDE' | translate }}
                  <input
                    type="number"
                    [value]="customLatitude()"
                    (input)="customLatitude.set(+$any($event.target).value)"
                    class="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-700 dark:text-gray-100 outline-none"
                    step="any"
                  />
                </label>
                <label class="text-xs text-gray-500 dark:text-gray-400">
                  {{ 'PRACTITIONER_MAP.CUSTOM_LONGITUDE' | translate }}
                  <input
                    type="number"
                    [value]="customLongitude()"
                    (input)="customLongitude.set(+$any($event.target).value)"
                    class="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-700 dark:text-gray-100 outline-none"
                    step="any"
                  />
                </label>
              </div>

              <button
                type="button"
                (click)="applyCustomLocation()"
                class="w-full rounded-lg bg-primary-500 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-600"
              >
                {{ 'PRACTITIONER_MAP.SET_CUSTOM_LOCATION' | translate }}
              </button>

              <button
                type="button"
                (click)="setLocationToMapCenter()"
                class="w-full rounded-lg border border-primary-500 bg-white px-3 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-50"
              >
                {{ 'PRACTITIONER_MAP.SET_LOCATION_FROM_MAP_CENTER' | translate }}
              </button>

              <div class="flex flex-wrap gap-2">
                @for (category of categories; track category) {
                  <button
                    type="button"
                    (click)="setCategory(category)"
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
              @if (loadingPractitioners()) {
                <div class="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                  {{ 'PRACTITIONER_MAP.LOADING_PRACTITIONERS' | translate }}
                </div>
              }

              @if (!loadingPractitioners()) {
                @if (filteredPractitioners().length === 0) {
                  <div class="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                    {{ 'PRACTITIONER_MAP.NO_PRACTITIONERS_FOUND' | translate }}
                  </div>
                }

                @if (filteredPractitioners().length > 0) {
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
                    <div class="flex h-10 w-10 items-center justify-center rounded-full overflow-hidden" [ngStyle]="{ 'background-color': practitioner.avatarColor }">
                      @if (practitioner.avatarUrl) {
                        <img
                          src="{{ practitioner.avatarUrl }}"
                          alt="{{ practitioner.name }}"
                          class="h-full w-full object-cover"
                          loading="lazy"
                        />
                      } @else {
                        <span class="text-xs font-bold text-white">{{ practitioner.name.split(' ').map(n => n[0]).join('') }}</span>
                      }
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
                    (click)="openBookingModal(practitioner)"
                  >
                    {{ 'PRACTITIONER_MAP.BOOK_APPOINTMENT' | translate }}
                  </button>
                </article>
              }
            }
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

            <div
              #mapContainer
              class="w-full h-[65vh]"
              aria-label="{{ 'PRACTITIONER_MAP.MAP_TITLE' | translate }}"
            ></div>
            <div class="mt-2 px-3 text-xs text-gray-500 dark:text-gray-400">
              {{ 'PRACTITIONER_MAP.CLICK_TO_SET_LOCATION' | translate }}
            </div>
          </section>
        </div>

        <div class="mt-4 text-xs text-gray-500 dark:text-gray-400">
          {{ 'PRACTITIONER_MAP.IMPLICIT_PERMISSIONS' | translate }}
        </div>

        <app-modal #bookingModal title="{{ 'PRACTITIONER_MAP.BOOKING_MODAL_TITLE' | translate }}" [showClose]="true" size="sm" (closed)="closeBookingModal()">
          <div>
            <p class="text-sm text-gray-700 dark:text-gray-200">{{ 'PRACTITIONER_MAP.BOOKING_MODAL_SUBTITLE' | translate }}</p>

            <div class="mt-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3">
              <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">{{ 'PRACTITIONER_MAP.SELECT_PRACTITIONER' | translate:{ name: selectedPractitioner()?.name || '' } }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ 'PRACTITIONER_MAP.SELECTED_PROVIDER' | translate }}: {{ provider() === 'openstreetmap' ? ('PRACTITIONER_MAP.OPENSTREETMAP' | translate) : ('PRACTITIONER_MAP.GOOGLE_MAPS' | translate) }}</p>
            </div>
          </div>

          <div footer>
            <button type="button" class="btn btn-secondary mr-2" (click)="closeBookingModal()">{{ 'PRACTITIONER_MAP.CANCEL' | translate }}</button>
            <button type="button" class="btn btn-primary" (click)="confirmBooking()">{{ 'PRACTITIONER_MAP.CONFIRM_BOOK_APPOINTMENT' | translate }}</button>
          </div>
        </app-modal>
      </main>
    </div>
  `,
  styles: [`
    iframe { border: 0; }
  `],
})
export class PractitionerMapComponent implements OnInit, AfterViewInit {
  readonly translateService = inject(TranslateService);
  readonly http = inject(HttpClient);

  readonly provider = signal<MapProvider>('openstreetmap');
  readonly loadingPractitioners = signal(false);
  readonly location = signal<Coordinates>({ lat: 48.8566, lng: 2.3522 });
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  private map: L.Map | null = null;
  private tileLayer: L.TileLayer | null = null;
  private readonly markersById = new Map<string, L.Marker>();
  private userLocationMarker: L.Marker | null = null;

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
      avatarUrl: 'https://i.pravatar.cc/80?u=sarah+chen',
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
      avatarUrl: 'https://i.pravatar.cc/80?u=james+wilson',
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
      avatarUrl: 'https://i.pravatar.cc/80?u=elena+rodriguez',
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
      avatarUrl: 'https://i.pravatar.cc/80?u=marc+dupont',
    },
  ]);

  readonly categories = ['all', 'GP', 'Dentist', 'Therapist', 'Pediatrician'] as const;
  readonly selectedCategory = signal<PractitionerCategory>('all');
  readonly searchQuery = signal('');
  readonly selectedPractitioner = signal<Practitioner | null>(null);
  readonly bookingMessage = signal('');

  readonly customLatitude = signal<number>(this.location().lat);
  readonly customLongitude = signal<number>(this.location().lng);

  @ViewChild('mapContainer', { static: true })
  mapContainer!: ElementRef<HTMLDivElement>;

  @ViewChild('bookingModal', { static: true })
  bookingModal!: ModalComponent;

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

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  setProvider(value: MapProvider): void {
    this.provider.set(value);
    if (this.map) {
      this.setMapTileLayer(value);
    }
    this.loadPractitioners();
  }

  refreshLocation(): void {
    this.locateUser();
  }

  selectPractitioner(practitioner: Practitioner): void {
    this.selectedPractitioner.set(practitioner);
    this.location.set(practitioner.location);
    this.customLatitude.set(practitioner.location.lat);
    this.customLongitude.set(practitioner.location.lng);
    if (this.map) {
      const map = this.map;
      map.setView([practitioner.location.lat, practitioner.location.lng], map.getZoom());
      const marker = this.markersById.get(practitioner.id);
      if (marker) {
        marker.openPopup();
      }
    }
    this.loadPractitioners();
  }

  openBookingModal(practitioner: Practitioner): void {
    this.selectPractitioner(practitioner);
    this.bookingModal.open();
  }

  closeBookingModal(): void {
    this.bookingModal.close();
  }

  confirmBooking(): void {
    const practitioner = this.selectedPractitioner();
    if (!practitioner) {
      return;
    }

    this.bookingMessage.set(
      this.translateService.instant('PRACTITIONER_MAP.BOOKING_CONFIRMED', { name: practitioner.name })
    );
    this.closeBookingModal();
  }

  toggleProvider(): void {
    const nextProvider = this.provider() === 'openstreetmap' ? 'google' : 'openstreetmap';
    this.setProvider(nextProvider);
  }

  async loadPractitioners(): Promise<void> {
    this.loadingPractitioners.set(true);

    try {
      const lat = String(this.location().lat);
      const lng = String(this.location().lng);
      const q = this.searchQuery().trim();
      const specialty = this.selectedCategory();

      const params = new URLSearchParams({ lat, lng });
      if (q) params.set('q', q);
      if (specialty && specialty !== 'all') params.set('specialty', specialty);

      const url = `${environment.apiUrl}/api/v1/references/practitioners?${params.toString()}`;
      const practitionersFromApi = await firstValueFrom(this.http.get<Practitioner[]>(url));

      if (Array.isArray(practitionersFromApi)) {
        const practitionersWithAvatars = practitionersFromApi.map((p, i) => {
          const fallbackId = p.id || p.name || `practitioner-${i}`;
          const fallbackAvatar = `https://i.pravatar.cc/80?u=${encodeURIComponent(fallbackId)}`;
          return {
            ...p,
            avatarUrl: p.avatarUrl || fallbackAvatar,
          };
        });

        this.practitioners.set(practitionersWithAvatars);
      }
    } catch (err) {
      console.error('Failed to load practitioners', err);
    } finally {
      this.loadingPractitioners.set(false);
    }
  }

  setCategory(category: PractitionerCategory): void {
    this.selectedCategory.set(category);
    this.loadPractitioners();
  }

  onSearchQueryChanged(value: string): void {
    this.searchQuery.set(value);
    this.loadPractitioners();
  }

  applyCustomLocation(): void {
    this.error.set(null);
    const lat = this.customLatitude();
    const lng = this.customLongitude();

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      this.error.set('PRACTITIONER_MAP.INVALID_LOCATION');
      return;
    }

    this.setUserLocation(lat, lng);
  }

  setUserLocation(lat: number, lng: number): void {
    this.error.set(null);
    this.location.set({ lat, lng });
    this.customLatitude.set(lat);
    this.customLongitude.set(lng);
    if (this.map) {
      this.map.setView([lat, lng], this.map.getZoom());
    }
    this.updateUserLocationMarker();
    this.loadPractitioners();
  }

  setLocationToMapCenter(): void {
    if (!this.map) {
      return;
    }
    const center = this.map.getCenter();
    this.setUserLocation(center.lat, center.lng);
  }

  private initializeMap(): void {
    if (!this.mapContainer) {
      return;
    }

    const map = L.map(this.mapContainer.nativeElement);
    map.setView([this.location().lat, this.location().lng], 13);
    this.map = map;
    this.setMapTileLayer(this.provider());

    map.on('click', (event: unknown) => this.onMapClick(event as { latlng: { lat: number; lng: number } }));
    map.on('moveend', () => {
      const center = map.getCenter();
      // Do not auto-update location when simply panning/zooming. Require explicit action.
      this.customLatitude.set(center.lat);
      this.customLongitude.set(center.lng);
    });

    this.updateUserLocationMarker();
    this.renderMarkers();
  }

  private setMapTileLayer(provider: MapProvider): void {
    const layers = {
      openstreetmap: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap contributors',
      },
      google: {
        url: 'https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}',
        attribution: '&copy; Google',
      },
    };

    if (!this.map) {
      return;
    }

    if (this.tileLayer) {
      this.map.removeLayer(this.tileLayer);
    }

    this.tileLayer = L.tileLayer(layers[provider].url, {
      attribution: layers[provider].attribution,
    }).addTo(this.map);
  }

  private onMapClick(event: { latlng: { lat: number; lng: number } }): void {
    const { lat, lng } = event.latlng;
    this.location.set({ lat, lng });
    this.customLatitude.set(lat);
    this.customLongitude.set(lng);
    if (this.map) {
      this.map.setView([lat, lng], this.map.getZoom());
    }
    this.updateUserLocationMarker();
    this.loadPractitioners();
  }

  private getMarkerIcon() {
    return L.divIcon({
      className: 'leaflet-marker-icon custom-marker',
      html: '<div style="background:#1f2937;border:2px solid #f97316;border-radius:50%;width:18px;height:18px;box-shadow:0 0 0 6px rgba(249,115,22,.25);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -10],
    });
  }

  private getUserLocationIcon() {
    return L.divIcon({
      className: 'leaflet-marker-icon user-location-marker',
      html: '<div style="background:#3b82f6;border:2px solid #bfdbfe;border-radius:50%;width:18px;height:18px;box-shadow:0 0 0 6px rgba(59,130,246,0.25);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -10],
    });
  }

  private updateUserLocationMarker(): void {
    if (!this.map) {
      return;
    }

    const currentLocation = this.location();
    const translationResult = this.translateService.instant('PRACTITIONER_MAP.YOUR_LOCATION');
    const userLocationText = translationResult === 'PRACTITIONER_MAP.YOUR_LOCATION' ? 'You are here' : translationResult;

    if (this.userLocationMarker) {
      this.userLocationMarker.setLatLng([currentLocation.lat, currentLocation.lng]);
      this.userLocationMarker.setPopupContent(userLocationText);
    } else {
      this.userLocationMarker = L.marker([currentLocation.lat, currentLocation.lng], {
        icon: this.getUserLocationIcon(),
        title: userLocationText,
      })
        .addTo(this.map)
        .bindPopup(userLocationText);
    }
  }

  private renderMarkers(): void {
    this.clearMarkers();
    const map = this.map;
    if (!map) {
      return;
    }

    for (const practitioner of this.practitioners()) {
      const marker = L.marker([practitioner.location.lat, practitioner.location.lng], {
        title: practitioner.name,
        icon: this.getMarkerIcon(),
      })
        .addTo(map)
        .bindPopup(`<strong>${practitioner.name}</strong><br/>${practitioner.role}`);

      marker.on('click', () => this.selectPractitioner(practitioner));
      this.markersById.set(practitioner.id, marker);
    }
  }

  private clearMarkers(): void {
    const map = this.map;
    if (map) {
      this.markersById.forEach((marker) => map.removeLayer(marker));
    }
    this.markersById.clear();
  }

  categoryLabel(category: PractitionerCategory): string {
    const normalizedCategory = category === 'all' ? 'ALL' : category.toUpperCase();
    const key = `PRACTITIONER_MAP.CATEGORY_${normalizedCategory}`;
    const translated = this.translateService.instant(key);

    if (!translated || translated === key) {
      // fallback to readable labels in case translation is missing
      if (category === 'all') {
        return this.translateService.instant('PRACTITIONER_MAP.CATEGORY_ALL');
      }
      return category;
    }

    return translated;
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
      async (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        this.location.set(coords);
        this.customLatitude.set(coords.lat);
        this.customLongitude.set(coords.lng);
        if (this.map) {
          this.map.setView([coords.lat, coords.lng], this.map.getZoom());
        }
        this.updateUserLocationMarker();
        await this.loadPractitioners();
        this.loading.set(false);
      },
      async (err) => {
        console.error('Geolocation error', err);
        this.error.set('PRACTITIONER_MAP.GEOLOCATION_DENIED');
        const coords = { lat: 48.8566, lng: 2.3522 };
        this.location.set(coords);
        this.customLatitude.set(coords.lat);
        this.customLongitude.set(coords.lng);
        if (this.map) {
          this.map.setView([coords.lat, coords.lng], this.map.getZoom());
        }
        this.updateUserLocationMarker();
        await this.loadPractitioners();
        this.loading.set(false);
      },
      { timeout: 10000, maximumAge: 15_000, enableHighAccuracy: true },
    );
  }

}

