import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RewardsService } from '../../core/rewards/rewards.service';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import { BunnyMascotComponent } from '../../shared/components/bunny-mascot/bunny-mascot.component';
import { CarrotCounterComponent } from '../../shared/components/carrot-counter/carrot-counter.component';
import { CarrotFeedComponent } from '../../shared/components/carrot-feed/carrot-feed.component';
import {
  LucideFlame,
  LucideGem,
  LucideMedal,
  LucideSparkles,
  LucideTrophy,
} from '@lucide/angular';

type BadgeIcon = 'sparkles' | 'flame' | 'medal' | 'trophy' | 'gem';

interface AchievementBadge {
  id: string;
  labelKey: string;
  descriptionKey: string;
  icon: BadgeIcon;
  unlocked: boolean;
}

interface WeeklyBar {
  label: string;
  amount: number;
  height: number;
  isToday: boolean;
}

@Component({
  selector: 'app-rewards-page',
  imports: [
    CommonModule,
    TranslateModule,
    BackButtonComponent,
    BunnyMascotComponent,
    CarrotCounterComponent,
    CarrotFeedComponent,
    LucideFlame,
    LucideGem,
    LucideMedal,
    LucideSparkles,
    LucideTrophy,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 sm:px-6 lg:px-8 py-8 pb-24"
      data-testid="rewards-page"
    >
      <div class="max-w-6xl mx-auto space-y-6">
        <header class="flex flex-wrap items-center justify-between gap-4">
          <app-back-button [label]="'common.back_to_dashboard' | translate" [showLabel]="true" />

          <div class="text-right">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-heading">
              {{ 'REWARDS.TITLE' | translate }}
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {{ 'REWARDS.SUBTITLE' | translate }}
            </p>
          </div>
        </header>

        <section class="hero-card">
          <div class="hero-copy">
            <p class="hero-kicker">🐰 {{ 'REWARDS.HERO_TITLE' | translate }}</p>
            <h2 class="hero-title">{{ 'REWARDS.HERO_SUBTITLE' | translate }}</h2>

            <div class="hero-meta">
              <span class="meta-pill">
                <svg lucideTrophy [size]="16" [strokeWidth]="2"></svg>
                {{ 'STATS.LEVEL' | translate }} {{ rewards.level() }}
              </span>
              <span class="meta-pill">
                <svg lucideFlame [size]="16" [strokeWidth]="2"></svg>
                {{ rewards.streak() }} {{ 'REWARDS.DAYS' | translate }}
              </span>
            </div>
          </div>

          <div class="hero-visual">
            <app-bunny-mascot [mood]="rewards.bunnyMood()" [size]="96" />
            <app-carrot-counter variant="default" />
          </div>
        </section>

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section class="content-card xl:col-span-2">
            <div class="card-header">
              <h3 class="card-title">
                <span class="card-icon">🔥</span>
                {{ 'REWARDS.THIS_WEEK_PROGRESS' | translate }}
              </h3>
              <p class="card-subtitle">+{{ thisWeekTotal() }} {{ 'REWARDS.CARROTS' | translate }}</p>
            </div>

            <div class="week-chart" data-testid="weekly-progress-chart">
              @for (bar of weeklyBars(); track bar.label) {
                <div class="bar-group">
                  <div class="bar-track" [class.today]="bar.isToday">
                    <div class="bar-fill" [style.height.%]="bar.height"></div>
                  </div>
                  <span class="bar-label">{{ bar.label }}</span>
                  <span class="bar-value">{{ bar.amount }}</span>
                </div>
              }
            </div>

            @if (thisWeekTotal() === 0) {
              <p class="empty-week">{{ 'REWARDS.EMPTY_WEEK' | translate }}</p>
            }
          </section>

          <section class="content-card">
            <div class="card-header">
              <h3 class="card-title">
                <span class="card-icon" aria-hidden="true">
                  <svg lucideFlame [size]="18" [strokeWidth]="2"></svg>
                </span>
                {{ 'REWARDS.ACTIVE_STREAKS' | translate }}
              </h3>
            </div>

            <div class="streak-grid">
              <article class="streak-item">
                <p class="streak-label">{{ 'REWARDS.CURRENT_STREAK' | translate }}</p>
                <p class="streak-value">{{ rewards.streak() }}</p>
                <p class="streak-unit">{{ 'REWARDS.DAYS' | translate }}</p>
              </article>

              <article class="streak-item">
                <p class="streak-label">{{ 'REWARDS.LONGEST_STREAK' | translate }}</p>
                <p class="streak-value">{{ rewards.longestStreak() }}</p>
                <p class="streak-unit">{{ 'REWARDS.DAYS' | translate }}</p>
              </article>
            </div>
          </section>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section class="content-card xl:col-span-2">
            <div class="card-header">
              <h3 class="card-title">
                <span class="card-icon" aria-hidden="true">
                  <svg lucideMedal [size]="18" [strokeWidth]="2"></svg>
                </span>
                {{ 'REWARDS.ACHIEVEMENTS' | translate }}
              </h3>
              <p class="card-subtitle">
                {{ 'REWARDS.UNLOCKED_SUMMARY' | translate:{ unlocked: unlockedAchievementsCount(), total: achievements().length } }}
              </p>
            </div>

            <div class="achievement-grid" data-testid="achievements-grid">
              @for (badge of achievements(); track badge.id) {
                <article class="achievement-card" [class.locked]="!badge.unlocked" [class.unlocked]="badge.unlocked">
                  <span class="achievement-icon" aria-hidden="true">
                    @switch (badge.icon) {
                      @case ('sparkles') {
                        <svg lucideSparkles [size]="18" [strokeWidth]="2"></svg>
                      }
                      @case ('flame') {
                        <svg lucideFlame [size]="18" [strokeWidth]="2"></svg>
                      }
                      @case ('medal') {
                        <svg lucideMedal [size]="18" [strokeWidth]="2"></svg>
                      }
                      @case ('trophy') {
                        <svg lucideTrophy [size]="18" [strokeWidth]="2"></svg>
                      }
                      @case ('gem') {
                        <svg lucideGem [size]="18" [strokeWidth]="2"></svg>
                      }
                    }
                  </span>
                  <div>
                    <p class="achievement-title">{{ badge.labelKey | translate }}</p>
                    <p class="achievement-description">{{ badge.descriptionKey | translate }}</p>
                    @if (!badge.unlocked) {
                      <p class="achievement-lock">{{ 'REWARDS.LOCKED' | translate }}</p>
                    }
                  </div>
                </article>
              }
            </div>
          </section>

          <section class="content-card">
            <div class="card-header">
              <h3 class="card-title">
                <span class="card-icon" aria-hidden="true">🏁</span>
                {{ 'REWARDS.LEADERBOARD_TITLE' | translate }}
              </h3>
            </div>
            <p class="leaderboard-placeholder">{{ 'REWARDS.LEADERBOARD_DESC' | translate }}</p>
          </section>
        </div>

        <section class="content-card">
          <div class="card-header">
            <h3 class="card-title">
              <span class="card-icon" aria-hidden="true">🥕</span>
              {{ 'REWARDS.CARROT_HISTORY' | translate }}
            </h3>
          </div>

          <app-carrot-feed />
        </section>
      </div>
    </div>
  `,
  styles: [`
    .hero-card {
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      gap: 1.25rem;
      border-radius: 1.5rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, #fff7ed 0%, #ffffff 65%, #fff1f2 100%);
      border: 1px solid rgba(249, 115, 22, 0.18);
      box-shadow: 0 8px 30px rgba(249, 115, 22, 0.15);
    }

    .hero-copy {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      justify-content: center;
    }

    .hero-kicker {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 700;
      color: #c2410c;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    .hero-title {
      margin: 0;
      font-family: 'Satoshi', sans-serif;
      font-size: 1.5rem;
      line-height: 1.25;
      color: #2d3436;
      font-weight: 800;
    }

    .hero-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .meta-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.35rem 0.7rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.82);
      color: #7c2d12;
      border: 1px solid rgba(249, 115, 22, 0.2);
    }

    .hero-visual {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }

    .content-card {
      background: #ffffff;
      border: 1px solid rgba(148, 163, 184, 0.16);
      border-radius: 1.25rem;
      box-shadow: 0 4px 18px rgba(15, 23, 42, 0.06);
      padding: 1.15rem;
    }

    .card-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 0.9rem;
    }

    .card-title {
      margin: 0;
      font-size: 0.96rem;
      font-weight: 800;
      color: #111827;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }

    .card-subtitle {
      margin: 0;
      font-size: 0.78rem;
      color: #6b7280;
      font-weight: 600;
    }

    .card-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #ea580c;
    }

    .week-chart {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 0.5rem;
      align-items: end;
      min-height: 160px;
    }

    .bar-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }

    .bar-track {
      width: 100%;
      height: 108px;
      border-radius: 0.7rem;
      background: #fff1f2;
      border: 1px solid #fecdd3;
      display: flex;
      align-items: flex-end;
      padding: 0.2rem;
    }

    .bar-track.today {
      border-color: #fb923c;
      background: #ffedd5;
    }

    .bar-fill {
      width: 100%;
      border-radius: 0.5rem;
      min-height: 4px;
      background: linear-gradient(180deg, #fb923c 0%, #f97316 55%, #ea580c 100%);
      transition: height 0.35s ease;
    }

    .bar-label {
      font-size: 0.7rem;
      color: #6b7280;
      font-weight: 700;
      text-transform: uppercase;
    }

    .bar-value {
      font-size: 0.76rem;
      color: #111827;
      font-weight: 700;
    }

    .empty-week {
      margin: 0.7rem 0 0;
      font-size: 0.82rem;
      color: #6b7280;
    }

    .streak-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.7rem;
    }

    .streak-item {
      border-radius: 1rem;
      border: 1px solid #e2e8f0;
      background: linear-gradient(135deg, #fff7ed, #ffffff);
      padding: 0.9rem;
      text-align: center;
    }

    .streak-label {
      margin: 0;
      font-size: 0.72rem;
      color: #64748b;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .streak-value {
      margin: 0.25rem 0;
      font-size: 1.8rem;
      line-height: 1;
      font-weight: 800;
      color: #9a3412;
    }

    .streak-unit {
      margin: 0;
      font-size: 0.73rem;
      color: #7c2d12;
      font-weight: 600;
    }

    .achievement-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 0.6rem;
    }

    .achievement-card {
      display: flex;
      align-items: flex-start;
      gap: 0.7rem;
      border-radius: 0.9rem;
      padding: 0.8rem;
      border: 1px solid #fed7aa;
      background: linear-gradient(145deg, #fff7ed 0%, #ffffff 100%);
      transition: transform 0.2s ease;
    }

    .achievement-card.unlocked:hover {
      transform: translateY(-2px);
    }

    .achievement-card.locked {
      border-color: #e2e8f0;
      background: #f8fafc;
      opacity: 0.72;
    }

    .achievement-icon {
      width: 1.9rem;
      height: 1.9rem;
      border-radius: 0.55rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(249, 115, 22, 0.12);
      color: #c2410c;
      flex-shrink: 0;
    }

    .achievement-card.locked .achievement-icon {
      background: rgba(148, 163, 184, 0.15);
      color: #64748b;
    }

    .achievement-title {
      margin: 0;
      font-size: 0.84rem;
      font-weight: 700;
      color: #111827;
    }

    .achievement-description {
      margin: 0.15rem 0 0;
      font-size: 0.75rem;
      color: #64748b;
    }

    .achievement-lock {
      margin: 0.25rem 0 0;
      font-size: 0.68rem;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .leaderboard-placeholder {
      margin: 0;
      font-size: 0.85rem;
      color: #6b7280;
      line-height: 1.5;
    }

    :host-context(.dark) .hero-card {
      background: linear-gradient(135deg, rgba(249, 115, 22, 0.16) 0%, rgba(30, 41, 59, 0.88) 60%, rgba(244, 63, 94, 0.16) 100%);
      border-color: rgba(251, 146, 60, 0.35);
    }

    :host-context(.dark) .hero-kicker,
    :host-context(.dark) .hero-title,
    :host-context(.dark) .meta-pill,
    :host-context(.dark) .card-title,
    :host-context(.dark) .bar-value,
    :host-context(.dark) .achievement-title {
      color: #f8fafc;
    }

    :host-context(.dark) .card-subtitle,
    :host-context(.dark) .bar-label,
    :host-context(.dark) .empty-week,
    :host-context(.dark) .streak-label,
    :host-context(.dark) .streak-unit,
    :host-context(.dark) .achievement-description,
    :host-context(.dark) .leaderboard-placeholder,
    :host-context(.dark) .achievement-lock {
      color: #cbd5e1;
    }

    :host-context(.dark) .content-card {
      background: rgba(15, 23, 42, 0.75);
      border-color: rgba(148, 163, 184, 0.2);
    }

    :host-context(.dark) .bar-track {
      background: rgba(251, 146, 60, 0.2);
      border-color: rgba(251, 146, 60, 0.3);
    }

    :host-context(.dark) .bar-track.today {
      background: rgba(251, 146, 60, 0.3);
      border-color: rgba(251, 146, 60, 0.5);
    }

    :host-context(.dark) .streak-item {
      border-color: rgba(148, 163, 184, 0.35);
      background: rgba(30, 41, 59, 0.65);
    }

    :host-context(.dark) .achievement-card.unlocked {
      border-color: rgba(251, 146, 60, 0.45);
      background: rgba(251, 146, 60, 0.14);
    }

    :host-context(.dark) .achievement-card.locked {
      border-color: rgba(148, 163, 184, 0.22);
      background: rgba(30, 41, 59, 0.55);
    }

    @media (max-width: 960px) {
      .hero-card {
        grid-template-columns: 1fr;
      }

      .hero-visual {
        align-items: flex-start;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .bar-fill,
      .achievement-card {
        transition: none;
      }

      .achievement-card.unlocked:hover {
        transform: none;
      }
    }
  `],
})
export class RewardsPageComponent {
  readonly rewards = inject(RewardsService);

  readonly achievements = computed<AchievementBadge[]>(() => {
    const carrots = this.rewards.carrots();
    const streak = this.rewards.streak();
    const longestStreak = this.rewards.longestStreak();
    const level = this.rewards.level();

    return [
      {
        id: 'first-log',
        labelKey: 'REWARDS.BADGES.FIRST_LOG',
        descriptionKey: 'REWARDS.BADGES.FIRST_LOG_DESC',
        icon: 'sparkles',
        unlocked: carrots >= 1,
      },
      {
        id: 'three-day-streak',
        labelKey: 'REWARDS.BADGES.THREE_DAY_STREAK',
        descriptionKey: 'REWARDS.BADGES.THREE_DAY_STREAK_DESC',
        icon: 'flame',
        unlocked: streak >= 3,
      },
      {
        id: 'week-streak',
        labelKey: 'REWARDS.BADGES.WEEK_STREAK',
        descriptionKey: 'REWARDS.BADGES.WEEK_STREAK_DESC',
        icon: 'medal',
        unlocked: streak >= 7,
      },
      {
        id: 'level-3',
        labelKey: 'REWARDS.BADGES.LEVEL_THREE',
        descriptionKey: 'REWARDS.BADGES.LEVEL_THREE_DESC',
        icon: 'trophy',
        unlocked: level >= 3,
      },
      {
        id: 'level-5',
        labelKey: 'REWARDS.BADGES.LEVEL_FIVE',
        descriptionKey: 'REWARDS.BADGES.LEVEL_FIVE_DESC',
        icon: 'gem',
        unlocked: level >= 5,
      },
      {
        id: 'marathon',
        labelKey: 'REWARDS.BADGES.STREAK_MARATHON',
        descriptionKey: 'REWARDS.BADGES.STREAK_MARATHON_DESC',
        icon: 'medal',
        unlocked: longestStreak >= 30,
      },
    ];
  });

  readonly unlockedAchievementsCount = computed(() =>
    this.achievements().filter((badge) => badge.unlocked).length,
  );

  readonly weeklyBars = computed<WeeklyBar[]>(() => {
    const today = new Date();
    const buckets = Array.from({ length: 7 }, (_, offset) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - offset));

      return {
        dateKey: date.toDateString(),
        label: date.toLocaleDateString(undefined, { weekday: 'short' }),
        amount: 0,
        isToday: offset === 6,
      };
    });

    const byDate = new Map(buckets.map((bucket) => [bucket.dateKey, bucket]));

    for (const reward of this.rewards.recentRewards()) {
      const key = reward.earnedAt.toDateString();
      const target = byDate.get(key);
      if (target) {
        target.amount += reward.amount;
      }
    }

    const maxAmount = Math.max(1, ...buckets.map((bucket) => bucket.amount));

    return buckets.map((bucket) => ({
      label: bucket.label,
      amount: bucket.amount,
      isToday: bucket.isToday,
      height: Math.max(4, Math.round((bucket.amount / maxAmount) * 100)),
    }));
  });

  readonly thisWeekTotal = computed(() =>
    this.weeklyBars().reduce((sum, bar) => sum + bar.amount, 0),
  );
}
