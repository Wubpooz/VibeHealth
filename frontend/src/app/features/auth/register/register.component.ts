import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/toast/toast.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { SocialButtonsComponent, type OAuthProvider } from '../../../shared/components/social-buttons/social-buttons.component';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule, SpinnerComponent, SocialButtonsComponent, BackButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-950 px-4 py-12 transition-colors duration-300">

      <!-- Back Button -->
      <div class="absolute top-4 left-4 z-10">
        <app-back-button />
      </div>

      <!-- Simplified Background Effects - no blur -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div class="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-300/15 rounded-full dark:bg-primary-900/15"></div>
        <div class="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-sage-300/15 rounded-full dark:bg-sage-900/15"></div>
      </div>

      <div class="relative w-full max-w-md">

        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-xl shadow-primary-500/10 mb-6 dark:bg-gray-800">
            <img src="assets/logo.png" alt="VibeHealth Logo" class="w-14 h-14 object-contain" />
          </div>
          <h1 class="text-4xl font-bold tracking-tight text-gray-900 mb-3 dark:text-white font-heading">
            {{ 'AUTH.JOIN_VIBEHEALTH' | translate }}
          </h1>
          <p class="text-lg text-gray-500 font-medium dark:text-gray-400">
            {{ 'AUTH.CREATE_ACCOUNT_DESC' | translate }}
          </p>
        </div>

        <!-- Card -->
        <div class="glass-panel rounded-3xl p-8 sm:p-10">

          @if (auth.error()) {
            <div class="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-start gap-3 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              {{ auth.error() }}
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="space-y-5">
            <div class="space-y-2">
              <label for="name" class="block text-sm font-semibold text-gray-700 ml-1 dark:text-gray-300">
                {{ 'AUTH.NAME' | translate }} <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                [(ngModel)]="name"
                required
                class="input-field"
                [class.input-field-error]="nameError()"
                [placeholder]="'AUTH.YOUR_NAME' | translate"
                autocomplete="name"
                (blur)="validateName()"
              />
              @if (nameError()) {
                <p class="text-xs text-red-500 font-medium ml-1">{{ 'AUTH.NAME_REQUIRED' | translate }}</p>
              }
            </div>

            <div class="space-y-2">
              <label for="email" class="block text-sm font-semibold text-gray-700 ml-1 dark:text-gray-300">
                {{ 'AUTH.EMAIL' | translate }} <span class="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                [(ngModel)]="email"
                required
                class="input-field"
                placeholder="you@example.com"
                autocomplete="email"
              />
            </div>

            <div class="space-y-2">
              <label for="password" class="block text-sm font-semibold text-gray-700 ml-1 dark:text-gray-300">
                {{ 'AUTH.PASSWORD' | translate }} <span class="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                [(ngModel)]="password"
                required
                minlength="8"
                class="input-field"
                placeholder="••••••••"
                autocomplete="new-password"
              />
              <p class="text-xs text-gray-500 ml-1 dark:text-gray-400">{{ 'AUTH.PASSWORD_MIN_LENGTH' | translate }}</p>
            </div>

            <div class="space-y-2">
              <label for="confirmPassword" class="block text-sm font-semibold text-gray-700 ml-1 dark:text-gray-300">
                {{ 'AUTH.CONFIRM_PASSWORD' | translate }} <span class="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                [(ngModel)]="confirmPassword"
                required
                class="input-field"
                placeholder="••••••••"
                autocomplete="new-password"
              />
              @if (password && confirmPassword && password !== confirmPassword) {
                <p class="text-xs text-red-500 font-medium ml-1">{{ 'AUTH.PASSWORDS_NOT_MATCH' | translate }}</p>
              }
            </div>

            <div class="pt-2">
              <button
                type="submit"
                [disabled]="auth.isLoading() || !isValid()"
                class="w-full btn-primary flex items-center justify-center gap-2 group"
              >
                @if (auth.isLoading()) {
                  <app-spinner size="sm" containerClass="text-white" />
                  <span>{{ 'AUTH.CREATING_ACCOUNT' | translate }}</span>
                } @else {
                  <span>{{ 'AUTH.CREATE_ACCOUNT' | translate }}</span>
                  <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                }
              </button>
            </div>
          </form>

          <!-- Divider -->
          <div class="relative my-8">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-white text-gray-500 font-medium dark:bg-gray-900/95 dark:text-gray-400">{{ 'AUTH.OR_SIGN_UP_WITH' | translate }}</span>
            </div>
          </div>

          <!-- Social Login -->
          @if (socialProviders().length > 0) {
            <app-social-buttons
              [providers]="socialProviders()"
              [loading]="auth.isLoading()"
              (onProviderClick)="onOAuthClick($event)"
            />
          }
        </div>

        <!-- Footer -->
        <p class="text-center mt-8 text-gray-600 dark:text-gray-400">
          {{ 'AUTH.HAVE_ACCOUNT' | translate }}
          <a routerLink="/login" class="font-bold text-primary-600 hover:text-primary-700 transition-colors dark:text-primary-400 hover:underline">
            {{ 'AUTH.SIGN_IN' | translate }}
          </a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  nameError = signal(false);
  readonly socialProviders = this.auth.enabledProviders;

  validateName(): void {
    this.nameError.set(!this.name.trim());
  }

  isValid(): boolean {
    return !!(
      this.name.trim() &&
      this.email &&
      this.password &&
      this.password.length >= 8 &&
      this.password === this.confirmPassword
    );
  }

  async onSubmit(): Promise<void> {
    this.validateName();
    if (!this.isValid()) return;

    const success = await this.auth.signUp({
      email: this.email,
      password: this.password,
      name: this.name.trim(),
    });

    if (success) {
      this.toast.success('Account created! Let\'s complete your profile.', 'Welcome to VibeHealth');
      // Redirect new users to onboarding
      this.router.navigate(['/onboarding']);
    } else if (this.auth.error()) {
      this.toast.error(this.auth.error() || "Une erreur s'est produite", 'Sign up failed');
    }
  }

  onOAuthClick(provider: OAuthProvider): void {
    globalThis.location.href = this.auth.getOAuthUrl(provider);
  }
}
