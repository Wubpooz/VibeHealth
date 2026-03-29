import { ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

type BunnyMood = 'wave' | 'curious' | 'thinking' | 'excited' | 'celebrate' | 'idle' | 'sad' | 'happy';
type BunnyState = 'standing' | 'thinking' | 'celebrate' | 'sad';

interface BunnyAsset {
  readonly src: string;
  readonly alt: string;
}

const STATE_ASSET_MAP: Record<BunnyState, BunnyAsset> = {
  standing: {
    src: 'assets/mascotte/rabbit_standing.svg',
    alt: 'VibeHealth bunny mascot standing',
  },
  thinking: {
    src: 'assets/mascotte/rabbit_thinking.svg',
    alt: 'VibeHealth bunny mascot thinking',
  },
  celebrate: {
    src: 'assets/mascotte/rabbit_congrat.svg',
    alt: 'VibeHealth bunny mascot celebrating',
  },
  sad: {
    src: 'assets/mascotte/rabbit_sad.svg',
    alt: 'VibeHealth bunny mascot looking sad',
  },
};

const MOOD_TO_STATE_MAP: Record<BunnyMood, BunnyState> = {
  wave: 'standing',
  curious: 'standing',
  thinking: 'thinking',
  excited: 'celebrate',
  celebrate: 'celebrate',
  idle: 'standing',
  sad: 'sad',
  happy: 'celebrate',
};

const TRANSITION_DURATION_MS = 360;

@Component({
  selector: 'app-bunny-mascot',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bunny-container" [class]="'state-' + currentState()">
      <div
        class="bunny-stage"
        [style.width.px]="size"
        [style.height.px]="size"
        role="img"
        [attr.aria-label]="currentAsset().alt"
      >
        @if (previousState(); as previous) {
          <img
            class="bunny-image bunny-image-previous"
            [src]="assetFor(previous).src"
            [alt]="assetFor(previous).alt"
            draggable="false"
          />
        }

        <img
          class="bunny-image bunny-image-current"
          [src]="currentAsset().src"
          [alt]="currentAsset().alt"
          draggable="false"
        />
      </div>

      @if (message) {
        <div class="speech-bubble">
          <p>{{ message }}</p>
          <div class="speech-bubble-tail"></div>
        </div>
      }

      <div class="asset-preload" aria-hidden="true">
        @for (asset of allAssets; track asset.src) {
          <img [src]="asset.src" alt="" />
        }
      </div>
    </div>
  `,
  styles: [`
    .bunny-container {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .bunny-stage {
      position: relative;
      isolation: isolate;
      display: block;
    }

    .bunny-stage::before {
      content: '';
      position: absolute;
      inset: 8% 12%;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 182, 193, 0.28) 0%, rgba(255, 182, 193, 0) 72%);
      z-index: 0;
      pointer-events: none;
    }

    .bunny-image {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      transform-origin: 50% 92%;
      filter: drop-shadow(0 12px 18px rgba(185, 37, 44, 0.12));
      z-index: 1;
      pointer-events: none;
      user-select: none;
      -webkit-user-drag: none;
      will-change: transform, opacity;
    }

    .bunny-image-current {
      animation: mascot-enter 0.36s ease-out both;
    }

    .bunny-image-previous {
      animation: mascot-exit 0.36s ease-in both;
    }

    .state-standing .bunny-image-current {
      animation: mascot-enter 0.36s ease-out both, mascot-float 3.2s ease-in-out 0.36s infinite;
    }

    .state-thinking .bunny-image-current {
      animation: mascot-enter 0.36s ease-out both, mascot-think 2.4s ease-in-out 0.36s infinite;
    }

    .state-celebrate .bunny-image-current {
      animation: mascot-enter 0.36s ease-out both, mascot-cheer 1.2s ease-in-out 0.36s infinite;
    }

    .state-sad .bunny-image-current {
      animation: mascot-enter 0.36s ease-out both, mascot-sigh 2.6s ease-in-out 0.36s infinite;
    }

    @keyframes mascot-enter {
      from {
        opacity: 0;
        transform: translateY(10px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes mascot-exit {
      from {
        opacity: 0.96;
        transform: translateY(0) scale(1);
      }
      to {
        opacity: 0;
        transform: translateY(-8px) scale(1.04);
      }
    }

    @keyframes mascot-float {
      0%,
      100% {
        transform: translateY(0) scale(1);
      }
      50% {
        transform: translateY(-6px) scale(1.01);
      }
    }

    @keyframes mascot-think {
      0%,
      100% {
        transform: translateY(0) rotate(0deg);
      }
      35% {
        transform: translateY(-4px) rotate(-2.5deg);
      }
      65% {
        transform: translateY(-5px) rotate(1.5deg);
      }
    }

    @keyframes mascot-cheer {
      0%,
      100% {
        transform: translateY(0) scale(1);
      }
      35% {
        transform: translateY(-9px) scale(1.04);
      }
      70% {
        transform: translateY(-3px) scale(0.99);
      }
    }

    @keyframes mascot-sigh {
      0%,
      100% {
        transform: translateY(0) rotate(0deg) scale(1);
      }
      40% {
        transform: translateY(3px) rotate(-2deg) scale(0.99);
      }
      80% {
        transform: translateY(1px) rotate(-1deg) scale(0.995);
      }
    }

    .speech-bubble {
      position: absolute;
      top: -76px;
      left: 50%;
      transform: translateX(-50%);
      background: #fff;
      padding: 12px 18px;
      border-radius: 18px;
      border: 2px solid #ffe4e8;
      box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08);
      max-width: 240px;
      text-align: center;
      animation: bubble-pop 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
      z-index: 2;
    }

    .speech-bubble p {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.4;
      color: #4a3728;
    }

    .speech-bubble-tail {
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-top: 12px solid #fff;
    }

    .speech-bubble-tail::before {
      content: '';
      position: absolute;
      bottom: 2px;
      left: -12px;
      width: 0;
      height: 0;
      border-left: 12px solid transparent;
      border-right: 12px solid transparent;
      border-top: 14px solid #ffe4e8;
      z-index: -1;
    }

    @keyframes bubble-pop {
      from {
        opacity: 0;
        transform: translateX(-50%) scale(0.86);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) scale(1);
      }
    }

    .asset-preload {
      position: absolute;
      width: 0;
      height: 0;
      opacity: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .asset-preload img {
      width: 0;
      height: 0;
      opacity: 0;
      pointer-events: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .bunny-image,
      .speech-bubble {
        animation: none !important;
        transition: none !important;
      }

      .bunny-image-current {
        opacity: 1;
        transform: none;
      }

      .bunny-image-previous {
        opacity: 0;
      }
    }
  `],
})
export class BunnyMascotComponent implements OnChanges, OnDestroy {
  @Input() mood: BunnyMood = 'idle';
  @Input() state?: BunnyState;
  @Input() message?: string;
  @Input() size = 160;

  readonly currentState = signal<BunnyState>('standing');
  readonly previousState = signal<BunnyState | null>(null);
  readonly currentAsset = computed(() => STATE_ASSET_MAP[this.currentState()]);
  readonly allAssets = Object.values(STATE_ASSET_MAP);

  private isInitialized = false;
  private transitionTimeout?: ReturnType<typeof setTimeout>;

  ngOnChanges(): void {
    const nextState = this.resolveState();

    if (!this.isInitialized) {
      this.currentState.set(nextState);
      this.previousState.set(null);
      this.isInitialized = true;
      return;
    }

    if (nextState === this.currentState()) {
      return;
    }

    this.previousState.set(this.currentState());
    this.currentState.set(nextState);

    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
    }

    this.transitionTimeout = setTimeout(() => {
      this.previousState.set(null);
    }, TRANSITION_DURATION_MS);
  }

  ngOnDestroy(): void {
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
    }
  }

  assetFor(state: BunnyState): BunnyAsset {
    return STATE_ASSET_MAP[state];
  }

  private resolveState(): BunnyState {
    if (this.state) {
      return this.state;
    }

    return MOOD_TO_STATE_MAP[this.mood] ?? 'standing';
  }
}
