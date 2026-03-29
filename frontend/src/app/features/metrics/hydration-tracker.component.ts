import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  afterNextRender,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MetricsService } from '../../core/metrics/metrics.service';
import { RewardsService } from '../../core/rewards/rewards.service';
import { HYDRATION_PRESETS, type HydrationPreset } from '../../core/metrics/metrics.types';
import { LucideDroplets, LucideTrophy } from '@lucide/angular';

@Component({
  selector: 'app-hydration-tracker',
  imports: [CommonModule, TranslateModule, LucideDroplets, LucideTrophy],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="hydration-card">
      <!-- Header -->
      <div class="header">
        <div class="title-row">
          <span class="icon" aria-hidden="true">
            <svg lucideDroplets [size]="24" [strokeWidth]="2"></svg>
          </span>
          <h3>{{ 'METRICS.HYDRATION.TITLE' | translate }}</h3>
        </div>
        <span class="percentage" [class.goal-reached]="percentage() >= 100">
          {{ percentage() }}%
        </span>
      </div>

      <!-- Progress Ring -->
      <div class="progress-container" #progressContainer>
        <svg class="progress-ring" viewBox="0 0 120 120">
          <!-- Background circle -->
          <circle
            class="bg-ring"
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke-width="8"
          />
          <!-- Progress arc -->
          <circle
            #progressRing
            class="progress-arc"
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke-width="8"
            stroke-linecap="round"
            [attr.stroke-dasharray]="circumference"
            [attr.stroke-dashoffset]="dashOffset()"
            transform="rotate(-90 60 60)"
          />
        </svg>

        <div class="center-glyph" [class.goal]="percentage() >= 100" aria-hidden="true">
          @if (percentage() >= 100) {
            <svg lucideTrophy [size]="28" [strokeWidth]="2"></svg>
          } @else {
            <svg lucideDroplets [size]="28" [strokeWidth]="2"></svg>
          }
        </div>
        
        <!-- Stats below ring -->
        <div class="stats">
          <span class="current">{{ totalLiters() }}L</span>
          <span class="divider">/</span>
          <span class="goal">{{ goalLiters() }}L</span>
        </div>
      </div>

      <!-- Quick-log buttons -->
      <div class="quick-buttons" #quickButtons>
        @for (preset of presets; track preset.key) {
          <button
            class="preset-btn"
            (click)="logDrink(preset.key)"
            [disabled]="logging()"
            [class.pulse]="lastLogged() === preset.key"
          >
            <span class="emoji">{{ preset.emoji }}</span>
            <span class="label">{{ preset.label }}</span>
            <span class="amount">{{ preset.amount }}ml</span>
          </button>
        }
      </div>

      <!-- Recent activity -->
      @if (recentLogs().length > 0) {
        <div class="recent">
          <span class="recent-label">{{ 'METRICS.HYDRATION.TODAY' | translate }}:</span>
          <div class="glasses">
            @for (log of recentLogs(); track log.id) {
              <span class="glass-icon" [title]="log.amount + 'ml'" aria-hidden="true">
                <svg lucideDroplets [size]="15" [strokeWidth]="2"></svg>
              </span>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .hydration-card {
      background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
      border-radius: 1.5rem;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(0, 188, 212, 0.15);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .title-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .title-row .icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #00796b;
    }

    .title-row h3 {
      font-family: 'Satoshi', sans-serif;
      font-weight: 700;
      font-size: 1.125rem;
      color: #00796b;
      margin: 0;
    }

    .percentage {
      font-family: 'Satoshi', sans-serif;
      font-weight: 700;
      font-size: 1.5rem;
      color: #00796b;
      transition: all 0.3s ease;
    }

    .percentage.goal-reached {
      color: #2e7d32;
      animation: celebrate 0.5s ease;
    }

    @keyframes celebrate {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }

    .progress-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 1.5rem;
      position: relative;
    }

    .progress-ring {
      width: 120px;
      height: 120px;
    }

    .bg-ring {
      stroke: rgba(255, 255, 255, 0.5);
    }

    .progress-arc {
      stroke: #00bcd4;
      transition: stroke-dashoffset 0.5s ease;
    }

    .center-glyph {
      position: absolute;
      top: 46px;
      left: 50%;
      transform: translateX(-50%);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #00acc1;
      pointer-events: none;
      animation: float 2s ease-in-out infinite;
    }

    .center-glyph.goal {
      animation: bounce 0.7s ease infinite;
      color: #2e7d32;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-5px) scale(1.1); }
    }

    .stats {
      display: flex;
      align-items: baseline;
      gap: 0.25rem;
      margin-top: 0.75rem;
      font-family: 'Satoshi', sans-serif;
    }

    .stats .current {
      font-size: 1.5rem;
      font-weight: 700;
      color: #00796b;
    }

    .stats .divider {
      color: #4db6ac;
    }

    .stats .goal {
      font-size: 1rem;
      color: #4db6ac;
    }

    .quick-buttons {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .preset-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 0.75rem 0.5rem;
      background: white;
      border: 2px solid transparent;
      border-radius: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      animation: fadeInUp 0.4s ease forwards;
      opacity: 0;
    }

    .preset-btn:nth-child(1) { animation-delay: 0.1s; }
    .preset-btn:nth-child(2) { animation-delay: 0.2s; }
    .preset-btn:nth-child(3) { animation-delay: 0.3s; }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .preset-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      border-color: #00bcd4;
      box-shadow: 0 4px 12px rgba(0, 188, 212, 0.2);
    }

    .preset-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .preset-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .preset-btn.pulse {
      animation: pulse-btn 0.4s ease;
    }

    @keyframes pulse-btn {
      0% { transform: scale(1); }
      50% { transform: scale(0.95); background: #e0f7fa; }
      100% { transform: scale(1); }
    }

    .preset-btn .emoji {
      font-size: 1.5rem;
    }

    .preset-btn .label {
      font-family: 'Satoshi', sans-serif;
      font-weight: 600;
      font-size: 0.75rem;
      color: #37474f;
    }

    .preset-btn .amount {
      font-size: 0.625rem;
      color: #78909c;
    }

    .recent {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-top: 0.75rem;
      border-top: 1px solid rgba(255, 255, 255, 0.5);
    }

    .recent-label {
      font-family: 'Satoshi', sans-serif;
      font-size: 0.75rem;
      color: #00796b;
      font-weight: 500;
    }

    .glasses {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .glass-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #00acc1;
      opacity: 0;
      animation: fadeInGlass 0.3s ease forwards;
    }

    @keyframes fadeInGlass {
      to { opacity: 1; }
    }

    @media (prefers-reduced-motion: reduce) {
      .water-emoji,
      .goal-emoji,
      .preset-btn.pulse,
      .glass-icon {
        animation: none;
      }
      
      .progress-arc {
        transition: none;
      }
    }
  `],
})
export class HydrationTrackerComponent {
  private readonly metricsService = inject(MetricsService);
  private readonly rewardsService = inject(RewardsService);

  readonly logging = signal(false);
  readonly lastLogged = signal<HydrationPreset | null>(null);

  readonly circumference = 2 * Math.PI * 52; // r=52

  readonly percentage = this.metricsService.hydrationPercentage;
  readonly totalMl = this.metricsService.hydrationTotal;
  readonly goalMl = this.metricsService.hydrationGoal;

  readonly totalLiters = computed(() => (this.totalMl() / 1000).toFixed(1));
  readonly goalLiters = computed(() => (this.goalMl() / 1000).toFixed(1));

  readonly dashOffset = computed(() => {
    const progress = Math.min(this.percentage(), 100) / 100;
    return this.circumference * (1 - progress);
  });

  readonly recentLogs = computed(() => {
    const summary = this.metricsService.hydrationToday();
    return summary?.logs?.slice(0, 10) ?? [];
  });

  readonly presets = Object.entries(HYDRATION_PRESETS).map(([key, value]) => ({
    key: key as HydrationPreset,
    ...value,
  }));

  constructor() {
    afterNextRender(() => {
      this.metricsService.loadHydrationToday();
    });
  }

  async logDrink(preset: HydrationPreset): Promise<void> {
    this.logging.set(true);
    this.lastLogged.set(preset);

    const result = await this.metricsService.quickLogHydration(preset);

    if (result.success && result.carrots) {
      this.rewardsService.awardCarrots(
        result.carrots,
        result.carrots > 1 ? 'Hydration goal reached!' : 'Staying hydrated',
        'hydration'
      );
    }

    setTimeout(() => {
      this.logging.set(false);
      this.lastLogged.set(null);
    }, 400);
  }
}
