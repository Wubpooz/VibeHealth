import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CarrotReward {
  id: string;
  amount: number;
  reason: string;
  earnedAt: Date;
  category: 'logging' | 'streak' | 'milestone' | 'achievement' | 'bonus' | 'hydration' | 'activity' | 'nutrition';
}

export interface RewardStats {
  totalCarrots: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  levelProgress: number;
  nextLevelAt: number;
}

// Level thresholds - each level requires progressively more carrots
const LEVEL_THRESHOLDS = [0, 10, 25, 50, 100, 175, 275, 400, 550, 750, 1000];

@Injectable({ providedIn: 'root' })
export class RewardsService {
  private readonly http = inject(HttpClient);

  // Active user context for storage isolation (guest if null)
  private userId: string | null = null;

  constructor() {
    this.setUser(null);
  }

  // Signal-based state
  private readonly _carrots = signal<number>(0);
  private readonly _recentRewards = signal<CarrotReward[]>([]);
  private readonly _streak = signal<number>(0);
  private readonly _longestStreak = signal<number>(0);

  // Public computed signals
  readonly carrots = this._carrots.asReadonly();
  readonly recentRewards = this._recentRewards.asReadonly();
  readonly streak = this._streak.asReadonly();
  readonly longestStreak = this._longestStreak.asReadonly();

  readonly level = computed(() => {
    const total = this._carrots();
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (total >= LEVEL_THRESHOLDS[i]) return i + 1;
    }
    return 1;
  });

  readonly levelProgress = computed(() => {
    const total = this._carrots();
    const currentLevel = this.level();
    const currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
    const nextThreshold = LEVEL_THRESHOLDS[currentLevel] || currentThreshold + 100;
    return ((total - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  });

  readonly nextLevelAt = computed(() => {
    const currentLevel = this.level();
    return LEVEL_THRESHOLDS[currentLevel] || this._carrots() + 100;
  });

  readonly stats = computed<RewardStats>(() => ({
    totalCarrots: this._carrots(),
    currentStreak: this._streak(),
    longestStreak: this._longestStreak(),
    level: this.level(),
    levelProgress: this.levelProgress(),
    nextLevelAt: this.nextLevelAt(),
  }));

  // Bunny mood based on recent activity
  readonly bunnyMood = computed(() => {
    const recent = this._recentRewards();
    if (recent.length > 0) {
      const lastReward = recent[0];
      const timeSince = Date.now() - lastReward.earnedAt.getTime();
      if (timeSince < 5000) return 'celebrate'; // Just earned!
      if (timeSince < 30000) return 'excited'; // Recent earn
    }
    if (this._streak() >= 7) return 'excited';
    if (this._streak() >= 3) return 'wave';
    return 'idle';
  });

  /**
   * Award carrots for an action
   */
  async awardCarrots(amount: number, reason: string, category: CarrotReward['category'] = 'bonus'): Promise<CarrotReward | null> {
    const reward: CarrotReward = {
      id: crypto.randomUUID(),
      amount,
      reason,
      earnedAt: new Date(),
      category,
    };

    try {
      await firstValueFrom(this.http.post<{ success: boolean; data: { carrotBalance: number } }>(
        `${environment.apiUrl}/api/v1/rewards/award`,
        { amount },
        { withCredentials: true }
      ));

      this._carrots.update(c => c + amount);
      this._recentRewards.update(rewards => [reward, ...rewards.slice(0, 9)]);
      return reward;
    } catch (error) {
      console.error('Failed to award carrots:', error);
      return null;
    }
  }

  /**
   * Log daily activity and check streak backend
   */
  async logDailyActivity(): Promise<boolean> {
    try {
      const response = await firstValueFrom(this.http.post<{
        success: boolean;
        data: { carrotBalance: number; currentStreak: number; longestStreak: number };
      }>(
        `${environment.apiUrl}/api/v1/rewards/daily-checkin`,
        {},
        { withCredentials: true }
      ));

      if (!response.success) {
        return false;
      }

      this._carrots.set(response.data.carrotBalance);
      this._streak.set(response.data.currentStreak);
      this._longestStreak.set(response.data.longestStreak);

      // Daily check-in yields at least a +2 carrot event locally
      this._recentRewards.update(rewards => [
        {
          id: crypto.randomUUID(),
          amount: 2,
          reason: 'Daily check-in',
          earnedAt: new Date(),
          category: 'logging',
        },
        ...rewards.slice(0, 9),
      ]);

      return true;
    } catch (error) {
      console.error('Failed to perform daily check-in:', error);
      return false;
    }
  }

  /**
   * Award milestone carrots
   */
  awardMilestone(milestone: string, amount: number) {
    return this.awardCarrots(amount, milestone, 'milestone');
  }

  /**
   * Award achievement carrots
   */
  awardAchievement(achievement: string, amount: number) {
    return this.awardCarrots(amount, achievement, 'achievement');
  }

  /**
   * Spend carrots (for future features like Focus Helper)
   */
  spendCarrots(amount: number): boolean {
    if (this._carrots() < amount) return false;
    this._carrots.update(c => c - amount);
    return true;
  }

  private async loadFromServer(): Promise<void> {
    try {
      const response = await firstValueFrom(this.http.get<{ success: boolean; data: { carrotBalance: number; currentStreak: number; longestStreak: number } }>(
        `${environment.apiUrl}/api/v1/rewards`,
        { withCredentials: true }
      ));

      if (!response.success || !response.data) {
        this.resetState();
        return;
      }

      this._carrots.set(response.data.carrotBalance);
      this._streak.set(response.data.currentStreak);
      this._longestStreak.set(response.data.longestStreak);
    } catch (error) {
      console.error('Failed to load rewards from server:', error);
      this.resetState();
    }
  }

  private resetState(): void {
    this._carrots.set(0);
    this._streak.set(0);
    this._longestStreak.set(0);
    this._recentRewards.set([]);
  }

  setUser(userId: string | null): void {
    this.userId = userId;
    if (this.userId) {
      void this.loadFromServer();
    } else {
      this.resetState();
    }
  }

  clear(): void {
    this.userId = null;
    this.resetState();
  }
}

