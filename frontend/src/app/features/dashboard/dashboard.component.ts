import { Component, inject, OnInit, signal, computed, ViewChildren, QueryList, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { ProfileService } from '../../core/profile/profile.service';
import { RewardsService } from '../../core/rewards/rewards.service';
import { BunnyMascotComponent } from '../../shared/components/bunny-mascot/bunny-mascot.component';
import { CarrotCounterComponent } from '../../shared/components/carrot-counter/carrot-counter.component';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
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
    CarrotFeedComponent,
    HydrationTrackerComponent
  ],
  styles: [`
    .action-card, .metric-card, .schedule-item { opacity: 0; }
    .sidebar-open { transform: translateX(0) !important; }
    .bar-animate { animation: barGrow 0.8s ease-out forwards; }
    @keyframes barGrow { from { height: 0; } }
    .progress-ring { transition: stroke-dashoffset 0.5s ease-out; }
  `],
  template: `
    <div class="min-h-screen bg-[#fdf8f8] dark:bg-gray-950 transition-colors duration-300">

      <!-- Mobile sidebar overlay -->
      @if (sidebarOpen()) {
        <div
          class="fixed inset-0 bg-black/30 z-40 lg:hidden"
          (click)="sidebarOpen.set(false)"
          (keydown.enter)="sidebarOpen.set(false)"
          tabindex="0"
          role="button"
          aria-label="Close sidebar overlay"
        ></div>
      }

      <!-- Sidebar Navigation -->
      <aside
        class="fixed left-0 top-0 h-full w-72 flex flex-col p-6 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-100 dark:border-gray-800 z-50 transform -translate-x-full lg:translate-x-0 transition-transform duration-300"
        [class.sidebar-open]="sidebarOpen()"
      >
        <!-- Logo -->
        <div class="flex items-center gap-3 mb-8">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <img src="assets/logo.png" alt="Logo" class="w-6 h-6 object-contain brightness-0 invert" />
          </div>
          <span class="text-2xl font-bold text-primary-500 font-heading">VibeHealth</span>
        </div>

        <!-- User Profile Card -->
        @if (auth.user(); as user) {
          <div class="flex items-center gap-3 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl mb-8">
            <div class="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-800/50 flex items-center justify-center overflow-hidden">
              <app-bunny-mascot [mood]="'happy'" [size]="40" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-gray-900 dark:text-white truncate">{{ user.name || 'User' }} 🐰</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">{{ 'DASHBOARD.PREMIUM_MEMBER' | translate }}</p>
            </div>
          </div>
        }

        <!-- Navigation -->
        <nav class="flex-1 space-y-1">
          @for (item of navItems; track item.route) {
            <a
              [routerLink]="item.route"
              class="flex items-center gap-4 px-5 py-3.5 rounded-2xl font-medium text-sm transition-all duration-200 hover:translate-x-1"
              [class]="item.route === '/dashboard'
                ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                : 'text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400'"
            >
              <span class="text-xl">{{ item.icon }}</span>
              <span>{{ item.label | translate }}</span>
            </a>
          }
        </nav>

        <!-- Bottom CTA -->
        <button class="mt-auto w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-2xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all active:scale-[0.98]">
          {{ 'DASHBOARD.BOOK_CHECKUP' | translate }}
        </button>
      </aside>

      <!-- Main Content Area -->
      <div class="lg:ml-72">
        <!-- Top Header Bar -->
        <header class="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
          <div class="px-4 sm:px-8 py-4 flex items-center justify-between">
            <!-- Mobile menu button -->
            <button
              class="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              (click)="sidebarOpen.set(true)"
            >
              <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>

            <!-- Date & Weather (desktop) -->
            <div class="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-full text-sm">
              <span class="text-gray-500 dark:text-gray-400">📅</span>
              <span class="font-medium text-gray-600 dark:text-gray-300">{{ currentDate }}</span>
              <span class="mx-2 text-gray-300 dark:text-gray-600">|</span>
              <span>☀️</span>
              <span class="font-medium text-gray-600 dark:text-gray-300">{{ 'DASHBOARD.WEATHER_PLACEHOLDER' | translate }}</span>
            </div>

            <!-- Right side controls -->
            <div class="flex items-center gap-3">
              <button class="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </button>
              <button class="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full"></span>
              </button>
              <app-theme-toggle />
              <app-carrot-counter variant="mini" class="hidden sm:block" />
              <button
                (click)="auth.signOut()"
                class="hidden sm:flex items-center gap-2 pl-3 pr-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                @if (auth.user(); as user) {
                  <div class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                    <span class="text-sm">🐰</span>
                  </div>
                  <span class="text-sm font-bold text-gray-700 dark:text-gray-200">{{ (user.name || 'User').split(' ')[0] }}</span>
                }
              </button>
            </div>
          </div>
        </header>

        <!-- Banners -->
        @if (showOnboardingPrompt() && !dismissedOnboarding()) {
          <div class="bg-gradient-to-r from-primary-50 to-sage-50 dark:from-primary-900/20 dark:to-sage-900/20 border-b border-primary-100 dark:border-primary-800">
            <div class="px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12"><app-bunny-mascot [mood]="'wave'" [size]="48" /></div>
                <div>
                  <p class="text-sm font-bold text-gray-900 dark:text-white">{{ 'DASHBOARD.COMPLETE_PROFILE_TITLE' | translate }}</p>
                  <p class="text-xs text-gray-600 dark:text-gray-400">{{ 'DASHBOARD.COMPLETE_PROFILE_DESC' | translate }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <a routerLink="/onboarding" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white font-semibold text-sm shadow-lg shadow-primary-500/25 hover:bg-primary-600 transition-all">
                  {{ 'DASHBOARD.START_ONBOARDING' | translate }} →
                </a>
                <button (click)="dismissOnboarding()" class="p-2 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-800/50 transition-colors">
                  <svg class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
          </div>
        }

        @if (auth.user() && !auth.isEmailVerified() && !dismissedEmailBanner()) {
          <div class="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800">
            <div class="px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <span class="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-lg">⚠️</span>
                <p class="text-sm font-medium text-amber-900 dark:text-amber-100">{{ 'DASHBOARD.VERIFY_EMAIL_BANNER' | translate }}</p>
              </div>
              <div class="flex items-center gap-2">
                <button (click)="auth.resendVerificationEmail()" class="text-sm font-bold text-amber-700 dark:text-amber-300 hover:underline">
                  {{ 'AUTH.RESEND_VERIFICATION' | translate }}
                </button>
                <button (click)="dismissEmailBanner()" class="p-2 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-800/50 transition-colors">
                  <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Main Canvas -->
        <main class="px-4 sm:px-8 py-8 pb-24 space-y-10">

          <!-- Greeting Section -->
          <section class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="space-y-2">
              <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white font-heading tracking-tight">
                {{ greeting() }}, {{ (auth.user()?.name || 'Friend').split(' ')[0] }}! 🐰
              </h2>
              <p class="text-lg text-gray-500 dark:text-gray-400 font-medium">{{ 'DASHBOARD.GREETING_SUBTITLE' | translate }}</p>
            </div>

            <!-- Mascot Widget -->
            <div class="relative group hidden md:block">
              <div class="absolute -top-12 -right-2 bg-white dark:bg-gray-800 px-4 py-2.5 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 animate-bounce z-10">
                <p class="text-sm font-bold text-primary-500 italic">"{{ mascotMessage() }}"</p>
                <div class="absolute -bottom-2 right-6 w-4 h-4 bg-white dark:bg-gray-800 border-b border-r border-gray-100 dark:border-gray-700 rotate-45"></div>
              </div>
              <div class="w-32 h-32 bg-primary-50 dark:bg-primary-900/30 rounded-3xl flex items-center justify-center p-4 shadow-2xl shadow-primary-500/10 group-hover:scale-105 transition-transform cursor-pointer">
                <app-bunny-mascot [mood]="'happy'" [size]="96" />
              </div>
            </div>
          </section>

          <!-- Quick Actions -->
          <section class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            @for (action of quickActions; track action.label; let i = $index) {
              <button
                #actionCard
                (click)="handleQuickAction(action)"
                class="action-card group glass-panel p-6 sm:p-8 rounded-3xl flex flex-col items-center gap-4 hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl transition-all duration-300"
              >
                <div
                  class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl group-hover:scale-110 transition-transform"
                  [style.background]="action.bgColor"
                >{{ action.emoji }}</div>
                <span class="font-bold text-gray-900 dark:text-white text-sm sm:text-base font-heading">{{ action.label | translate }}</span>
              </button>
            }
          </section>

          <!-- Stats Grid -->
          <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Daily Activity (Circular Progress) -->
            <div #metricCard class="metric-card glass-panel p-8 rounded-3xl space-y-6">
              <div class="flex justify-between items-center">
                <span class="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{{ 'METRICS.DAILY_ACTIVITY' | translate }}</span>
                <div class="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-500">
                  🏃
                </div>
              </div>
              <div class="flex items-center gap-6">
                <!-- Circular Progress -->
                <div class="relative w-28 h-28">
                  <svg class="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                    <circle class="text-gray-100 dark:text-gray-800" cx="64" cy="64" r="56" fill="transparent" stroke="currentColor" stroke-width="12"/>
                    <circle
                      class="text-primary-500 progress-ring"
                      cx="64" cy="64" r="56"
                      fill="transparent"
                      stroke="currentColor"
                      stroke-width="12"
                      stroke-linecap="round"
                      [attr.stroke-dasharray]="351.8"
                      [attr.stroke-dashoffset]="351.8 * (1 - activityProgress() / 100)"
                    />
                  </svg>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <span class="text-2xl font-bold text-gray-900 dark:text-white font-heading">{{ activityProgress() }}%</span>
                  </div>
                </div>
                <div>
                  <p class="text-3xl font-bold text-gray-900 dark:text-white font-heading">{{ stepsToday().toLocaleString() }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">{{ 'METRICS.STEPS_GOAL' | translate:{ goal: '10k' } }}</p>
                </div>
              </div>
            </div>

            <!-- Heart Health -->
            <div #metricCard class="metric-card glass-panel p-8 rounded-3xl space-y-6">
              <div class="flex justify-between items-center">
                <span class="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{{ 'METRICS.HEART_HEALTH' | translate }}</span>
                <span class="text-2xl animate-pulse">❤️</span>
              </div>
              <div>
                <div class="flex items-baseline gap-2 mb-4">
                  <span class="text-4xl font-bold text-gray-900 dark:text-white font-heading">{{ heartRate() }}</span>
                  <span class="text-gray-500 dark:text-gray-400 font-medium">BPM</span>
                </div>
                <div class="h-16 w-full bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-end gap-1.5 px-3 pb-3">
                  @for (bar of heartBars; track $index) {
                    <div
                      class="flex-1 bg-red-400/40 rounded-full bar-animate"
                      [style.height.%]="bar"
                      [style.animation-delay.ms]="$index * 100"
                    ></div>
                  }
                </div>
              </div>
            </div>

            <!-- Sleep Quality -->
            <div #metricCard class="metric-card glass-panel p-8 rounded-3xl space-y-6">
              <div class="flex justify-between items-center">
                <span class="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{{ 'METRICS.SLEEP_QUALITY' | translate }}</span>
                <span class="text-2xl">🌙</span>
              </div>
              <div>
                <p class="text-4xl font-bold text-gray-900 dark:text-white font-heading mb-2">{{ sleepHours() }}h {{ sleepMinutes() }}m</p>
                <div class="flex items-center gap-2 mb-4">
                  <span class="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-full">{{ 'METRICS.EXCELLENT' | translate }}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">+12m vs {{ 'METRICS.YESTERDAY' | translate }}</span>
                </div>
                <div class="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div class="h-full bg-primary-500 rounded-full transition-all duration-500" [style.width.%]="sleepQuality()"></div>
                </div>
              </div>
            </div>
          </section>

          <!-- Weekly Trends + Schedule -->
          <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Weekly Trends Chart -->
            <div class="lg:col-span-2 glass-panel p-8 rounded-3xl">
              <div class="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div>
                  <h3 class="text-2xl font-bold text-gray-900 dark:text-white font-heading">{{ 'METRICS.WEEKLY_TRENDS' | translate }}</h3>
                  <p class="text-gray-500 dark:text-gray-400 font-medium mt-1">{{ 'METRICS.CONSISTENCY_KEY' | translate }}</p>
                </div>
                <select class="bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 px-4 py-2.5 cursor-pointer">
                  <option>{{ 'METRICS.LAST_7_DAYS' | translate }}</option>
                  <option>{{ 'METRICS.LAST_30_DAYS' | translate }}</option>
                </select>
              </div>

              <!-- Bar Chart -->
              <div class="h-64 relative w-full flex items-end justify-between px-2 gap-4">
                <div class="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-primary-500/5 to-transparent rounded-3xl"></div>
                @for (day of weeklyData; track day.day) {
                  <div class="flex-1 flex flex-col items-center gap-4">
                    <div
                      class="w-full max-w-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl relative cursor-pointer hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                      [style.height.%]="day.height"
                    >
                      <div
                        class="absolute bottom-0 w-full rounded-xl bar-animate"
                        [class]="day.isToday ? 'bg-primary-500 shadow-[0_0_20px_rgba(185,5,56,0.3)]' : 'bg-primary-400/60'"
                        [style.height.%]="day.fillPercent"
                        [style.animation-delay.ms]="$index * 100"
                      ></div>
                    </div>
                    <span class="text-sm font-bold" [class]="day.isToday ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'">{{ day.day }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Schedule -->
            <div class="glass-panel p-8 rounded-3xl">
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white font-heading">{{ 'DASHBOARD.SCHEDULE' | translate }}</h3>
                <button class="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-500 flex items-center justify-center hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                </button>
              </div>

              <div class="space-y-4">
                @for (item of scheduleItems; track item.title; let i = $index) {
                  <div #scheduleItem class="schedule-item flex gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" [style.background]="item.iconBg">
                      {{ item.icon }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-bold text-gray-900 dark:text-white text-sm">{{ item.title }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ item.subtitle }}</p>
                      <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">{{ item.time }}</p>
                    </div>
                    @if (item.status === 'done') {
                      <span class="self-start px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-full uppercase">{{ 'DASHBOARD.DONE' | translate }}</span>
                    }
                  </div>
                }
              </div>
            </div>
          </section>

          <!-- Activity Log (Horizontal) -->
          <section>
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white font-heading">{{ 'DASHBOARD.ACTIVITY_LOG' | translate }}</h3>
              <a routerLink="/journal" class="text-sm font-bold text-primary-500 hover:text-primary-600 transition-colors">
                {{ 'DASHBOARD.SEE_ALL_HISTORY' | translate }}
              </a>
            </div>

            <div class="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-8 sm:px-8 scrollbar-hide">
              @for (log of activityLogs; track log.title) {
                <div class="flex-shrink-0 flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 min-w-[260px]">
                  <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" [style.background]="log.iconBg">
                    {{ log.icon }}
                  </div>
                  <div>
                    <p class="font-bold text-gray-900 dark:text-white text-sm">{{ log.title }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ log.subtitle }}</p>
                  </div>
                </div>
              }
            </div>
          </section>

          <!-- Hydration & Carrots Row -->
          <section class="grid md:grid-cols-2 gap-6">
            <app-hydration-tracker />
            <app-carrot-feed />
          </section>

          <!-- Demo Button -->
          <div class="text-center">
            <button
              (click)="awardTestCarrots()"
              class="px-6 py-3 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-xl font-semibold text-sm hover:bg-orange-200 dark:hover:bg-orange-900/30 transition-all"
            >
              🥕 {{ 'DASHBOARD.TEST_EARN_CARROTS' | translate }}
            </button>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit, AfterViewInit {
  readonly auth = inject(AuthService);
  readonly profileService = inject(ProfileService);
  readonly rewards = inject(RewardsService);
  readonly translate = inject(TranslateService);
  readonly router = inject(Router);

  @ViewChildren('actionCard') actionCards!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('metricCard') metricCards!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('scheduleItem') scheduleItems_els!: QueryList<ElementRef<HTMLElement>>;

  // UI State
  showOnboardingPrompt = signal(false);
  sidebarOpen = signal(false);
  dismissedOnboarding = signal(false);
  dismissedEmailBanner = signal(false);

  // Mock metrics data (will be replaced with real data from MetricsService)
  activityProgress = signal(80);
  stepsToday = signal(8432);
  heartRate = signal(72);
  sleepHours = signal(7);
  sleepMinutes = signal(42);
  sleepQuality = signal(75);

  // Heart rate visualization bars
  heartBars = [50, 65, 75, 50, 100, 60, 40];

  // Computed greeting based on time of day
  greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return this.translate.instant('DASHBOARD.GOOD_MORNING');
    if (hour < 18) return this.translate.instant('DASHBOARD.GOOD_AFTERNOON');
    return this.translate.instant('DASHBOARD.GOOD_EVENING');
  });

  // Mascot messages
  private readonly mascotMessages = [
    'DASHBOARD.MASCOT_WATER',
    'DASHBOARD.MASCOT_STRETCH',
    'DASHBOARD.MASCOT_GREAT_JOB',
    'DASHBOARD.MASCOT_KEEP_GOING'
  ];
  mascotMessage = computed(() => {
    const msg = this.mascotMessages[Math.floor(Math.random() * this.mascotMessages.length)];
    return this.translate.instant(msg);
  });

  // Current date formatted
  currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Navigation items
  navItems = [
    { route: '/dashboard', icon: '🏠', label: 'nav.home' },
    { route: '/medical-id', icon: '💓', label: 'nav.vitals' },
    { route: '/first-aid', icon: '🧘', label: 'nav.wellness' },
    { route: '/medical-id', icon: '🏥', label: 'nav.medical' },
    { route: '/onboarding', icon: '👤', label: 'nav.profile' }
  ];

  // Quick actions
  quickActions = [
    { emoji: '🍎', label: 'DASHBOARD.LOG_MEAL', bgColor: 'rgba(255, 107, 107, 0.15)', route: '/nutrition' },
    { emoji: '💧', label: 'DASHBOARD.LOG_WATER', bgColor: 'rgba(96, 165, 250, 0.15)', action: 'logWater' },
    { emoji: '😊', label: 'DASHBOARD.LOG_MOOD', bgColor: 'rgba(74, 222, 128, 0.15)', route: '/journal' },
    { emoji: '🏃', label: 'DASHBOARD.START_WORKOUT', bgColor: 'rgba(255, 107, 107, 0.15)', route: '/activity' }
  ];

  // Weekly trend data
  weeklyData = [
    { day: 'Mon', height: 50, fillPercent: 75, isToday: false },
    { day: 'Tue', height: 65, fillPercent: 85, isToday: false },
    { day: 'Wed', height: 80, fillPercent: 100, isToday: false },
    { day: 'Thu', height: 60, fillPercent: 80, isToday: false },
    { day: 'Fri', height: 75, fillPercent: 92, isToday: true },
    { day: 'Sat', height: 45, fillPercent: 60, isToday: false },
    { day: 'Sun', height: 55, fillPercent: 70, isToday: false }
  ];

  // Schedule items
  scheduleItems = [
    { icon: '💊', iconBg: 'rgba(255, 107, 107, 0.15)', title: 'Morning Meds', subtitle: 'Omega-3 & Multivitamin', time: '09:00 AM', status: 'done' },
    { icon: '🦷', iconBg: 'rgba(197, 180, 227, 0.15)', title: 'Dental Cleaning', subtitle: 'BrightSmile Clinic', time: '02:30 PM', status: 'pending' },
    { icon: '💊', iconBg: 'rgba(184, 230, 212, 0.15)', title: 'Evening Supplement', subtitle: 'Magnesium', time: '09:00 PM', status: 'pending' }
  ];

  // Activity log
  activityLogs = [
    { icon: '🧘', iconBg: 'rgba(255, 107, 107, 0.15)', title: 'Morning Yoga', subtitle: '45 min • 240 kcal burned' },
    { icon: '🍽️', iconBg: 'rgba(255, 107, 107, 0.15)', title: 'Breakfast Logged', subtitle: 'Açaí Bowl • 420 kcal' },
    { icon: '🌙', iconBg: 'rgba(96, 165, 250, 0.15)', title: 'Sleep Sync', subtitle: 'Auto-recorded via Watch' },
    { icon: '💧', iconBg: 'rgba(96, 165, 250, 0.15)', title: 'Hydration Goal', subtitle: '8/8 glasses completed' }
  ];

  constructor() {
    // Load dismissed banner states from localStorage
    this.dismissedOnboarding.set(localStorage.getItem('vibehealth_dismissed_onboarding') === 'true');
    this.dismissedEmailBanner.set(localStorage.getItem('vibehealth_dismissed_email_banner') === 'true');
  }

  ngOnInit() {
    this.checkProfileStatus();
    this.rewards.logDailyActivity();
  }

  ngAfterViewInit() {
    this.animateElements();
  }

  private animateElements(): void {
    // Animate action cards
    if (this.actionCards?.length) {
      this.actionCards.forEach((el, i) => {
        animate(
          el.nativeElement,
          { opacity: [0, 1], transform: ['translateY(30px) scale(0.95)', 'translateY(0) scale(1)'] },
          { duration: 0.5, ease: 'easeOut', delay: i * 0.08 }
        );
      });
    }

    // Animate metric cards
    if (this.metricCards?.length) {
      this.metricCards.forEach((el, i) => {
        animate(
          el.nativeElement,
          { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0)'] },
          { duration: 0.5, ease: 'easeOut', delay: 0.3 + i * 0.1 }
        );
      });
    }

    // Animate schedule items
    if (this.scheduleItems_els?.length) {
      this.scheduleItems_els.forEach((el, i) => {
        animate(
          el.nativeElement,
          { opacity: [0, 1], transform: ['translateX(-20px)', 'translateX(0)'] },
          { duration: 0.4, ease: 'easeOut', delay: 0.5 + i * 0.1 }
        );
      });
    }
  }

  async checkProfileStatus() {
    await this.profileService.loadProfile();
    const hasProfile = this.profileService.hasProfile();
    this.showOnboardingPrompt.set(hasProfile === false);
  }

  handleQuickAction(action: { route?: string; action?: string }) {
    if (action.route) {
      this.router.navigate([action.route]);
    } else if (action.action === 'logWater') {
      // Quick water log action - will integrate with hydration service
      this.rewards.awardCarrots(1, 'Logged water! 💧', 'hydration');
    }
  }

  dismissOnboarding() {
    this.dismissedOnboarding.set(true);
    localStorage.setItem('vibehealth_dismissed_onboarding', 'true');
  }

  dismissEmailBanner() {
    this.dismissedEmailBanner.set(true);
    localStorage.setItem('vibehealth_dismissed_email_banner', 'true');
  }

  awardTestCarrots() {
    this.rewards.awardCarrots(5, 'Test reward! 🎉', 'bonus');
  }

  // Close sidebar on window resize to desktop
  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth >= 1024) {
      this.sidebarOpen.set(false);
    }
  }
}
