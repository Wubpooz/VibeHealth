import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="relative min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500 overflow-hidden">
      
      <!-- Ambient Background -->
      <div class="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div class="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary-300/10 rounded-full blur-[120px] dark:bg-primary-900/10"></div>
        <div class="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-sage-300/10 rounded-full blur-[120px] dark:bg-sage-900/10"></div>
      </div>

      <!-- Header -->
      <header class="sticky top-0 z-50 glass-panel border-b border-gray-100 dark:border-gray-800 backdrop-blur-md">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <span class="text-2xl">🐰</span>
            </div>
            <h1 class="text-xl font-bold text-gray-900 tracking-tight dark:text-white font-heading">{{ 'app.title' | translate }}</h1>
          </div>
          
          <div class="flex items-center gap-6">
            @if (auth.user(); as user) {
              <div class="hidden sm:flex flex-col items-end">
                <span class="text-sm font-semibold text-gray-900 dark:text-white">
                  {{ user.name || user.email }}
                </span>
                <span class="text-xs text-gray-500 font-medium dark:text-gray-400">
                  {{ user.role || 'USER' }}
                </span>
              </div>
            }
            <button
              (click)="auth.signOut()"
              class="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-95 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              {{ 'AUTH.LOGOUT' | translate }}
            </button>
          </div>
        </div>
      </header>

      <!-- Email verification banner -->
      @if (auth.user() && !auth.isEmailVerified()) {
        <div class="bg-amber-50 border-b border-amber-100 dark:bg-amber-900/20 dark:border-amber-800">
          <div class="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <span class="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-lg dark:bg-amber-900/50 dark:text-amber-400">⚠️</span>
              <p class="text-sm font-medium text-amber-900 dark:text-amber-100">
                {{ 'DASHBOARD.VERIFY_EMAIL_BANNER' | translate }}
              </p>
            </div>
            <button
              (click)="auth.resendVerificationEmail()"
              class="text-sm font-bold text-amber-700 hover:text-amber-900 underline decoration-amber-300 underline-offset-4 hover:decoration-amber-500 transition-colors dark:text-amber-300 dark:hover:text-amber-100"
            >
              {{ 'AUTH.RESEND_VERIFICATION' | translate }}
            </button>
          </div>
        </div>
      }

      <!-- Main content -->
      <main class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <!-- Welcome Section -->
        <div class="glass-panel rounded-3xl p-8 sm:p-12 mb-12 animate-fade-in-up">
          <div class="max-w-3xl mx-auto text-center space-y-6">
            <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-50 text-4xl mb-2 animate-float dark:bg-primary-900/20">
              🎉
            </div>
            <h2 class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white font-heading leading-tight">
              {{ 'DASHBOARD.WELCOME' | translate }}
            </h2>
            <p class="text-xl text-gray-600 dark:text-gray-300">
              {{ 'DASHBOARD.SETUP_COMPLETE' | translate }}
            </p>

            @if (auth.user(); as user) {
              <div class="mt-8 bg-white/50 rounded-2xl p-6 border border-white/60 shadow-inner backdrop-blur-sm text-left max-w-lg mx-auto dark:bg-gray-800/50 dark:border-gray-700">
                <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 dark:text-white">
                  <span class="w-1 h-6 bg-primary-500 rounded-full"></span>
                  {{ 'DASHBOARD.YOUR_PROFILE' | translate }}
                </h3>
                <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                  <div>
                    <dt class="text-gray-500 font-medium mb-1 dark:text-gray-400">{{ 'AUTH.EMAIL' | translate }}</dt>
                    <dd class="text-gray-900 font-semibold truncate dark:text-white">{{ user.email }}</dd>
                  </div>
                  @if (user.name) {
                    <div>
                      <dt class="text-gray-500 font-medium mb-1 dark:text-gray-400">{{ 'AUTH.NAME' | translate }}</dt>
                      <dd class="text-gray-900 font-semibold dark:text-white">{{ user.name }}</dd>
                    </div>
                  }
                  <div>
                    <dt class="text-gray-500 font-medium mb-1 dark:text-gray-400">{{ 'DASHBOARD.EMAIL_VERIFIED' | translate }}</dt>
                    <dd class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                      [ngClass]="user.emailVerified ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'">
                      {{ user.emailVerified ? 'Verified' : 'Unverified' }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-gray-500 font-medium mb-1 dark:text-gray-400">{{ 'DASHBOARD.ROLE' | translate }}</dt>
                    <dd class="text-gray-900 font-semibold dark:text-white">{{ user.role || 'USER' }}</dd>
                  </div>
                </dl>
              </div>
            }
          </div>
        </div>

        <!-- Future Features Grid -->
        <h3 class="text-2xl font-bold text-gray-900 mb-6 px-2 dark:text-white font-heading">Coming Soon</h3>
        <div class="grid md:grid-cols-3 gap-6">
          <!-- Card 1 -->
          <div class="group relative glass-panel rounded-3xl p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary-500/10 opacity-75 hover:opacity-100">
            <div class="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative z-10">
              <div class="w-14 h-14 rounded-2xl bg-white shadow-lg shadow-gray-200/50 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform dark:bg-gray-800 dark:shadow-none">
                💊
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-2 dark:text-white font-heading">{{ 'nav.medical_id' | translate }}</h3>
              <p class="text-gray-500 font-medium dark:text-gray-400">Essential medical data at your fingertips.</p>
              <div class="mt-6 flex items-center text-sm font-bold text-primary-600 dark:text-primary-400">
                Phase 0.5
                <svg class="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Card 2 -->
          <div class="group relative glass-panel rounded-3xl p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-sage-500/10 opacity-75 hover:opacity-100">
            <div class="absolute inset-0 bg-gradient-to-br from-sage-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative z-10">
              <div class="w-14 h-14 rounded-2xl bg-white shadow-lg shadow-gray-200/50 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform dark:bg-gray-800 dark:shadow-none">
                📋
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-2 dark:text-white font-heading">Onboarding</h3>
              <p class="text-gray-500 font-medium dark:text-gray-400">Personalized setup for your health goals.</p>
              <div class="mt-6 flex items-center text-sm font-bold text-sage-600 dark:text-sage-400">
                Phase 0.3
                <svg class="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Card 3 -->
          <div class="group relative glass-panel rounded-3xl p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10 opacity-75 hover:opacity-100">
            <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative z-10">
              <div class="w-14 h-14 rounded-2xl bg-white shadow-lg shadow-gray-200/50 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform dark:bg-gray-800 dark:shadow-none">
                🩹
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-2 dark:text-white font-heading">First Aid Guide</h3>
              <p class="text-gray-500 font-medium dark:text-gray-400">Quick access to emergency instructions.</p>
              <div class="mt-6 flex items-center text-sm font-bold text-blue-600 dark:text-blue-400">
                Phase 0.8
                <svg class="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
})
export class DashboardComponent {
  readonly auth = inject(AuthService);
}
