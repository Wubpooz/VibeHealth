import { Component, inject, signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { FirstAidService } from '../first-aid/first-aid.service';
import { ProfileService } from '../../core/profile/profile.service';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import { EmergencyNumber } from '../first-aid/first-aid.types';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, TranslateModule, FormsModule, BackButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-rose-50 via-white to-sage-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">

      <!-- Header -->
      <header class="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div class="flex items-center gap-3">
            <app-back-button [showLabel]="false" />
            <div>
              <h1 class="text-xl font-bold text-gray-900 dark:text-white font-heading">{{ 'SETTINGS.TITLE' | translate }}</h1>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ 'SETTINGS.SUBTITLE' | translate }}</p>
            </div>
          </div>
        </div>
      </header>

      <main class="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24">

        <!-- Country Settings -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>🌍</span>
            {{ 'SETTINGS.COUNTRY.TITLE' | translate }}
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {{ 'SETTINGS.COUNTRY.DESCRIPTION' | translate }}
          </p>

          <div class="space-y-4">
            <div>
              <label for="countrySelect" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ 'SETTINGS.COUNTRY.SELECT_LABEL' | translate }}
              </label>
              <select
                id="countrySelect"
                [ngModel]="selectedCountry()"
                (ngModelChange)="onCountryChange($event)"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              >
                <option value="">{{ 'SETTINGS.COUNTRY.SELECT_PLACEHOLDER' | translate }}</option>
                @for (country of availableCountries(); track country.code) {
                  <option [value]="country.code">{{ country.flag }} {{ country.name }}</option>
                }
              </select>
            </div>

            @if (selectedCountry()) {
              <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <h3 class="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  {{ 'SETTINGS.COUNTRY.EMERGENCY_NUMBERS' | translate }}
                </h3>
                <div class="space-y-2 text-sm">
                  @if (emergencyNumbers().general) {
                    <div class="flex items-center justify-between">
                      <span class="text-blue-800 dark:text-blue-200">{{ 'SETTINGS.COUNTRY.GENERAL_EMERGENCY' | translate }}</span>
                      <a
                        [href]="'tel:' + emergencyNumbers().general"
                        class="font-mono text-blue-700 dark:text-blue-300 hover:underline"
                      >
                        {{ emergencyNumbers().general }}
                      </a>
                    </div>
                  }
                  @if (emergencyNumbers().police) {
                    <div class="flex items-center justify-between">
                      <span class="text-blue-800 dark:text-blue-200">{{ 'SETTINGS.COUNTRY.POLICE' | translate }}</span>
                      <a
                        [href]="'tel:' + emergencyNumbers().police"
                        class="font-mono text-blue-700 dark:text-blue-300 hover:underline"
                      >
                        {{ emergencyNumbers().police }}
                      </a>
                    </div>
                  }
                  @if (emergencyNumbers().ambulance) {
                    <div class="flex items-center justify-between">
                      <span class="text-blue-800 dark:text-blue-200">{{ 'SETTINGS.COUNTRY.AMBULANCE' | translate }}</span>
                      <a
                        [href]="'tel:' + emergencyNumbers().ambulance"
                        class="font-mono text-blue-700 dark:text-blue-300 hover:underline"
                      >
                        {{ emergencyNumbers().ambulance }}
                      </a>
                    </div>
                  }
                  @if (emergencyNumbers().fire) {
                    <div class="flex items-center justify-between">
                      <span class="text-blue-800 dark:text-blue-200">{{ 'SETTINGS.COUNTRY.FIRE' | translate }}</span>
                      <a
                        [href]="'tel:' + emergencyNumbers().fire"
                        class="font-mono text-blue-700 dark:text-blue-300 hover:underline"
                      >
                        {{ emergencyNumbers().fire }}
                      </a>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Save Status -->
        @if (saveStatus() === 'saving') {
          <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <p class="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ 'SETTINGS.SAVING' | translate }}
            </p>
          </div>
        } @else if (saveStatus() === 'saved') {
          <div class="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
            <p class="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              {{ 'SETTINGS.SAVED' | translate }}
            </p>
          </div>
        }

      </main>
    </div>
  `,
  styles: [`
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `],
})
export class SettingsComponent {
  private readonly firstAidService = inject(FirstAidService);
  private readonly profileService = inject(ProfileService);
  private readonly translate = inject(TranslateService);

  // Track current language to re-render translated labels when switching locale
  readonly languageSignal = signal('en');

  readonly selectedCountry = computed(() => this.firstAidService.userCountryCode() ?? '');
  readonly saveStatus = signal<'idle' | 'saving' | 'saved'>('idle');

  static readonly SUPPORTED_COUNTRIES = ['GB', 'FR'];

  readonly availableCountries = computed(() => {
    // Touch language signal to recompute on language change
    this.languageSignal();

    return this.firstAidService.emergencyNumbers()
      .filter(country => SettingsComponent.SUPPORTED_COUNTRIES.includes(country.countryCode))
      .map(country => ({
        code: country.countryCode,
        flag: country.flag,
        name: this.getCountryLabel(country.countryCode, country.country),
      }));
  });

  readonly emergencyNumbers = computed<EmergencyNumber['numbers']>(() =>
    this.firstAidService.userEmergencyNumber()?.numbers ?? { general: '' }
  );

  constructor() {
    // Keep translation labels in sync with language changes
    this.translate.onLangChange.subscribe((event) => {
      this.languageSignal.set(event.lang);
    });

    effect(() => {
      const preferred = this.profileService.profile()?.preferredCountryCode;
      if (preferred) {
        const language = this.mapCountryToLanguage(preferred);
        this.translate.use(language);
        this.firstAidService.setUserCountry(preferred);
      }
    });
  }

  onCountryChange(countryCode: string): void {
    this.saveStatus.set('saving');

    // Set app language based on country
    const language = this.mapCountryToLanguage(countryCode);
    this.translate.use(language);

    // Update the service (updated country + emergency numbers)
    this.firstAidService.setUserCountry(countryCode);

    // Persist to profile DB and persist preferred language if needed
    void this.profileService.updatePreferredCountry(countryCode);

    // Show saved status briefly
    setTimeout(() => {
      this.saveStatus.set('saved');
      setTimeout(() => {
        this.saveStatus.set('idle');
      }, 2000);
    }, 500);
  }

  private mapCountryToLanguage(countryCode: string): string {
    if (countryCode === 'FR') return 'fr';
    if (countryCode === 'GB') return 'en';
    // fallback to default locale
    return 'en';
  }

  private getCountryLabel(code: string, fallback: string): string {
    const key = `SETTINGS.COUNTRY.NAMES.${code}`;
    const translation = this.translate.instant(key);
    return translation === key ? fallback : translation;
  }
}