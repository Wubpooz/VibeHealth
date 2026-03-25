import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RewardsService } from '../../../core/rewards/rewards.service';
import { AuthService } from '../../../core/auth/auth.service';
import { LucideCarrot } from '@lucide/angular';

@Component({
  selector: 'app-stats-grid',
  imports: [CommonModule, TranslateModule, LucideCarrot],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stats-container">
      <!-- Time-of-day Greeting -->
      <div class="greeting-section">
        <span class="greeting-emoji">{{ greetingEmoji() }}</span>
        <div class="greeting-text">
          <h2 class="greeting">{{ greetingKey() | translate }}, {{ userName() || ('STATS.THERE' | translate) }}!</h2>
          <p class="greeting-subtitle">{{ greetingSubtitleKey() | translate }}</p>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <!-- Streak -->
        <div class="stat-card streak-card">
          <div class="stat-icon">🔥</div>
          <div class="stat-content">
            <span class="stat-value">{{ rewards.streak() }}</span>
            <span class="stat-label">{{ 'STATS.DAY_STREAK' | translate }}</span>
          </div>
          @if (rewards.streak() >= 3) {
            <div class="stat-badge">{{ streakBadge() }}</div>
          }
        </div>

        <!-- Level -->
        <div class="stat-card level-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            <span class="stat-value">{{ rewards.level() }}</span>
            <span class="stat-label">{{ 'STATS.LEVEL' | translate }}</span>
          </div>
        </div>

        <!-- Carrots -->
        <div class="stat-card carrot-card" (mouseenter)="carrotHover.set(true)" (mouseleave)="carrotHover.set(false)">
          <div class="stat-icon">
            <svg lucideCarrot [size]="28" [strokeWidth]="2" [color]="carrotHover() ? '#ff6b6b' : '#f09a52'" [class.animated]="$any(carrotHover())"></svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ rewards.carrots() }}</span>
            <span class="stat-label">{{ 'STATS.CARROTS' | translate }}</span>
          </div>
        </div>
      </div>

      <!-- XP Progress Bar -->
      <div class="xp-section">
        <div class="xp-header">
          <span class="xp-label">{{ 'STATS.LEVEL_PROGRESS' | translate }}</span>
          <span class="xp-numbers">
            {{ rewards.carrots() }} / {{ rewards.nextLevelAt() }} 🥕
          </span>
        </div>
        <div class="xp-bar-bg">
          <div 
            class="xp-bar-fill" 
            [style.width.%]="rewards.levelProgress()"
          >
            <div class="xp-bar-shine"></div>
          </div>
        </div>
        <p class="xp-hint">
          {{ carrotsToNextLevel() }} {{ 'STATS.TO_NEXT_LEVEL' | translate }}
        </p>
      </div>
    </div>
  `,
  styles: [`
    .stats-container {
      background: linear-gradient(135deg, #fff5f2 0%, #ffffff 100%);
      border-radius: 1.5rem;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(255, 107, 107, 0.08);
      border: 1px solid rgba(255, 107, 107, 0.1);
    }

    .greeting-section {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255, 107, 107, 0.1);
    }

    .greeting-emoji {
      font-size: 2.5rem;
      animation: wave 2s ease-in-out infinite;
    }

    @keyframes wave {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(20deg); }
      75% { transform: rotate(-10deg); }
    }

    .greeting-text {
      flex: 1;
    }

    .greeting {
      font-family: 'Satoshi', sans-serif;
      font-weight: 700;
      font-size: 1.5rem;
      color: #2d3436;
      margin: 0;
      line-height: 1.2;
    }

    .greeting-subtitle {
      font-family: 'Satoshi', sans-serif;
      font-size: 0.875rem;
      color: #636e72;
      margin: 0.25rem 0 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem 0.5rem;
      background: white;
      border-radius: 1rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .stat-icon {
      font-size: 1.75rem;
      margin-bottom: 0.5rem;
    }

    .lucide-carrot.animated {
      transform: translateY(-3px) scale(1.15);
      transition: transform 0.25s ease;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .stat-value {
      font-family: 'Satoshi', sans-serif;
      font-weight: 700;
      font-size: 1.5rem;
      color: #2d3436;
      line-height: 1;
    }

    .stat-label {
      font-family: 'Satoshi', sans-serif;
      font-size: 0.625rem;
      font-weight: 600;
      color: #636e72;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 0.25rem;
    }

    .stat-badge {
      position: absolute;
      top: -0.25rem;
      right: -0.25rem;
      font-size: 0.875rem;
    }

    .streak-card {
      background: linear-gradient(135deg, #fff5f0 0%, #ffffff 100%);
    }

    .level-card {
      background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
    }

    .carrot-card {
      background: linear-gradient(135deg, #fef3e2 0%, #ffffff 100%);
    }

    .xp-section {
      background: white;
      border-radius: 1rem;
      padding: 1rem;
    }

    .xp-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .xp-label {
      font-family: 'Satoshi', sans-serif;
      font-size: 0.75rem;
      font-weight: 600;
      color: #636e72;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .xp-numbers {
      font-family: 'Satoshi', sans-serif;
      font-size: 0.875rem;
      font-weight: 700;
      color: #2d3436;
    }

    .xp-bar-bg {
      height: 0.75rem;
      background: #f1f3f4;
      border-radius: 0.5rem;
      overflow: hidden;
    }

    .xp-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #ff6b6b 0%, #ffa07a 50%, #ffcc80 100%);
      border-radius: 0.5rem;
      position: relative;
      transition: width 0.5s ease;
      min-width: 0.75rem;
    }

    .xp-bar-shine {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 50%;
      background: linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%);
      border-radius: 0.5rem 0.5rem 0 0;
    }

    .xp-hint {
      font-family: 'Satoshi', sans-serif;
      font-size: 0.75rem;
      color: #b2bec3;
      margin: 0.5rem 0 0;
      text-align: center;
    }

    @media (max-width: 400px) {
      .stats-grid {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }
      
      .stat-card {
        flex-direction: row;
        padding: 0.75rem 1rem;
        gap: 0.75rem;
      }
      
      .stat-icon {
        margin-bottom: 0;
      }
      
      .stat-content {
        align-items: flex-start;
        text-align: left;
      }
    }

    :host-context(.light) .stats-container {
      background: linear-gradient(135deg, #fff5f2 0%, #ffffff 100%);
      border-color: rgba(255, 107, 107, 0.1);
    }

    :host-context(.dark) .stats-container {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border-color: rgba(255, 107, 107, 0.2);
    }

    :host-context(.dark) .greeting,
    :host-context(.dark) .stat-value,
    :host-context(.dark) .xp-numbers {
      color: #f5f5f5;
    }

    :host-context(.dark) .greeting-subtitle,
    :host-context(.dark) .stat-label,
    :host-context(.dark) .xp-label {
      color: #a0a0a0;
    }

    :host-context(.dark) .stat-card,
    :host-context(.dark) .xp-section,
    :host-context(.dark) .streak-card,
    :host-context(.dark) .level-card,
    :host-context(.dark) .carrot-card {
      background: rgba(255, 255, 255, 0.05);
    }

    :host-context(.dark) .xp-bar-bg {
      background: rgba(255, 255, 255, 0.1);
    }

    :host-context(.dark) .xp-hint {
      color: #636e72;
    }

    @media (prefers-reduced-motion: reduce) {
      .greeting-emoji {
        animation: none;
      }
      
      .xp-bar-fill {
        transition: none;
      }
    }
  `],
})
export class StatsGridComponent {
  readonly carrotHover = signal(false);
  readonly rewards = inject(RewardsService);
  private readonly auth = inject(AuthService);

  readonly userName = computed(() => {
    const user = this.auth.user();
    if (user?.name) {
      return user.name.split(' ')[0]; // First name only
    }
    return '';
  });

  readonly greetingKey = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'STATS.GREETING_MORNING';
    if (hour < 17) return 'STATS.GREETING_AFTERNOON';
    if (hour < 21) return 'STATS.GREETING_EVENING';
    return 'STATS.GREETING_NIGHT';
  });

  readonly greetingEmoji = computed(() => {
    const hour = new Date().getHours();
    if (hour < 6) return '🌙';
    if (hour < 12) return '🌅';
    if (hour < 17) return '☀️';
    if (hour < 21) return '🌆';
    return '🌙';
  });

  readonly greetingSubtitleKey = computed(() => {
    const streak = this.rewards.streak();
    if (streak >= 7) return 'STATS.SUBTITLE_FIRE';
    if (streak >= 3) return 'STATS.SUBTITLE_CONSISTENCY';
    if (streak >= 1) return 'STATS.SUBTITLE_WELCOME_BACK';
    return 'STATS.SUBTITLE_START';
  });

  readonly streakBadge = computed(() => {
    const streak = this.rewards.streak();
    if (streak >= 30) return '🏆';
    if (streak >= 14) return '💎';
    if (streak >= 7) return '🌟';
    if (streak >= 3) return '✨';
    return '';
  });

  readonly carrotsToNextLevel = computed(() => {
    return this.rewards.nextLevelAt() - this.rewards.carrots();
  });
}
