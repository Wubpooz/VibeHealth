import { Injectable, signal, computed } from '@angular/core';

export interface CarrotReward {
  id: string;
  amount: number;
  reason: string;
  earnedAt: Date;
  category: 'logging' | 'streak' | 'milestone' | 'achievement' | 'bonus';
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
  // Signal-based state
  private _carrots = signal<number>(this.loadCarrots());
  private _recentRewards = signal<CarrotReward[]>([]);
  private _streak = signal<number>(this.loadStreak());
  private _longestStreak = signal<number>(this.loadLongestStreak());

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
  awardCarrots(amount: number, reason: string, category: CarrotReward['category'] = 'bonus'): CarrotReward {
    const reward: CarrotReward = {
      id: crypto.randomUUID(),
      amount,
      reason,
      earnedAt: new Date(),
      category,
    };

    this._carrots.update(c => c + amount);
    this._recentRewards.update(rewards => [reward, ...rewards.slice(0, 9)]);

    // Persist
    this.saveCarrots();

    return reward;
  }

  /**
   * Log daily activity and check streak
   */
  logDailyActivity() {
    const lastLog = localStorage.getItem('vibehealth_last_activity');
    const today = new Date().toDateString();

    if (lastLog === today) {
      return; // Already logged today
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastLog === yesterday.toDateString()) {
      // Continue streak
      this._streak.update(s => s + 1);
      if (this._streak() > this._longestStreak()) {
        this._longestStreak.set(this._streak());
        localStorage.setItem('vibehealth_longest_streak', String(this._longestStreak()));
      }
    } else if (lastLog !== today) {
      // Streak broken, reset to 1
      this._streak.set(1);
    }

    localStorage.setItem('vibehealth_last_activity', today);
    localStorage.setItem('vibehealth_streak', String(this._streak()));

    // Award daily carrots
    this.awardCarrots(2, 'Daily check-in', 'logging');

    // Streak bonuses
    if (this._streak() === 3) this.awardCarrots(5, '3-day streak! 🔥', 'streak');
    if (this._streak() === 7) this.awardCarrots(15, 'Week streak! 🌟', 'streak');
    if (this._streak() === 30) this.awardCarrots(50, 'Monthly streak! 🏆', 'streak');
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
  spendCarrots(amount: number, reason: string): boolean {
    if (this._carrots() < amount) return false;

    this._carrots.update(c => c - amount);
    this.saveCarrots();
    return true;
  }

  private loadCarrots(): number {
    return Number.parseInt(localStorage.getItem('vibehealth_carrots') || '0', 10);
  }

  private loadStreak(): number {
    return Number.parseInt(localStorage.getItem('vibehealth_streak') || '0', 10);
  }

  private loadLongestStreak(): number {
    return Number.parseInt(localStorage.getItem('vibehealth_longest_streak') || '0', 10);
  }

  private saveCarrots() {
    localStorage.setItem('vibehealth_carrots', String(this._carrots()));
  }
}
