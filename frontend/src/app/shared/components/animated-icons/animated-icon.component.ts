import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type AnimatedIconName =
  | 'check-circle'
  | 'shield-check'
  | 'heart'
  | 'bell'
  | 'download'
  | 'loader'
  | 'arrow-right'
  | 'sparkles';

/**
 * Collection of animated SVG icons inspired by animateicons.in/lucide.
 * Icons animate on hover or when triggered via the `animate` input.
 *
 * Usage:
 *   <app-animated-icon name="check-circle" [size]="24" />
 */
@Component({
  selector: 'app-animated-icon',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="animated-icon"
      [class.is-animating]="animate()"
      [style.--icon-size]="size() + 'px'"
      [style.--icon-color]="color()"
      [attr.aria-hidden]="true"
    >
      @switch (name()) {
        @case ('check-circle') {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle class="icon-circle" cx="12" cy="12" r="10" />
            <path class="icon-check" stroke-linecap="round" stroke-linejoin="round" d="m8 12 2.5 2.5L16 9" />
          </svg>
        }
        @case ('shield-check') {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path class="icon-shield" stroke-linecap="round" stroke-linejoin="round" d="M12 3l7 3v5c0 5-3.5 8.7-7 10-3.5-1.3-7-5-7-10V6l7-3Z" />
            <path class="icon-check" stroke-linecap="round" stroke-linejoin="round" d="m9 12 2 2 4-4" />
          </svg>
        }
        @case ('heart') {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path class="icon-heart" stroke-linecap="round" stroke-linejoin="round" d="M12 20s-7-4.5-9-8C1 8 3 4 7 4c2.2 0 3.7 1.2 5 3 1.3-1.8 2.8-3 5-3 4 0 6 4 4 8-2 3.5-9 8-9 8Z" />
          </svg>
        }
        @case ('bell') {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path class="icon-bell" stroke-linecap="round" stroke-linejoin="round" d="M10 5a2 2 0 1 1 4 0 7 7 0 0 1 4 6v3a4 4 0 0 0 2 3H4a4 4 0 0 0 2-3v-3a7 7 0 0 1 4-6" />
            <path class="icon-clapper" stroke-linecap="round" stroke-linejoin="round" d="M9 17v1a3 3 0 0 0 6 0v-1" />
          </svg>
        }
        @case ('download') {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path class="icon-arrow" stroke-linecap="round" stroke-linejoin="round" d="M12 4v12m0 0-4-4m4 4 4-4" />
            <path class="icon-line" stroke-linecap="round" stroke-linejoin="round" d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
        }
        @case ('loader') {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle class="icon-loader-ring" cx="12" cy="12" r="10" />
          </svg>
        }
        @case ('arrow-right') {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path class="icon-line" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
            <path class="icon-head" stroke-linecap="round" stroke-linejoin="round" d="m13 6 6 6-6 6" />
          </svg>
        }
        @case ('sparkles') {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path class="icon-sparkle-main" stroke-linecap="round" stroke-linejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.36-6.36-1.42 1.42M7.06 16.94l-1.42 1.42m12.72 0-1.42-1.42M7.06 7.06 5.64 5.64" />
          </svg>
        }
        @default {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
          </svg>
        }
      }
    </span>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .animated-icon {
      --icon-size: 24px;
      --icon-color: currentColor;
      display: inline-flex;
      width: var(--icon-size);
      height: var(--icon-size);
      color: var(--icon-color);
    }

    svg {
      width: 100%;
      height: 100%;
    }

    /* ========== Check Circle ========== */
    .icon-circle {
      stroke-dasharray: 63;
      stroke-dashoffset: 63;
      transition: stroke-dashoffset 0.5s ease;
    }

    .animated-icon:hover .icon-circle,
    .animated-icon.is-animating .icon-circle {
      stroke-dashoffset: 0;
    }

    .icon-check {
      stroke-dasharray: 20;
      stroke-dashoffset: 20;
      transition: stroke-dashoffset 0.35s ease 0.35s;
    }

    .animated-icon:hover .icon-check,
    .animated-icon.is-animating .icon-check {
      stroke-dashoffset: 0;
    }

    /* ========== Shield ========== */
    .icon-shield {
      stroke-dasharray: 60;
      stroke-dashoffset: 0;
      transition: stroke-dashoffset 0.4s ease;
    }

    .animated-icon:hover .icon-shield,
    .animated-icon.is-animating .icon-shield {
      animation: shieldPulse 0.6s ease;
    }

    @keyframes shieldPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.08); }
    }

    /* ========== Heart ========== */
    .icon-heart {
      transform-origin: center;
      transition: transform 0.25s ease;
    }

    .animated-icon:hover .icon-heart,
    .animated-icon.is-animating .icon-heart {
      animation: heartBeat 0.6s ease;
    }

    @keyframes heartBeat {
      0%, 100% { transform: scale(1); }
      15% { transform: scale(1.15); }
      30% { transform: scale(1); }
      45% { transform: scale(1.1); }
    }

    /* ========== Bell ========== */
    .icon-bell {
      transform-origin: top center;
      transition: transform 0.25s ease;
    }

    .animated-icon:hover .icon-bell,
    .animated-icon.is-animating .icon-bell {
      animation: bellSwing 0.6s ease;
    }

    @keyframes bellSwing {
      0%, 100% { transform: rotate(0deg); }
      20% { transform: rotate(12deg); }
      40% { transform: rotate(-10deg); }
      60% { transform: rotate(6deg); }
      80% { transform: rotate(-3deg); }
    }

    /* ========== Download ========== */
    .icon-arrow {
      transition: transform 0.3s ease;
    }

    .animated-icon:hover .icon-arrow,
    .animated-icon.is-animating .icon-arrow {
      animation: downloadBounce 0.5s ease;
    }

    @keyframes downloadBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(3px); }
    }

    /* ========== Loader ========== */
    .icon-loader-ring {
      stroke-dasharray: 60 8;
      stroke-linecap: round;
      animation: loaderSpin 1.2s linear infinite;
    }

    @keyframes loaderSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* ========== Arrow Right ========== */
    .icon-line,
    .icon-head {
      transition: transform 0.25s ease;
    }

    .animated-icon:hover .icon-line,
    .animated-icon.is-animating .icon-line {
      transform: translateX(2px);
    }

    .animated-icon:hover .icon-head,
    .animated-icon.is-animating .icon-head {
      transform: translateX(2px);
    }

    /* ========== Sparkles ========== */
    .icon-sparkle-main {
      transform-origin: center;
    }

    .animated-icon:hover .icon-sparkle-main,
    .animated-icon.is-animating .icon-sparkle-main {
      animation: sparkleRotate 0.7s ease;
    }

    @keyframes sparkleRotate {
      0% { transform: rotate(0deg) scale(1); opacity: 1; }
      50% { transform: rotate(180deg) scale(0.85); opacity: 0.7; }
      100% { transform: rotate(360deg) scale(1); opacity: 1; }
    }

    /* ========== Reduced Motion ========== */
    @media (prefers-reduced-motion: reduce) {
      .icon-circle,
      .icon-check,
      .icon-shield,
      .icon-heart,
      .icon-bell,
      .icon-arrow,
      .icon-line,
      .icon-head,
      .icon-sparkle-main {
        animation: none !important;
        transition: none !important;
      }

      .icon-loader-ring {
        animation: none !important;
        stroke-dasharray: 40 28;
      }
    }
  `],
})
export class AnimatedIconComponent {
  readonly name = input.required<AnimatedIconName>();
  readonly size = input(24);
  readonly color = input('currentColor');
  /** Force animation state (useful for programmatic triggering) */
  readonly animate = input(false);
}
