import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { SpinnerComponent, SocialButtonsComponent, OAuthProvider } from '../../../shared/components';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule, SpinnerComponent, SocialButtonsComponent],
  template: `
    <div class="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-950 px-4 py-12 transition-colors duration-500">
      
      <!-- Ambient Background Effects -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-300/20 rounded-full blur-[100px] animate-pulse-slow dark:bg-primary-900/20"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sage-300/20 rounded-full blur-[100px] animate-pulse-slow delay-1000 dark:bg-sage-900/20"></div>
      </div>

      <div class="relative w-full max-w-md animate-fade-in-up">
        
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-xl shadow-primary-500/10 mb-6 animate-float dark:bg-gray-800">
            <span class="text-5xl">🐰</span>
          </div>
          <h1 class="text-4xl font-bold tracking-tight text-gray-900 mb-3 dark:text-white font-heading">
            {{ 'AUTH.WELCOME_BACK' | translate }}
          </h1>
          <p class="text-lg text-gray-500 font-medium dark:text-gray-400">
            {{ 'AUTH.SIGN_IN_TO_ACCOUNT' | translate }}
          </p>
        </div>

        <!-- Glass Card -->
        <div class="glass-panel rounded-3xl p-8 sm:p-10">
          
          @if (auth.error()) {
            <div class="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-start gap-3 animate-fade-in dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              {{ auth.error() }}
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="space-y-2">
              <label for="email" class="block text-sm font-semibold text-gray-700 ml-1 dark:text-gray-300">
                {{ 'AUTH.EMAIL' | translate }}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                [(ngModel)]="email"
                required
                class="input-field"
                placeholder="you@example.com"
                autocomplete="username"
              />
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between ml-1">
                <label for="password" class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {{ 'AUTH.PASSWORD' | translate }}
                </label>
                <a routerLink="/forgot-password" class="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
                  {{ 'AUTH.FORGOT_PASSWORD' | translate }}
                </a>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                [(ngModel)]="password"
                required
                class="input-field"
                placeholder="••••••••"
                autocomplete="current-password"
              />
            </div>

            <button
              type="submit"
              [disabled]="auth.isLoading()"
              class="w-full btn-primary flex items-center justify-center gap-2 group"
            >
              @if (auth.isLoading()) {
                <app-spinner size="sm" containerClass="text-white" />
                <span>{{ 'AUTH.SIGNING_IN' | translate }}</span>
              } @else {
                <span>{{ 'AUTH.SIGN_IN' | translate }}</span>
                <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              }
            </button>
          </form>

          <!-- Divider -->
          <div class="relative my-8">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-white text-gray-500 font-medium dark:bg-gray-900/80">{{ 'AUTH.OR_CONTINUE_WITH' | translate }}</span>
            </div>
          </div>

          <!-- Social Login -->
          <app-social-buttons
            [providers]="['google', 'github', 'apple']"
            [loading]="auth.isLoading()"
            (onProviderClick)="onOAuthClick($event)"
          />

          <!-- Magic Link -->
          <div class="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              (click)="showMagicLink.set(!showMagicLink())"
              class="w-full text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors flex items-center justify-center gap-2 group dark:text-gray-400 dark:hover:text-primary-400"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {{ 'AUTH.SIGN_IN_WITH_MAGIC_LINK' | translate }}
            </button>

            @if (showMagicLink()) {
              <div class="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 animate-fade-in dark:bg-gray-800/50 dark:border-gray-700">
                <div class="flex gap-2">
                  <input
                    type="email"
                    [(ngModel)]="magicLinkEmail"
                    [placeholder]="'AUTH.ENTER_EMAIL' | translate"
                    class="input-field !py-2.5 text-sm"
                  />
                  <button
                    type="button"
                    (click)="sendMagicLink()"
                    [disabled]="auth.isLoading()"
                    class="px-4 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600"
                  >
                    Send
                  </button>
                </div>
                @if (magicLinkSent()) {
                  <p class="mt-2 text-sm text-green-600 font-medium flex items-center gap-1.5 dark:text-green-400">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {{ 'AUTH.MAGIC_LINK_SENT' | translate }}
                  </p>
                }
              </div>
            }
          </div>
        </div>

        <!-- Footer -->
        <p class="text-center mt-8 text-gray-600 dark:text-gray-400">
          {{ 'AUTH.NO_ACCOUNT' | translate }}
          <a routerLink="/register" class="font-bold text-primary-600 hover:text-primary-700 transition-colors dark:text-primary-400 hover:underline">
            {{ 'AUTH.SIGN_UP' | translate }}
          </a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  magicLinkEmail = '';
  showMagicLink = signal(false);
  magicLinkSent = signal(false);

  async onSubmit(): Promise<void> {
    if (!this.email || !this.password) return;

    const success = await this.auth.signIn({ email: this.email, password: this.password });
    if (success) {
      this.router.navigate(['/dashboard']);
    }
  }

  onOAuthClick(provider: OAuthProvider): void {
    window.location.href = this.auth.getOAuthUrl(provider);
  }

  async sendMagicLink(): Promise<void> {
    if (!this.magicLinkEmail) return;

    const success = await this.auth.sendMagicLink(this.magicLinkEmail);
    if (success) {
      this.magicLinkSent.set(true);
    }
  }
}
