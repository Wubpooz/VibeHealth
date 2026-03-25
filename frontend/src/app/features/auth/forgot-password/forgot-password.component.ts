import { ChangeDetectionStrategy, Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/toast/toast.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule, SpinnerComponent, BackButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    @keyframes checkmark-scale {
      0% { transform: scale(0) rotate(-45deg); opacity: 0; }
      50% { transform: scale(1.2) rotate(0deg); }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    
    .animate-checkmark {
      animation: checkmark-scale 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
    }
    
    @keyframes fade-out-up {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-20px);
      }
    }
    
    .animate-fade-out-up {
      animation: fade-out-up 0.4s ease-out forwards;
    }
  `],
  template: `
    <div class="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-950 px-4 py-12 transition-colors duration-500">

      <div class="absolute top-4 left-4 z-10">
        <app-back-button />
      </div>

      <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-300/20 rounded-full blur-[100px] animate-pulse-slow dark:bg-primary-900/20"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sage-300/20 rounded-full blur-[100px] animate-pulse-slow delay-1000 dark:bg-sage-900/20"></div>
      </div>

      <div class="relative w-full max-w-md animate-fade-in-up">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-xl shadow-primary-500/10 mb-6 animate-float dark:bg-gray-800">
            <span class="text-4xl">🔐</span>
          </div>
          <h1 class="text-4xl font-bold tracking-tight text-gray-900 mb-3 dark:text-white font-heading">
            {{ 'AUTH.FORGOT_PASSWORD_TITLE' | translate }}
          </h1>
          <p class="text-lg text-gray-500 font-medium dark:text-gray-400">
            {{ 'AUTH.FORGOT_PASSWORD_DESC' | translate }}
          </p>
        </div>

        <div class="glass-panel rounded-3xl p-8 sm:p-10">
          @if (auth.error() && !showSuccessState()) {
            <div class="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-start gap-3 animate-fade-in dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              {{ auth.error() }}
            </div>
          }

          <!-- STEP 1: Send Email -->
          @if (!stepTwo()) {
            <form class="space-y-5 transition-all duration-300" [class.animate-fade-out-up]="showSuccessState()">
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
                  [disabled]="showSuccessState()"
                  class="input-field transition-opacity"
                  [class.opacity-50]="showSuccessState()"
                  placeholder="you@example.com"
                  autocomplete="email"
                />
              </div>

              <button
                type="button"
                (click)="requestResetOtp()"
                [disabled]="auth.isLoading() || !email.trim() || showSuccessState()"
                class="w-full btn-primary flex items-center justify-center gap-2 group relative h-12 overflow-hidden"
              >
                @if (showSuccessState()) {
                  <!-- Checkmark animation -->
                  <svg class="w-6 h-6 text-white animate-checkmark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                } @else if (auth.isLoading()) {
                  <app-spinner size="sm" containerClass="text-white" />
                  <span>{{ 'common.loading' | translate }}</span>
                } @else {
                  <span>{{ 'AUTH.SEND_RESET_CODE' | translate }}</span>
                }
              </button>

              <div class="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800 text-center">
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
            </form>
          }

          <!-- STEP 2: OTP + Password Reset -->
          @if (stepTwo()) {
            <form (ngSubmit)="resetPassword()" class="space-y-5 animate-fade-in-up">
              <div class="space-y-2">
                <label for="otp" class="block text-sm font-semibold text-gray-700 ml-1 dark:text-gray-300">
                  {{ 'AUTH.RESET_CODE' | translate }}
                </label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  [(ngModel)]="otp"
                  required
                  inputmode="numeric"
                  autocomplete="one-time-code"
                  class="input-field text-center tracking-[0.35em] text-lg font-semibold"
                  placeholder="000000"
                  (input)="otp = otp.replace(/[^0-9]/g, '').slice(0, 6)"
                />
              </div>

              <div class="space-y-2">
                <label for="newPassword" class="block text-sm font-semibold text-gray-700 ml-1 dark:text-gray-300">
                  {{ 'AUTH.NEW_PASSWORD' | translate }}
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  [(ngModel)]="newPassword"
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
                  {{ 'AUTH.CONFIRM_PASSWORD' | translate }}
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
                @if (confirmPassword && newPassword !== confirmPassword) {
                  <p class="text-xs text-red-500 font-medium ml-1">{{ 'AUTH.PASSWORDS_NOT_MATCH' | translate }}</p>
                }
              </div>

              <button
                type="submit"
                [disabled]="auth.isLoading() || !canSubmit()"
                class="w-full btn-primary flex items-center justify-center gap-2 group"
              >
                @if (auth.isLoading()) {
                  <app-spinner size="sm" containerClass="text-white" />
                  <span>{{ 'common.loading' | translate }}</span>
                } @else {
                  <span>{{ 'AUTH.RESET_PASSWORD' | translate }}</span>
                }
              </button>

              <button
                type="button"
                (click)="goBackToEmail()"
                [disabled]="auth.isLoading()"
                class="w-full btn-secondary"
              >
                {{ 'AUTH.CHANGE_EMAIL' | translate }}
              </button>
            </form>
          }
        </div>
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  email = '';
  otp = '';
  newPassword = '';
  confirmPassword = '';
  
  readonly stepTwo = signal(false);
  readonly showSuccessState = signal(false);

  constructor() {
    // Auto-transition to step 2 after showing checkmark
    effect(() => {
      if (this.showSuccessState()) {
        setTimeout(() => {
          this.stepTwo.set(true);
          this.showSuccessState.set(false);
        }, 1200);
      }
    });
  }

  canSubmit(): boolean {
    return !!(
      this.otp.trim().length >= 6 &&
      this.newPassword &&
      this.newPassword.length >= 8 &&
      this.newPassword === this.confirmPassword
    );
  }

  async requestResetOtp(): Promise<void> {
    const targetEmail = this.email.trim();
    if (!targetEmail) return;

    const success = await this.auth.requestPasswordResetOtp(targetEmail);
    if (success) {
      // Show checkmark animation
      this.showSuccessState.set(true);
      this.toast.success('Password reset code sent to your email.', 'Email sent');
    } else if (this.auth.error()) {
      this.toast.error(this.auth.error()!, 'Unable to send reset code');
    }
  }

  async resetPassword(): Promise<void> {
    if (!this.canSubmit()) return;

    const success = await this.auth.resetPasswordWithOtp(
      this.email.trim(),
      this.otp.trim(),
      this.newPassword,
    );

    if (success) {
      this.toast.success('Password reset successful. You can now sign in.', 'Password updated');
      this.router.navigate(['/login']);
      return;
    }

    if (this.auth.error()) {
      this.toast.error(this.auth.error()!, 'Unable to reset password');
    }
  }

  goBackToEmail(): void {
    this.stepTwo.set(false);
    this.otp = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }
}
