import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { SpinnerComponent } from '../../../shared/components';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, SpinnerComponent],
  template: `
    <div class="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-950 px-4 py-12 transition-colors duration-500">
      
      <!-- Ambient Background Effects -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div class="absolute top-[20%] left-[50%] w-[50%] h-[50%] bg-primary-300/20 rounded-full blur-[120px] animate-pulse-slow -translate-x-1/2 dark:bg-primary-900/20"></div>
      </div>

      <div class="relative w-full max-w-md text-center animate-fade-in-up">
        
        <!-- Icon -->
        <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-xl shadow-primary-500/10 mb-8 animate-float dark:bg-gray-800">
          <span class="text-6xl">📧</span>
        </div>

        <div class="glass-panel rounded-3xl p-8 sm:p-10">
          <h1 class="text-3xl font-bold text-gray-900 mb-4 dark:text-white font-heading">
            {{ 'AUTH.VERIFY_EMAIL' | translate }}
          </h1>
          
          @if (auth.user(); as user) {
            <div class="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
              <p class="text-gray-600 dark:text-gray-400 mb-1">
                {{ 'AUTH.VERIFY_EMAIL_SENT' | translate }}
              </p>
              <p class="font-bold text-lg text-primary-600 dark:text-primary-400 break-all">
                {{ user.email }}
              </p>
            </div>
          } @else {
            <p class="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              {{ 'AUTH.VERIFY_EMAIL_SENT' | translate }}
            </p>
          }

          <div class="space-y-6">
            <button
              (click)="resendEmail()"
              [disabled]="auth.isLoading()"
              class="w-full btn-primary flex items-center justify-center gap-2 group"
            >
              @if (auth.isLoading()) {
                <app-spinner size="sm" containerClass="text-white" />
                <span>{{ 'common.loading' | translate }}</span>
              } @else {
                <span>{{ 'AUTH.RESEND_VERIFICATION' | translate }}</span>
                <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            </button>

            @if (resent) {
              <div class="p-3 bg-green-50 text-green-700 rounded-xl border border-green-100 flex items-center justify-center gap-2 animate-fade-in dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="font-medium">{{ 'AUTH.VERIFICATION_SENT' | translate }}</span>
              </div>
            }

            @if (auth.error()) {
              <p class="text-sm text-red-600 font-medium dark:text-red-400">{{ auth.error() }}</p>
            }

            <div class="pt-6 border-t border-gray-100 dark:border-gray-800">
              <a
                routerLink="/login"
                class="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-primary-600 transition-colors group dark:text-gray-400 dark:hover:text-primary-400"
              >
                <svg class="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {{ 'AUTH.LOGIN' | translate }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class VerifyEmailComponent {
  readonly auth = inject(AuthService);
  resent = false;

  async resendEmail(): Promise<void> {
    const success = await this.auth.resendVerificationEmail();
    if (success) {
      this.resent = true;
    }
  }
}
