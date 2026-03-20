import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface SpiralDot {
  id: number;
  angle: number;
  radius: number;
  size: number;
  delay: number;
  opacity: number;
}

/**
 * Animated spiral dot-field loader component.
 * Reusable loading indicator inspired by Framer's spiral component.
 */
@Component({
  selector: 'app-spiral-loader',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="spiral-loader"
      [style.--loader-size]="size() + 'px'"
      role="status"
      [attr.aria-label]="label()"
    >
      <span class="spiral-core"></span>
      @for (dot of spiralDots; track dot.id) {
        <span
          class="spiral-dot"
          [style.--dot-angle]="dot.angle + 'deg'"
          [style.--dot-radius]="dot.radius + '%'"
          [style.--dot-size]="dot.size + 'px'"
          [style.--dot-delay]="dot.delay + 's'"
          [style.--dot-opacity]="dot.opacity + ''"
        ></span>
      }
      <span class="sr-only">{{ label() }}</span>
    </div>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      border: 0;
    }

    .spiral-loader {
      --loader-size: 80px;
      position: relative;
      width: var(--loader-size);
      height: var(--loader-size);
      animation: spiralOrbit 18s linear infinite;
      contain: layout paint;
    }

    .spiral-core {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 10%;
      height: 10%;
      transform: translate(-50%, -50%);
      border-radius: 999px;
      background: radial-gradient(circle at 30% 30%, #fff 0%, #fb7185 40%, #be123c 100%);
      box-shadow: 0 0 20px rgba(244, 63, 94, 0.4);
    }

    .spiral-dot {
      --dot-angle: 0deg;
      --dot-radius: 0%;
      --dot-size: 3px;
      --dot-delay: 0s;
      --dot-opacity: 0.5;
      position: absolute;
      left: 50%;
      top: 50%;
      width: var(--dot-size);
      height: var(--dot-size);
      margin-top: calc(var(--dot-size) * -0.5);
      margin-left: calc(var(--dot-size) * -0.5);
      border-radius: 999px;
      background: linear-gradient(180deg, #fda4af 0%, #34d399 100%);
      opacity: var(--dot-opacity);
      transform: rotate(var(--dot-angle)) translateX(var(--dot-radius));
      animation: spiralPulse 3.8s ease-in-out infinite;
      animation-delay: var(--dot-delay);
      will-change: transform, opacity;
    }

    @keyframes spiralOrbit {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes spiralPulse {
      0%, 100% {
        opacity: 0.18;
        transform: rotate(var(--dot-angle)) translateX(var(--dot-radius)) scale(0.55);
      }
      50% {
        opacity: var(--dot-opacity);
        transform: rotate(calc(var(--dot-angle) + 22deg)) translateX(calc(var(--dot-radius) * 1.08)) scale(1.1);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .spiral-loader,
      .spiral-dot {
        animation: none !important;
      }
      .spiral-dot {
        opacity: var(--dot-opacity);
        transform: rotate(var(--dot-angle)) translateX(var(--dot-radius)) scale(1);
      }
    }
  `],
})
export class SpiralLoaderComponent {
  /** Loader size in pixels */
  readonly size = input(80);
  /** Accessible label for screen readers */
  readonly label = input('Loading...');

  readonly spiralDots: SpiralDot[] = this.generateDots(42);

  private generateDots(count: number): SpiralDot[] {
    return Array.from({ length: count }, (_, id) => {
      const progress = id / count;
      return {
        id,
        angle: id * 25.7, // Golden angle approximation
        radius: 8 + progress * 42, // % of loader size
        size: 2 + (id % 4) * 0.7,
        delay: (id % 10) * 0.15,
        opacity: 0.28 + (id % 5) * 0.12,
      };
    });
  }
}
