import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { ProfileService } from '../../core/profile/profile.service';
import { RewardsService } from '../../core/rewards/rewards.service';
import { BunnyMascotComponent } from '../../shared/components/bunny-mascot/bunny-mascot.component';
import { CarrotCounterComponent } from '../../shared/components/carrot-counter/carrot-counter.component';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';

type MoodEmoji = '😔' | '😕' | '😐' | '🙂' | '😊' | '🤩';

const MOOD_OPTIONS: { emoji: MoodEmoji; label: string; value: number }[] = [
  { emoji: '😔', label: 'Sad', value: 1 },
  { emoji: '😕', label: 'Low', value: 2 },
  { emoji: '😐', label: 'Okay', value: 3 },
  { emoji: '🙂', label: 'Good', value: 4 },
  { emoji: '😊', label: 'Great', value: 5 },
  { emoji: '🤩', label: 'Amazing', value: 6 },
];

const HYDRATION_GOAL = 8; // glasses per day
const HYDRATION_KEY = 'vibehealth_hydration';
const MOOD_KEY = 'vibehealth_today_mood';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslateModule,
    BunnyMascotComponent,
    CarrotCounterComponent,
    ThemeToggleComponent
  ],
  template: `
    <div class="relative min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500 overflow-hidden">

      <!-- Ambient Background -->
      <div class="fixed top-0 left-0 w-full h-full pointer-events-none" aria-hidden="true">
        <div class="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary-300/10 rounded-full blur-[120px] dark:bg-primary-900/10"></div>
        <div class="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-sage-300/10 rounded-full blur-[120px] dark:bg-sage-900/10"></div>
      </div>

      <!-- Header -->
      <header class="sticky top-0 z-50 glass-panel border-b border-gray-100 dark:border-gray-800 backdrop-blur-md">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <span class="text-2xl">🐰</span>
            </div>
            <h1 class="text-xl font-bold text-gray-900 tracking-tight dark:text-white font-heading">{{ 'app.title' | translate }}</h1>
          </div>

          <div class="flex items-center gap-3">
            <app-carrot-counter variant="mini" class="hidden sm:block" />
            <app-theme-toggle />
            <button
              (click)="auth.signOut()"
              class="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-95 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {{ 'AUTH.LOGOUT' | translate }}
            </button>
          </div>
        </div>
      </header>

      <!-- Onboarding prompt banner -->
      @if (showOnboardingPrompt()) {
        <div class="bg-gradient-to-r from-primary-50 to-sage-50 border-b border-primary-100 dark:from-primary-900/20 dark:to-sage-900/20 dark:border-primary-800">
          <div class="max-w-4xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10">
                <app-bunny-mascot [mood]="'wave'" [size]="40" />
              </div>
              <div>
                <p class="text-sm font-bold text-gray-900 dark:text-white">{{ 'DASHBOARD.COMPLETE_PROFILE' | translate }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400">{{ 'DASHBOARD.COMPLETE_PROFILE_DESC' | translate }}</p>
              </div>
            </div>
            <a
              routerLink="/onboarding"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white font-semibold text-sm shadow-lg shadow-primary-500/25 hover:bg-primary-600 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {{ 'DASHBOARD.START_ONBOARDING' | translate }} →
            </a>
          </div>
        </div>
      }

      <!-- Email verification banner -->
      @if (auth.user() && !auth.isEmailVerified()) {
        <div class="bg-amber-50 border-b border-amber-100 dark:bg-amber-900/20 dark:border-amber-800">
          <div class="max-w-4xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <span class="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center dark:bg-amber-900/50 dark:text-amber-400">⚠️</span>
              <p class="text-sm font-medium text-amber-900 dark:text-amber-100">{{ 'DASHBOARD.VERIFY_EMAIL_BANNER' | translate }}</p>
            </div>
            <button
              (click)="auth.resendVerificationEmail()"
              class="text-sm font-bold text-amber-700 hover:text-amber-900 underline decoration-amber-300 underline-offset-4 hover:decoration-amber-500 transition-colors dark:text-amber-300"
            >
              {{ 'AUTH.RESEND_VERIFICATION' | translate }}
            </button>
          </div>
        </div>
      }

      <!-- Main content -->
      <main class="relative max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-28 space-y-6">

        <!-- ═══════════════ GREETING + MASCOT ═══════════════ -->
        <div class="glass-panel rounded-3xl p-6 sm:p-8 animate-fade-in-up">
          <div class="flex items-center gap-6">
            <div class="relative flex-shrink-0">
              <app-bunny-mascot [mood]="rewards.bunnyMood()" [size]="72" />
              @if (rewards.streak() >= 3) {
                <div class="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-1 bg-amber-400 text-white rounded-full text-xs font-bold shadow-lg animate-bounce-gentle">
                  🔥 {{ rewards.streak() }}
                </div>
              }
            </div>
            <div class="flex-1">
              <div class="flex items-baseline gap-2 mb-1">
                <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-heading">
                  {{ greeting() }}
                  @if (auth.user()?.name) {
                    <span class="text-primary-500">, {{ auth.user()!.name!.split(' ')[0] }}</span>
                  }
                  !
                </h2>
              </div>
              <p class="text-gray-500 dark:text-gray-400 text-sm mb-4">{{ 'DASHBOARD.HOW_FEELING' | translate }}</p>

              <!-- Mood Quick-Log -->
              <div class="flex gap-1.5 flex-wrap">
                @for (mood of moodOptions; track mood.emoji) {
                  <button
                    (click)="logMood(mood.emoji)"
                    class="flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl border-2 transition-all duration-200 hover:scale-110 active:scale-95 min-w-[44px]"
                    [class]="todayMood() === mood.emoji
                      ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 shadow-md scale-110'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-200'"
                    [attr.title]="mood.label"
                  >
                    <span class="text-xl leading-none">{{ mood.emoji }}</span>
                  </button>
                }
                @if (moodJustLogged()) {
                  <span class="self-center text-xs text-sage-600 dark:text-sage-400 font-semibold animate-fade-in-up px-2">
                    {{ 'DASHBOARD.MOOD_LOGGED' | translate }}
                  </span>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- ═══════════════ 3-COLUMN STATS ═══════════════ -->
        <div class="grid grid-cols-3 gap-3">
          <!-- Streak card -->
          <div class="glass-panel rounded-2xl p-4 text-center">
            <div class="text-3xl mb-1">🔥</div>
            <div class="text-2xl font-bold text-gray-900 dark:text-white font-heading">{{ rewards.streak() }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 font-medium">{{ 'DASHBOARD.STREAK_DAYS' | translate }}</div>
          </div>

          <!-- Level card -->
          <div class="glass-panel rounded-2xl p-4 text-center">
            <div class="text-3xl mb-1">⭐</div>
            <div class="text-2xl font-bold text-gray-900 dark:text-white font-heading">{{ rewards.level() }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 font-medium">{{ 'REWARDS.LEVEL' | translate }}</div>
          </div>

          <!-- Carrots card -->
          <div class="glass-panel rounded-2xl p-4 text-center">
            <div class="text-3xl mb-1">🥕</div>
            <div class="text-2xl font-bold text-gray-900 dark:text-white font-heading">{{ rewards.carrots() }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 font-medium">{{ 'REWARDS.CARROTS' | translate }}</div>
          </div>
        </div>

        <!-- ═══════════════ HYDRATION TRACKER ═══════════════ -->
        <div class="glass-panel rounded-3xl p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white font-heading flex items-center gap-2">
                💧 {{ 'DASHBOARD.HYDRATION' | translate }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ hydrationGlasses() }}/{{ hydrationGoal }} {{ 'DASHBOARD.GLASSES' | translate }}</p>
            </div>
            <div class="flex items-center gap-2">
              @if (hydrationGlasses() >= hydrationGoal) {
                <span class="text-sm font-bold text-sage-600 dark:text-sage-400 animate-fade-in-up">{{ 'DASHBOARD.HYDRATION_COMPLETE' | translate }}</span>
              }
              <button
                (click)="addWater()"
                [disabled]="hydrationGlasses() >= hydrationGoal"
                class="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                [class]="hydrationGlasses() >= hydrationGoal ? 'bg-gray-100 text-gray-400 dark:bg-gray-800' : 'bg-blue-500 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-600'"
              >
                <span class="text-base">💧</span>
                {{ 'DASHBOARD.ADD_WATER' | translate }}
              </button>
            </div>
          </div>

          <!-- Animated water progress bar -->
          <div class="relative h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              class="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
              [style.width.%]="hydrationPercent()"
              [class]="hydrationGlasses() >= hydrationGoal
                ? 'bg-gradient-to-r from-sage-400 to-sage-500'
                : 'bg-gradient-to-r from-blue-400 to-blue-500'"
            ></div>
            <!-- Animated ripple at end of bar -->
            @if (hydrationPercent() > 0 && hydrationPercent() < 100) {
              <div
                class="absolute top-0 h-full w-4 bg-white/30 rounded-full blur-sm animate-shimmer"
                [style.left.%]="hydrationPercent() - 2"
              ></div>
            }
          </div>

          <!-- Glasses dots -->
          <div class="flex gap-1.5 mt-3 flex-wrap">
            @for (i of glassArray; track i) {
              <div
                class="flex-1 h-1.5 rounded-full min-w-[20px] transition-all duration-500"
                [class]="(i + 1) <= hydrationGlasses()
                  ? (hydrationGlasses() >= hydrationGoal ? 'bg-sage-500' : 'bg-blue-500')
                  : 'bg-gray-200 dark:bg-gray-700'"
              ></div>
            }
          </div>
        </div>

        <!-- ═══════════════ LEVEL PROGRESS BAR ═══════════════ -->
        <div class="glass-panel rounded-2xl px-6 py-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-bold text-gray-700 dark:text-gray-300">
              {{ 'REWARDS.LEVEL' | translate }} {{ rewards.level() }} → {{ rewards.level() + 1 }}
            </span>
            <span class="text-xs text-gray-400 font-medium">
              {{ rewards.carrots() }} / {{ rewards.nextLevelAt() }} 🥕
            </span>
          </div>
          <div class="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 rounded-full transition-all duration-1000 ease-out"
              [style.width.%]="rewards.levelProgress()"
            ></div>
          </div>
        </div>

        <!-- ═══════════════ QUICK ACTIONS GRID ═══════════════ -->
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white font-heading mb-4 px-1">{{ 'DASHBOARD.QUICK_ACTIONS' | translate }}</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">

            <!-- Medical ID -->
            <a
              routerLink="/medical-id"
              class="group relative glass-panel rounded-2xl p-5 flex flex-col items-center gap-3 transition-all duration-200 hover:scale-[1.03] hover:shadow-2xl hover:shadow-red-500/10 cursor-pointer text-center"
            >
              <div class="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-bold text-gray-900 dark:text-white font-heading leading-tight">{{ 'nav.medical_id' | translate }}</p>
                <p class="text-xs text-gray-400 mt-0.5 leading-tight hidden sm:block">{{ 'DASHBOARD.EMERGENCY_CARD' | translate }}</p>
              </div>
            </a>

            <!-- First Aid -->
            <a
              routerLink="/first-aid"
              class="group relative glass-panel rounded-2xl p-5 flex flex-col items-center gap-3 transition-all duration-200 hover:scale-[1.03] hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer text-center"
            >
              <div class="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🩹
              </div>
              <div>
                <p class="text-sm font-bold text-gray-900 dark:text-white font-heading leading-tight">{{ 'nav.first_aid' | translate }}</p>
                <p class="text-xs text-gray-400 mt-0.5 leading-tight hidden sm:block">{{ 'DASHBOARD.FIRST_AID_DESC' | translate }}</p>
              </div>
            </a>

            <!-- Journal -->
            <a
              routerLink="/journal"
              class="group relative glass-panel rounded-2xl p-5 flex flex-col items-center gap-3 transition-all duration-200 hover:scale-[1.03] hover:shadow-2xl hover:shadow-sage-500/10 cursor-pointer text-center"
            >
              <div class="absolute inset-0 bg-gradient-to-br from-sage-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-sage-400 to-sage-600 shadow-lg shadow-sage-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📓
              </div>
              <div>
                <p class="text-sm font-bold text-gray-900 dark:text-white font-heading leading-tight">{{ 'nav.journal' | translate }}</p>
                <p class="text-xs text-gray-400 mt-0.5 leading-tight hidden sm:block">{{ 'DASHBOARD.JOURNAL_DESC' | translate }}</p>
              </div>
            </a>

            <!-- Profile -->
            <a
              routerLink="/onboarding"
              class="group relative glass-panel rounded-2xl p-5 flex flex-col items-center gap-3 transition-all duration-200 hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary-500/10 cursor-pointer text-center"
            >
              <div class="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                👤
              </div>
              <div>
                <p class="text-sm font-bold text-gray-900 dark:text-white font-heading leading-tight">{{ 'nav.profile' | translate }}</p>
                <p class="text-xs text-gray-400 mt-0.5 leading-tight hidden sm:block">{{ 'DASHBOARD.EDIT_PROFILE' | translate }}</p>
              </div>
            </a>
          </div>
        </div>

        <!-- ═══════════════ RECENT REWARDS ═══════════════ -->
        @if (rewards.recentRewards().length > 0) {
          <div class="glass-panel rounded-3xl p-6">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white font-heading mb-4 flex items-center gap-2">
              🥕 {{ 'DASHBOARD.RECENT_ACTIVITY' | translate }}
            </h3>
            <div class="space-y-2">
              @for (reward of rewards.recentRewards().slice(0, 5); track reward.id) {
                <div class="flex items-center gap-3 py-2 px-3 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-900/20">
                  <span class="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-sm flex-shrink-0">🥕</span>
                  <span class="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">{{ reward.reason }}</span>
                  <span class="text-sm font-bold text-amber-600 dark:text-amber-400 flex-shrink-0">+{{ reward.amount }}</span>
                </div>
              }
            </div>
          </div>
        }

      </main>
    </div>
  `,
  styles: [`
    @keyframes bounce-gentle {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-3px) scale(1.05); }
    }
    .animate-bounce-gentle {
      animation: bounce-gentle 2s ease-in-out infinite;
    }
    @keyframes shimmer {
      0% { opacity: 0.3; }
      50% { opacity: 0.7; }
      100% { opacity: 0.3; }
    }
    .animate-shimmer {
      animation: shimmer 1.5s ease-in-out infinite;
    }
  `],
})
export class DashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly profileService = inject(ProfileService);
  readonly rewards = inject(RewardsService);
  private readonly translateService = inject(TranslateService);

  readonly showOnboardingPrompt = signal(false);
  readonly todayMood = signal<MoodEmoji | null>(null);
  readonly moodJustLogged = signal(false);
  readonly hydrationGlasses = signal(0);

  readonly hydrationGoal = HYDRATION_GOAL;
  readonly moodOptions = MOOD_OPTIONS;
  readonly glassArray = Array.from({ length: HYDRATION_GOAL }, (_, i) => i);

  readonly hydrationPercent = computed(() =>
    Math.min(100, (this.hydrationGlasses() / HYDRATION_GOAL) * 100)
  );

  readonly greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return this.translateService.instant('DASHBOARD.GOOD_MORNING');
    if (hour < 18) return this.translateService.instant('DASHBOARD.GOOD_AFTERNOON');
    return this.translateService.instant('DASHBOARD.GOOD_EVENING');
  });

  ngOnInit() {
    this.checkProfileStatus();
    this.rewards.logDailyActivity();
    this.loadTodayData();
  }

  async checkProfileStatus() {
    await this.profileService.loadProfile();
    this.showOnboardingPrompt.set(!this.profileService.hasProfile());
  }

  logMood(mood: MoodEmoji) {
    if (this.todayMood() === mood) return;
    this.todayMood.set(mood);
    const today = new Date().toDateString();
    localStorage.setItem(MOOD_KEY, JSON.stringify({ date: today, mood }));
    this.rewards.awardCarrots(2, `Mood logged ${mood}`, 'logging');
    this.moodJustLogged.set(true);
    setTimeout(() => this.moodJustLogged.set(false), 3000);
  }

  addWater() {
    if (this.hydrationGlasses() >= HYDRATION_GOAL) return;
    this.hydrationGlasses.update(v => v + 1);
    this.saveHydration();
    if (this.hydrationGlasses() === HYDRATION_GOAL) {
      this.rewards.awardCarrots(5, 'Hydration goal reached! 💧', 'milestone');
    } else {
      this.rewards.awardCarrots(1, 'Drank a glass of water 💧', 'logging');
    }
  }

  private loadTodayData() {
    const today = new Date().toDateString();

    // Load mood
    try {
      const moodData = JSON.parse(localStorage.getItem(MOOD_KEY) || 'null');
      if (moodData?.date === today) {
        this.todayMood.set(moodData.mood as MoodEmoji);
      }
    } catch { /* ignore */ }

    // Load hydration
    try {
      const hydData = JSON.parse(localStorage.getItem(HYDRATION_KEY) || 'null');
      if (hydData?.date === today) {
        this.hydrationGlasses.set(hydData.glasses || 0);
      }
    } catch { /* ignore */ }
  }

  private saveHydration() {
    const today = new Date().toDateString();
    localStorage.setItem(HYDRATION_KEY, JSON.stringify({ date: today, glasses: this.hydrationGlasses() }));
  }
}

