import { Component, inject, signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { FirstAidService } from '../first-aid/first-aid.service';
import { ProfileService } from '../../core/profile/profile.service';
import { AuthService } from '../../core/auth/auth.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LucideSettings } from '@lucide/angular';
import { EmergencyNumber } from '../first-aid/first-aid.types';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, TranslateModule, FormsModule, PageHeaderComponent, LucideSettings],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-rose-50 via-white to-sage-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">

      <!-- Header -->
      <app-page-header
        [title]="'SETTINGS.TITLE' | translate"
        [subtitle]="'SETTINGS.SUBTITLE' | translate"
        [showBackLabel]="false"
      >
        <span pageHeaderIcon class="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center justify-center" aria-hidden="true">
          <svg lucideSettings [size]="20" [strokeWidth]="2"></svg>
        </span>
      </app-page-header>

      <main class="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24">

        <!-- Language Settings -->
        <div class="mb-6 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>🗣️</span>
            {{ 'SETTINGS.LANGUAGE.TITLE' | translate }}
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {{ 'SETTINGS.LANGUAGE.DESCRIPTION' | translate }}
          </p>

          <div>
            <label for="languageSelect" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ 'SETTINGS.LANGUAGE.SELECT_LABEL' | translate }}
            </label>
            <select
              id="languageSelect"
              [ngModel]="currentLanguage()"
              (ngModelChange)="onLanguageChange($event)"
              class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            >
              @for (language of availableLanguages; track language.code) {
                <option [value]="language.code">{{ language.labelKey | translate }}</option>
              }
            </select>
          </div>
        </div>

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

        <!-- Account Settings -->
        <div class="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>👤</span>
            {{ 'SETTINGS.ACCOUNT.TITLE' | translate }}
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {{ 'SETTINGS.ACCOUNT.DESCRIPTION' | translate }}
          </p>

          <div class="space-y-4">
            <div>
              <label for="accountUsername" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ 'SETTINGS.ACCOUNT.USERNAME' | translate }}
              </label>
              <input
                id="accountUsername"
                type="text"
                [ngModel]="username()"
                (ngModelChange)="username.set($event)"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label for="accountName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ 'SETTINGS.ACCOUNT.NAME' | translate }}
              </label>
              <input
                id="accountName"
                type="text"
                [ngModel]="fullName()"
                (ngModelChange)="fullName.set($event)"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label for="accountEmail" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ 'SETTINGS.ACCOUNT.EMAIL' | translate }}
              </label>
              <input
                id="accountEmail"
                type="email"
                [ngModel]="email()"
                (ngModelChange)="email.set($event)"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              />
            </div>

            <button
              type="button"
              (click)="saveAccountDetails()"
              [disabled]="accountStatus() === 'saving'"
              class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {{ accountStatus() === 'saving' ? ('SETTINGS.ACCOUNT.SAVING' | translate) : ('SETTINGS.ACCOUNT.SAVE' | translate) }}
            </button>
          </div>
        </div>

        <!-- Security -->
        <div class="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>🔐</span>
            {{ 'SETTINGS.SECURITY.TITLE' | translate }}
          </h2>

          <div class="space-y-4">
            <div>
              <label for="currentPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ 'SETTINGS.SECURITY.CURRENT_PASSWORD' | translate }}
              </label>
              <input
                id="currentPassword"
                type="password"
                [ngModel]="currentPassword()"
                (ngModelChange)="currentPassword.set($event)"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label for="newPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ 'SETTINGS.SECURITY.NEW_PASSWORD' | translate }}
              </label>
              <input
                id="newPassword"
                type="password"
                [ngModel]="newPassword()"
                (ngModelChange)="newPassword.set($event)"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ 'SETTINGS.SECURITY.CONFIRM_PASSWORD' | translate }}
              </label>
              <input
                id="confirmPassword"
                type="password"
                [ngModel]="confirmPassword()"
                (ngModelChange)="confirmPassword.set($event)"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              />
            </div>

            <button
              type="button"
              (click)="changePassword()"
              [disabled]="passwordStatus() === 'saving'"
              class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
            >
              {{ passwordStatus() === 'saving' ? ('SETTINGS.SECURITY.SAVING' | translate) : ('SETTINGS.SECURITY.CHANGE_PASSWORD' | translate) }}
            </button>
          </div>
        </div>

        <!-- Data & Privacy -->
        <div class="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>🛡️</span>
            {{ 'SETTINGS.DATA.TITLE' | translate }}
          </h2>

          <div class="flex flex-wrap gap-3">
            <button
              type="button"
              (click)="downloadUserData()"
              [disabled]="dataStatus() === 'working'"
              class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {{ 'SETTINGS.DATA.DOWNLOAD_DATA' | translate }}
            </button>

            <button
              type="button"
              (click)="deleteAllUserData()"
              [disabled]="dataStatus() === 'working'"
              class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {{ 'SETTINGS.DATA.DELETE_DATA' | translate }}
            </button>

            <button
              type="button"
              (click)="deleteAccount()"
              [disabled]="dataStatus() === 'working'"
              class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {{ 'SETTINGS.DATA.DELETE_ACCOUNT' | translate }}
            </button>
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

        @if (actionMessage()) {
          <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <p class="text-sm text-gray-800 dark:text-gray-200">
              {{ actionMessage() }}
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
  private readonly authService = inject(AuthService);
  private readonly firstAidService = inject(FirstAidService);
  private readonly profileService = inject(ProfileService);
  private readonly translate = inject(TranslateService);

  // Track current language to re-render translated labels when switching locale
  readonly languageSignal = signal<'en' | 'fr'>('en');

  readonly availableLanguages = [
    { code: 'en', labelKey: 'SETTINGS.LANGUAGE.OPTION_EN' },
    { code: 'fr', labelKey: 'SETTINGS.LANGUAGE.OPTION_FR' },
  ] as const;

  readonly currentLanguage = computed<'en' | 'fr'>(() => {
    const current = this.languageSignal() || this.translate.getCurrentLang() || this.translate.getFallbackLang() || 'en';
    return this.normalizeLanguage(current);
  });

  readonly selectedCountry = computed(() => this.firstAidService.userCountryCode() ?? '');
  readonly saveStatus = signal<'idle' | 'saving' | 'saved'>('idle');

  static readonly SUPPORTED_COUNTRIES = ['GB', 'FR', 'US'];

  readonly availableCountries = computed(() => {
    // Touch language signal to recompute on language change
    this.languageSignal();

    return SettingsComponent.SUPPORTED_COUNTRIES.map((code) => ({
      code,
      flag: this.countryFlag(code),
      name: this.getCountryLabel(code, code),
    }));
  });

  readonly emergencyNumbers = computed<EmergencyNumber['numbers']>(() =>
    this.firstAidService.userEmergencyNumber()?.numbers ?? { general: '' }
  );

  readonly username = signal('');
  readonly fullName = signal('');
  readonly email = signal('');
  readonly currentPassword = signal('');
  readonly newPassword = signal('');
  readonly confirmPassword = signal('');

  readonly accountStatus = signal<'idle' | 'saving' | 'saved' | 'error'>('idle');
  readonly passwordStatus = signal<'idle' | 'saving' | 'saved' | 'error'>('idle');
  readonly dataStatus = signal<'idle' | 'working' | 'done' | 'error'>('idle');
  readonly actionMessage = signal<string | null>(null);

  constructor() {
    const initial = this.translate.getCurrentLang() || this.translate.getFallbackLang() || 'en';
    this.languageSignal.set(this.normalizeLanguage(initial));

    // Keep translation labels in sync with language changes
    this.translate.onLangChange.subscribe((event) => {
      this.languageSignal.set(this.normalizeLanguage(event.lang));
    });

    effect(() => {
      const preferred = this.profileService.profile()?.preferredCountryCode;
      if (preferred) {
        this.firstAidService.setUserCountry(preferred);
      }
    });

    effect(() => {
      const user = this.authService.user();
      if (!user) {
        return;
      }

      const name = user.name ?? '';
      this.username.set(name);
      this.fullName.set(name);
      this.email.set(user.email ?? '');
    });
  }

  onLanguageChange(language: string): void {
    const normalized = this.normalizeLanguage(language);

    if (normalized === this.currentLanguage()) {
      return;
    }

    this.saveStatus.set('saving');
    this.translate.use(normalized);

    setTimeout(() => {
      this.saveStatus.set('saved');
      setTimeout(() => {
        this.saveStatus.set('idle');
      }, 2000);
    }, 250);
  }

  onCountryChange(countryCode: string): void {
    const normalized = countryCode?.trim().toUpperCase();
    if (!normalized || !SettingsComponent.SUPPORTED_COUNTRIES.includes(normalized)) {
      return;
    }

    if (normalized === this.selectedCountry()) {
      return;
    }

    this.saveStatus.set('saving');

    // Update the service (updated country + emergency numbers)
    this.firstAidService.setUserCountry(normalized);

    // Persist to profile DB and persist preferred language if needed
    void this.profileService.updatePreferredCountry(normalized);

    // Show saved status briefly
    setTimeout(() => {
      this.saveStatus.set('saved');
      setTimeout(() => {
        this.saveStatus.set('idle');
      }, 2000);
    }, 500);
  }

  async saveAccountDetails(): Promise<void> {
    this.accountStatus.set('saving');

    const normalizedEmail = this.email().trim();
    const normalizedName = this.fullName().trim() || this.username().trim();

    const success = await this.authService.updateUserProfile({
      email: normalizedEmail,
      name: normalizedName || undefined,
    });

    if (!success) {
      this.accountStatus.set('error');
      this.setActionMessage('SETTINGS.ACCOUNT.UPDATE_FAILED');
      return;
    }

    await this.authService.refreshSession();
    this.accountStatus.set('saved');
    this.setActionMessage('SETTINGS.ACCOUNT.SAVED');
  }

  async changePassword(): Promise<void> {
    if (!this.currentPassword().trim()) {
      this.passwordStatus.set('error');
      this.setActionMessage('SETTINGS.SECURITY.CURRENT_PASSWORD_REQUIRED');
      return;
    }

    if (this.newPassword().trim().length < 8) {
      this.passwordStatus.set('error');
      this.setActionMessage('SETTINGS.SECURITY.PASSWORD_TOO_SHORT');
      return;
    }

    if (this.newPassword() !== this.confirmPassword()) {
      this.passwordStatus.set('error');
      this.setActionMessage('SETTINGS.SECURITY.PASSWORD_MISMATCH');
      return;
    }

    this.passwordStatus.set('saving');
    const success = await this.authService.changePassword(this.currentPassword(), this.newPassword());

    if (!success) {
      this.passwordStatus.set('error');
      this.setActionMessage('SETTINGS.SECURITY.UPDATE_FAILED');
      return;
    }

    this.currentPassword.set('');
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.passwordStatus.set('saved');
    this.setActionMessage('SETTINGS.SECURITY.PASSWORD_UPDATED');
  }

  async downloadUserData(): Promise<void> {
    this.dataStatus.set('working');
    const data = await this.profileService.exportUserData();

    if (!data) {
      this.dataStatus.set('error');
      this.setActionMessage('SETTINGS.DATA.DOWNLOAD_FAILED');
      return;
    }

    const fileName = `vibehealth-data-${new Date().toISOString().slice(0, 10)}.json`;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);

    this.dataStatus.set('done');
    this.setActionMessage('SETTINGS.DATA.DOWNLOAD_SUCCESS');
  }

  async deleteAllUserData(): Promise<void> {
    const confirmed = globalThis.confirm(this.translate.instant('SETTINGS.DATA.DELETE_DATA_CONFIRM'));
    if (!confirmed) {
      return;
    }

    this.dataStatus.set('working');
    const success = await this.profileService.deleteUserData();

    if (!success) {
      this.dataStatus.set('error');
      this.setActionMessage('SETTINGS.DATA.DELETE_FAILED');
      return;
    }

    this.dataStatus.set('done');
    this.setActionMessage('SETTINGS.DATA.DELETE_SUCCESS');
  }

  async deleteAccount(): Promise<void> {
    const confirmed = globalThis.confirm(this.translate.instant('SETTINGS.DATA.DELETE_ACCOUNT_CONFIRM'));
    if (!confirmed) {
      return;
    }

    const password = globalThis.prompt(this.translate.instant('SETTINGS.DATA.DELETE_ACCOUNT_PASSWORD_PROMPT')) ?? '';
    if (!password.trim()) {
      this.dataStatus.set('error');
      this.setActionMessage('SETTINGS.DATA.PASSWORD_REQUIRED');
      return;
    }

    this.dataStatus.set('working');
    const success = await this.authService.deleteAccount(password.trim());

    if (!success) {
      this.dataStatus.set('error');
      this.setActionMessage('SETTINGS.DATA.DELETE_ACCOUNT_FAILED');
      return;
    }

    this.dataStatus.set('done');
  }

  private setActionMessage(key: string): void {
    this.actionMessage.set(this.translate.instant(key));
  }

  private normalizeLanguage(language: string | undefined): 'en' | 'fr' {
    return language?.toLowerCase().startsWith('fr') ? 'fr' : 'en';
  }

  private getCountryLabel(code: string, fallback: string): string {
    const key = `SETTINGS.COUNTRY.NAMES.${code}`;
    const translation = this.translate.instant(key);
    return translation === key ? fallback : translation;
  }

  private countryFlag(code: string): string {
    if (!/^[A-Z]{2}$/.test(code)) {
      return '🌍';
    }
    return String.fromCodePoint(
      ...code.split('').map((char) => 127397 + (char.codePointAt(0) ?? 0)),
    );
  }
}