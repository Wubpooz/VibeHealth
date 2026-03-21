import { Component, inject, OnInit, signal, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { ProfileService } from '../../core/profile/profile.service';
import { RewardsService } from '../../core/rewards/rewards.service';
import { BunnyMascotComponent } from '../../shared/components/bunny-mascot/bunny-mascot.component';
import { CarrotCounterComponent } from '../../shared/components/carrot-counter/carrot-counter.component';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { StatsGridComponent } from '../../shared/components/stats-grid/stats-grid.component';
import { CarrotFeedComponent } from '../../shared/components/carrot-feed/carrot-feed.component';
import { HydrationTrackerComponent } from '../metrics/hydration-tracker.component';
import { animate } from 'motion/mini';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule, 
    RouterLink, 
    TranslateModule, 
    BunnyMascotComponent, 
    CarrotCounterComponent,
    ThemeToggleComponent,
    StatsGridComponent,
    CarrotFeedComponent,
    HydrationTrackerComponent
  ],
  styles: [`
    /* Initial state for Motion.dev animations - start invisible */
    .action-card {
      opacity: 0;
    }
  `],
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
              <img src="assets/logo.png" alt="VibeHealth Logo" class="w-6 h-6 object-contain" />
            </div>
            <h1 class="text-xl font-bold text-gray-900 tracking-tight dark:text-white font-heading">{{ 'app.title' | translate }}</h1>
          </div>
          
          <div class="flex items-center gap-4">
            <!-- Carrot Counter -->
            <app-carrot-counter variant="mini" class="hidden sm:block" />
            
            <!-- Theme Toggle -->
            <app-theme-toggle />
            
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

      <!-- Onboarding prompt banner -->
      @if (showOnboardingPrompt()) {
        <div class="bg-gradient-to-r from-primary-50 to-sage-50 border-b border-primary-100 dark:from-primary-900/20 dark:to-sage-900/20 dark:border-primary-800">
          <div class="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12">
                <app-bunny-mascot [mood]="'wave'" [size]="48" />
              </div>
              <div>
                <p class="text-sm font-bold text-gray-900 dark:text-white">{{ 'DASHBOARD.COMPLETE_PROFILE_TITLE' | translate }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400">{{ 'DASHBOARD.COMPLETE_PROFILE_DESC' | translate }}</p>
              </div>
            </div>
            <a
              routerLink="/onboarding"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white font-semibold text-sm shadow-lg shadow-primary-500/25 hover:bg-primary-600 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {{ 'DASHBOARD.START_ONBOARDING' | translate }}
              <span>→</span>
            </a>
          </div>
        </div>
      }

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
      <main class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
        
        <!-- Stats & Activity Row -->
        <div class="grid lg:grid-cols-3 gap-6 mb-12">
          <!-- Stats Grid (spans 2 columns on large screens) -->
          <div class="lg:col-span-2">
            <app-stats-grid />
          </div>
          
          <!-- Carrot Activity Feed -->
          <div class="lg:col-span-1">
            <app-carrot-feed />
          </div>
        </div>

        <!-- Quick Actions Grid -->
        <h3 class="text-2xl font-bold text-gray-900 mb-6 px-2 dark:text-white font-heading">{{ 'DASHBOARD.QUICK_ACTIONS' | translate }}</h3>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <!-- Medical ID Card -->
          <a 
            #actionCard
            routerLink="/medical-id"
            class="action-card group relative glass-panel rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/10 cursor-pointer"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative z-10">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform text-white">
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <h3 class="text-base font-bold text-gray-900 mb-1 dark:text-white font-heading">{{ 'nav.medical_id' | translate }}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ 'DASHBOARD.QUICK_MEDICAL_ID_DESC' | translate }}</p>
            </div>
          </a>

          <!-- First Aid Card -->
          <a 
            #actionCard
            routerLink="/first-aid"
            class="action-card group relative glass-panel rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-500/10 cursor-pointer"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative z-10">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform text-white">
                🩹
              </div>
              <h3 class="text-base font-bold text-gray-900 mb-1 dark:text-white font-heading">{{ 'nav.first_aid' | translate }}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ 'DASHBOARD.QUICK_FIRST_AID_DESC' | translate }}</p>
            </div>
          </a>

          <!-- Journal Card -->
          <a 
            #actionCard
            routerLink="/onboarding"
            class="action-card group relative glass-panel rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10 cursor-pointer"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative z-10">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/30 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform text-white">
                📔
              </div>
              <h3 class="text-base font-bold text-gray-900 mb-1 dark:text-white font-heading">{{ 'nav.journal' | translate }}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ 'DASHBOARD.QUICK_JOURNAL_DESC' | translate }}</p>
            </div>
          </a>

          <!-- Profile Card -->
          <a 
            #actionCard
            routerLink="/onboarding"
            class="action-card group relative glass-panel rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-sage-500/10 cursor-pointer"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-sage-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative z-10">
              <div class="w-12 h-12 rounded-xl bg-white shadow-lg shadow-gray-200/50 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform dark:bg-gray-800 dark:shadow-none">
                👤
              </div>
              <h3 class="text-base font-bold text-gray-900 mb-1 dark:text-white font-heading">{{ 'nav.profile' | translate }}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ 'DASHBOARD.QUICK_PROFILE_DESC' | translate }}</p>
            </div>
          </a>
        </div>

        <!-- Health Metrics Section -->
        <h3 class="text-2xl font-bold text-gray-900 mb-6 px-2 dark:text-white font-heading">{{ 'METRICS.TITLE' | translate }}</h3>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <!-- Hydration Tracker -->
          <app-hydration-tracker />
          
          <!-- Placeholder for future vitals cards -->
          <div class="glass-panel rounded-3xl p-8 flex flex-col items-center justify-center text-center opacity-60">
            <div class="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl mb-4 dark:bg-gray-800">
              ❤️
            </div>
            <h4 class="font-bold text-gray-900 mb-2 dark:text-white">{{ 'METRICS.VITALS.TITLE' | translate }}</h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ 'DASHBOARD.COMING_SOON' | translate }}</p>
          </div>
          
          <div class="glass-panel rounded-3xl p-8 flex flex-col items-center justify-center text-center opacity-60">
            <div class="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl mb-4 dark:bg-gray-800">
              📊
            </div>
            <h4 class="font-bold text-gray-900 mb-2 dark:text-white">{{ 'METRICS.TRENDS' | translate }}</h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ 'DASHBOARD.COMING_SOON' | translate }}</p>
          </div>
        </div>

        <!-- Demo: Award Carrots Button -->
        <div class="text-center mb-8">
          <button 
            (click)="awardTestCarrots()"
            class="px-6 py-3 bg-orange-100 text-orange-700 rounded-xl font-semibold text-sm hover:bg-orange-200 transition-all dark:bg-orange-900/20 dark:text-orange-400"
          >
            🥕 {{ 'DASHBOARD.TEST_EARN_CARROTS' | translate }}
          </button>
        </div>
      </main>
    </div>
  `,
})
export class DashboardComponent implements OnInit, AfterViewInit {
  readonly auth = inject(AuthService);
  readonly profileService = inject(ProfileService);
  readonly rewards = inject(RewardsService);
  
  @ViewChildren('actionCard') actionCards!: QueryList<ElementRef<HTMLElement>>;
  
  showOnboardingPrompt = signal(false);
  
  ngOnInit() {
    this.checkProfileStatus();
    // Log daily activity for streak
    this.rewards.logDailyActivity();
  }
  
  ngAfterViewInit() {
    // Animate action cards with staggered entrance using Motion.dev
    this.animateActionCards();
  }
  
  private animateActionCards(): void {
    if (this.actionCards?.length) {
      // Motion/mini staggered entrance animation with CSS transforms
      this.actionCards.forEach((el, i) => {
        animate(
          el.nativeElement,
          { opacity: [0, 1], transform: ['translateY(30px) scale(0.95)', 'translateY(0) scale(1)'] },
          { duration: 0.5, ease: 'easeOut', delay: i * 0.1 }
        );
      });
    }
  }
  
  async checkProfileStatus() {
    await this.profileService.loadProfile();
    // Show onboarding prompt if user hasn't completed their profile
    // hasProfile() returns null initially, false if no profile, true if profile exists
    const hasProfile = this.profileService.hasProfile();
    this.showOnboardingPrompt.set(hasProfile === false);
  }
  
  awardTestCarrots() {
    this.rewards.awardCarrots(5, 'Test reward! 🎉', 'bonus');
  }
}
