import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RewardsService, CarrotReward } from '../../../core/rewards/rewards.service';
import { BunnyMascotComponent } from '../bunny-mascot/bunny-mascot.component';

@Component({
  selector: 'app-carrot-feed',
  imports: [CommonModule, TranslateModule, BunnyMascotComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="feed-container">
      <div class="feed-header">
        <h3 class="feed-title">
          <span class="feed-icon">🥕</span>
          {{ 'STATS.RECENT_ACTIVITY' | translate }}
        </h3>
      </div>

      @if (recentRewards().length === 0) {
        <div class="empty-state">
          <app-bunny-mascot
            class="empty-mascot"
            mood="curious"
            [size]="64"
            [message]="'STATS.START_EARNING' | translate"
          ></app-bunny-mascot>
          <p class="empty-text">{{ 'STATS.NO_ACTIVITY_YET' | translate }}</p>
          <p class="empty-hint">{{ 'STATS.START_EARNING' | translate }}</p>
        </div>
      } @else {
        <ul class="feed-list">
          @for (reward of recentRewards(); track reward.id; let i = $index) {
            <li 
              class="feed-item"
              [class.new]="i === 0 && isRecent(reward)"
              [style.animation-delay.ms]="i * 50"
            >
              <span class="item-icon">{{ getCategoryIcon(reward.category) }}</span>
              <div class="item-content">
                <span class="item-reason">{{ reward.reason }}</span>
                <span class="item-time">{{ formatTime(reward.earnedAt) }}</span>
              </div>
              <span class="item-amount" [class.bonus]="reward.amount >= 5">
                +{{ reward.amount }} 🥕
              </span>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .feed-container {
      width: 100%;
      background: white;
      border-radius: 1.5rem;
      padding: 1.25rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
      border: 1px solid rgba(0, 0, 0, 0.04);
    }

    .feed-header {
      margin-bottom: 1rem;
    }

    .feed-title {
      font-family: 'Satoshi', sans-serif;
      font-weight: 700;
      font-size: 1rem;
      color: #2d3436;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .feed-icon {
      font-size: 1.25rem;
    }

    .empty-state {
      text-align: center;
      padding: 2rem 1rem;
    }

    .empty-mascot {
      margin: 0 auto 0.75rem;
      width: 64px;
      height: 64px;
    }

    .empty-emoji {
      font-size: 3rem;
      display: block;
      margin-bottom: 0.75rem;
      opacity: 0.6;
    }

    .empty-text {
      font-family: 'Satoshi', sans-serif;
      font-weight: 600;
      font-size: 0.875rem;
      color: #636e72;
      margin: 0 0 0.25rem;
    }

    .empty-hint {
      font-family: 'Satoshi', sans-serif;
      font-size: 0.75rem;
      color: #b2bec3;
      margin: 0;
    }

    .feed-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .feed-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 0.75rem;
      animation: slideIn 0.3s ease forwards;
      opacity: 0;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-10px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .feed-item.new {
      background: linear-gradient(135deg, #fff5f0 0%, #fef3e2 100%);
      animation: pulse-new 0.5s ease, slideIn 0.3s ease forwards;
    }

    @keyframes pulse-new {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }

    .item-icon {
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .item-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .item-reason {
      font-family: 'Satoshi', sans-serif;
      font-weight: 600;
      font-size: 0.8125rem;
      color: #2d3436;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-time {
      font-family: 'Satoshi', sans-serif;
      font-size: 0.6875rem;
      color: #b2bec3;
    }

    .item-amount {
      font-family: 'Satoshi', sans-serif;
      font-weight: 700;
      font-size: 0.875rem;
      color: #ff9f43;
      flex-shrink: 0;
    }

    .item-amount.bonus {
      color: #ff6b6b;
      animation: bounce-amount 0.4s ease;
    }

    @keyframes bounce-amount {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.15); }
    }

    /* Dark mode - using :host-context for theme-aware styles */
    :host-context([data-theme="dark"]) .feed-container {
      background: rgba(31, 41, 55, 0.5);
      border-color: rgba(55, 65, 81, 0.5);
    }

    :host-context([data-theme="dark"]) .feed-title {
      color: #f5f5f5;
    }

    :host-context([data-theme="dark"]) .empty-text {
      color: #a0a0a0;
    }

    :host-context([data-theme="dark"]) .empty-hint {
      color: #636e72;
    }

    :host-context([data-theme="dark"]) .feed-item {
      background: rgba(55, 65, 81, 0.3);
      transition: background 0.2s ease;
    }

    :host-context([data-theme="dark"]) .feed-item:hover {
      background: rgba(55, 65, 81, 0.5);
    }

    :host-context([data-theme="dark"]) .feed-item.new {
      background: linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(255, 159, 67, 0.15) 100%);
    }

    :host-context([data-theme="dark"]) .feed-item.new:hover {
      background: linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 159, 67, 0.2) 100%);
    }

    :host-context([data-theme="dark"]) .item-reason {
      color: #f5f5f5;
    }

    :host-context([data-theme="dark"]) .item-time {
      color: #9ca3af;
    }

    @media (prefers-reduced-motion: reduce) {
      .feed-item {
        animation: none;
        opacity: 1;
      }
      
      .feed-item.new {
        animation: none;
      }
      
      .item-amount.bonus {
        animation: none;
      }
    }
  `],
})
export class CarrotFeedComponent {
  private readonly rewards = inject(RewardsService);
  private readonly translate = inject(TranslateService);

  readonly recentRewards = computed(() => {
    return this.rewards.recentRewards().slice(0, 5);
  });

  getCategoryIcon(category: CarrotReward['category']): string {
    const icons: Record<CarrotReward['category'], string> = {
      logging: '📝',
      streak: '🔥',
      milestone: '🏆',
      achievement: '⭐',
      bonus: '🎁',
      hydration: '💧',
      activity: '🏃',
      nutrition: '🥗',
    };
    return icons[category] || '🥕';
  }

  isRecent(reward: CarrotReward): boolean {
    const timeSince = Date.now() - reward.earnedAt.getTime();
    return timeSince < 10000; // 10 seconds
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return this.translate.instant('STATS.TIME_JUST_NOW');
    if (diffMins < 60) return this.translate.instant('STATS.TIME_MIN_AGO', { count: diffMins });
    if (diffHours < 24) return this.translate.instant('STATS.TIME_HOUR_AGO', { count: diffHours });
    return date.toLocaleDateString();
  }
}
