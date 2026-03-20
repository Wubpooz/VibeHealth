import { Component, Input, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RewardsService } from '../../../core/rewards/rewards.service';

@Component({
  selector: 'app-carrot-counter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="carrot-counter" [class.mini]="variant === 'mini'" [class.celebrating]="celebrating()">
      <!-- Carrot icon with animation -->
      <div class="carrot-icon-wrapper">
        <svg class="carrot-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Carrot leaves -->
          <path d="M32 8 L28 2 Q30 6, 32 4 Q34 6, 36 2 L32 8" fill="#4ADE80" class="leaf-1"/>
          <path d="M29 10 L22 5 Q26 8, 28 7" fill="#22C55E" class="leaf-2"/>
          <path d="M35 10 L42 5 Q38 8, 36 7" fill="#22C55E" class="leaf-3"/>
          
          <!-- Carrot body gradient -->
          <defs>
            <linearGradient id="carrotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#FB923C"/>
              <stop offset="50%" style="stop-color:#F97316"/>
              <stop offset="100%" style="stop-color:#EA580C"/>
            </linearGradient>
          </defs>
          
          <!-- Carrot body -->
          <path 
            d="M32 12 C38 12, 42 18, 42 28 C42 42, 36 56, 32 60 C28 56, 22 42, 22 28 C22 18, 26 12, 32 12"
            fill="url(#carrotGradient)"
            class="carrot-body"
          />
          
          <!-- Carrot lines -->
          <path d="M27 22 Q32 24, 37 22" stroke="#EA580C" stroke-width="1.5" fill="none" opacity="0.5"/>
          <path d="M26 32 Q32 34, 38 32" stroke="#EA580C" stroke-width="1.5" fill="none" opacity="0.5"/>
          <path d="M28 42 Q32 44, 36 42" stroke="#EA580C" stroke-width="1.5" fill="none" opacity="0.5"/>
          
          <!-- Shine highlight -->
          <ellipse cx="28" cy="24" rx="3" ry="6" fill="white" opacity="0.3"/>
        </svg>
        
        <!-- Sparkle effects when celebrating -->
        @if (celebrating()) {
          <div class="sparkles">
            <span class="sparkle s1">✨</span>
            <span class="sparkle s2">⭐</span>
            <span class="sparkle s3">✨</span>
          </div>
        }
      </div>
      
      <!-- Count display -->
      <div class="count-wrapper">
        <span class="count" [class.bumping]="celebrating()">{{ rewards.carrots() }}</span>
        @if (variant !== 'mini' && rewards.recentRewards().length > 0) {
          <span class="recent-gain">+{{ rewards.recentRewards()[0].amount }}</span>
        }
      </div>
      
      <!-- Level indicator (not in mini mode) -->
      @if (variant !== 'mini') {
        <div class="level-info">
          <span class="level-badge">Lv.{{ rewards.level() }}</span>
          <div class="level-progress">
            <div class="level-progress-fill" [style.width.%]="rewards.levelProgress()"></div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .carrot-counter {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 1rem;
      background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,237,213,0.9) 100%);
      border: 2px solid #FDBA74;
      border-radius: 2rem;
      box-shadow: 
        0 4px 12px rgba(249, 115, 22, 0.15),
        inset 0 1px 0 rgba(255,255,255,0.8);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    .carrot-counter.celebrating {
      transform: scale(1.05);
      box-shadow: 
        0 6px 20px rgba(249, 115, 22, 0.3),
        0 0 30px rgba(251, 146, 60, 0.4);
      border-color: #F97316;
    }
    
    .carrot-counter.mini {
      padding: 0.375rem 0.75rem;
      gap: 0.5rem;
      border-radius: 1.5rem;
    }
    
    .carrot-icon-wrapper {
      position: relative;
      width: 32px;
      height: 32px;
      flex-shrink: 0;
    }
    
    .mini .carrot-icon-wrapper {
      width: 24px;
      height: 24px;
    }
    
    .carrot-icon {
      width: 100%;
      height: 100%;
      animation: gentle-bob 2s ease-in-out infinite;
    }
    
    .celebrating .carrot-icon {
      animation: carrot-dance 0.5s ease-in-out infinite;
    }
    
    @keyframes gentle-bob {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-2px) rotate(2deg); }
    }
    
    @keyframes carrot-dance {
      0%, 100% { transform: translateY(0) rotate(-5deg) scale(1); }
      25% { transform: translateY(-4px) rotate(5deg) scale(1.1); }
      50% { transform: translateY(-2px) rotate(-3deg) scale(1.05); }
      75% { transform: translateY(-5px) rotate(4deg) scale(1.1); }
    }
    
    .leaf-1, .leaf-2, .leaf-3 {
      transform-origin: center bottom;
      animation: leaf-wave 2s ease-in-out infinite;
    }
    
    .leaf-2 { animation-delay: 0.2s; }
    .leaf-3 { animation-delay: 0.4s; }
    
    @keyframes leaf-wave {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(5deg); }
    }
    
    .sparkles {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    
    .sparkle {
      position: absolute;
      font-size: 12px;
      animation: sparkle-burst 0.8s ease-out forwards;
    }
    
    .s1 { top: -8px; left: 0; animation-delay: 0s; }
    .s2 { top: -4px; right: -8px; animation-delay: 0.1s; }
    .s3 { bottom: 0; left: -8px; animation-delay: 0.2s; }
    
    @keyframes sparkle-burst {
      0% { opacity: 0; transform: scale(0) translateY(0); }
      50% { opacity: 1; transform: scale(1.2) translateY(-8px); }
      100% { opacity: 0; transform: scale(0.8) translateY(-16px); }
    }
    
    .count-wrapper {
      display: flex;
      align-items: baseline;
      gap: 0.25rem;
    }
    
    .count {
      font-family: 'Outfit', sans-serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: #9A3412;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    .count.bumping {
      animation: bump 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    @keyframes bump {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.3); }
    }
    
    .mini .count {
      font-size: 1rem;
    }
    
    .recent-gain {
      font-size: 0.75rem;
      font-weight: 600;
      color: #16A34A;
      animation: gain-pop 0.5s ease-out;
    }
    
    @keyframes gain-pop {
      0% { opacity: 0; transform: translateY(4px) scale(0.8); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    
    .level-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .level-badge {
      font-size: 0.625rem;
      font-weight: 700;
      color: #C2410C;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .level-progress {
      width: 48px;
      height: 4px;
      background: #FED7AA;
      border-radius: 2px;
      overflow: hidden;
    }
    
    .level-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #F97316, #FB923C);
      border-radius: 2px;
      transition: width 0.5s ease-out;
    }
    
    /* Dark mode */
    :host-context(.dark) .carrot-counter {
      background: linear-gradient(135deg, rgba(39,39,42,0.95) 0%, rgba(68,48,32,0.9) 100%);
      border-color: #B45309;
    }
    
    :host-context(.dark) .count {
      color: #FDBA74;
    }
    
    :host-context(.dark) .level-badge {
      color: #FB923C;
    }
    
    :host-context(.dark) .level-progress {
      background: rgba(180, 83, 9, 0.3);
    }
  `]
})
export class CarrotCounterComponent {
  @Input() variant: 'default' | 'mini' = 'default';
  
  readonly rewards = inject(RewardsService);
  readonly celebrating = signal(false);
  
  constructor() {
    // Watch for new rewards and trigger celebration
    effect(() => {
      const recent = this.rewards.recentRewards();
      if (recent.length > 0) {
        const lastReward = recent[0];
        const timeSince = Date.now() - lastReward.earnedAt.getTime();
        if (timeSince < 1000) {
          this.celebrating.set(true);
          setTimeout(() => this.celebrating.set(false), 1500);
        }
      }
    });
  }
}
