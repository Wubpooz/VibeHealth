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
  | 'sparkles'
  | 'plus'
  | 'minus'
  | 'trash'
  | 'settings'
  | 'user'
  | 'home'
  | 'search'
  | 'menu'
  | 'close'
  | 'carrot'
  | 'droplet'
  | 'activity';

/**
 * Collection of animated SVG icons inspired by animateicons.in/lucide.
 * Icons animate on hover or when triggered via the `animate` input.
 *
 * Usage:
 *   <app-animated-icon name="check-circle" [size]="24" />
 */
@Component({
  selector: 'app-animated-icon',
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
        @case ('plus') {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path class="icon-plus-v" stroke-linecap="round" d="M12 5v14" />
            <path class="icon-plus-h" stroke-linecap="round" d="M5 12h14" />
          </svg>
        }
        @case ('minus') {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path class="icon-minus" stroke-linecap="round" d="M5 12h14" />
          </svg>
        }
        @case ('trash') {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path class="icon-trash-lid" stroke-linecap="round" stroke-linejoin="round" d="M3 6h18" />
            <path class="icon-trash-body" stroke-linecap="round" stroke-linejoin="round" d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path class="icon-trash-line" stroke-linecap="round" d="M10 11v6M14 11v6" />
          </svg>
        }
        @case ('settings') {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle class="icon-settings-center" cx="12" cy="12" r="3" />
            <path class="icon-settings-gear" stroke-linecap="round" stroke-linejoin="round" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        }
        @case ('user') {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle class="icon-user-head" cx="12" cy="7" r="4" />
            <path class="icon-user-body" stroke-linecap="round" d="M20 21a8 8 0 0 0-16 0" />
          </svg>
        }
        @case ('home') {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path class="icon-home-roof" stroke-linecap="round" stroke-linejoin="round" d="m3 9 9-7 9 7" />
            <path class="icon-home-body" stroke-linecap="round" stroke-linejoin="round" d="M9 22V12h6v10M5 9v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" />
          </svg>
        }
        @case ('search') {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle class="icon-search-circle" cx="11" cy="11" r="8" />
            <path class="icon-search-handle" stroke-linecap="round" d="m21 21-4.35-4.35" />
          </svg>
        }
        @case ('menu') {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path class="icon-menu-1" stroke-linecap="round" d="M4 6h16" />
            <path class="icon-menu-2" stroke-linecap="round" d="M4 12h16" />
            <path class="icon-menu-3" stroke-linecap="round" d="M4 18h16" />
          </svg>
        }
        @case ('close') {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path class="icon-close-1" stroke-linecap="round" d="M18 6 6 18" />
            <path class="icon-close-2" stroke-linecap="round" d="m6 6 12 12" />
          </svg>
        }
        @case ('carrot') {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path class="icon-carrot-body" stroke-linecap="round" stroke-linejoin="round" d="M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7" />
            <path class="icon-carrot-leaves" stroke-linecap="round" stroke-linejoin="round" d="M8.64 14c-.65-.65-.65-1.7 0-2.36 1.85-1.85 6.36-.51 6.36-.51s1.34 4.51-.51 6.36c-.65.65-1.7.65-2.36 0M17 6l-4.5 4.5M21 10l-4.5 4.5" />
          </svg>
        }
        @case ('droplet') {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path class="icon-droplet" stroke-linecap="round" stroke-linejoin="round" d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
        }
        @case ('activity') {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline class="icon-activity" stroke-linecap="round" stroke-linejoin="round" points="22 12 18 12 15 21 9 3 6 12 2 12" />
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

    /* ========== Plus ========== */
    .icon-plus-v, .icon-plus-h {
      transition: transform 0.25s ease;
    }

    .animated-icon:hover .icon-plus-v,
    .animated-icon.is-animating .icon-plus-v {
      animation: plusPulse 0.4s ease;
    }

    .animated-icon:hover .icon-plus-h,
    .animated-icon.is-animating .icon-plus-h {
      animation: plusPulse 0.4s ease 0.1s;
    }

    @keyframes plusPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.15); }
    }

    /* ========== Minus ========== */
    .icon-minus {
      transition: transform 0.25s ease;
    }

    .animated-icon:hover .icon-minus,
    .animated-icon.is-animating .icon-minus {
      animation: minusShrink 0.3s ease;
    }

    @keyframes minusShrink {
      0%, 100% { transform: scaleX(1); }
      50% { transform: scaleX(0.8); }
    }

    /* ========== Trash ========== */
    .icon-trash-lid {
      transform-origin: center;
      transition: transform 0.25s ease;
    }

    .animated-icon:hover .icon-trash-lid,
    .animated-icon.is-animating .icon-trash-lid {
      animation: trashLid 0.4s ease;
    }

    @keyframes trashLid {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-2px) rotate(-5deg); }
    }

    .icon-trash-body, .icon-trash-line {
      transition: transform 0.25s ease;
    }

    .animated-icon:hover .icon-trash-body,
    .animated-icon.is-animating .icon-trash-body {
      animation: trashShake 0.4s ease;
    }

    @keyframes trashShake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-1px); }
      75% { transform: translateX(1px); }
    }

    /* ========== Settings ========== */
    .icon-settings-gear {
      transform-origin: center;
      transition: transform 0.25s ease;
    }

    .animated-icon:hover .icon-settings-gear,
    .animated-icon.is-animating .icon-settings-gear {
      animation: settingsSpin 0.8s ease;
    }

    @keyframes settingsSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(90deg); }
    }

    /* ========== User ========== */
    .icon-user-head, .icon-user-body {
      transition: transform 0.25s ease;
    }

    .animated-icon:hover .icon-user-head,
    .animated-icon.is-animating .icon-user-head {
      animation: userBounce 0.5s ease;
    }

    @keyframes userBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-2px); }
    }

    /* ========== Home ========== */
    .icon-home-roof {
      transform-origin: center;
      transition: transform 0.25s ease;
    }

    .animated-icon:hover .icon-home-roof,
    .animated-icon.is-animating .icon-home-roof {
      animation: homeRoof 0.4s ease;
    }

    @keyframes homeRoof {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-2px); }
    }

    /* ========== Search ========== */
    .icon-search-circle, .icon-search-handle {
      transition: transform 0.25s ease;
    }

    .animated-icon:hover .icon-search-circle,
    .animated-icon.is-animating .icon-search-circle {
      animation: searchPulse 0.5s ease;
    }

    @keyframes searchPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    /* ========== Menu ========== */
    .icon-menu-1, .icon-menu-2, .icon-menu-3 {
      transition: transform 0.25s ease;
    }

    .animated-icon:hover .icon-menu-1,
    .animated-icon.is-animating .icon-menu-1 {
      animation: menuSlide 0.4s ease;
    }

    .animated-icon:hover .icon-menu-3,
    .animated-icon.is-animating .icon-menu-3 {
      animation: menuSlide 0.4s ease 0.1s;
    }

    @keyframes menuSlide {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(3px); }
    }

    /* ========== Close ========== */
    .icon-close-1, .icon-close-2 {
      transform-origin: center;
      transition: transform 0.25s ease;
    }

    .animated-icon:hover .icon-close-1,
    .animated-icon.is-animating .icon-close-1 {
      animation: closeRotate1 0.4s ease;
    }

    .animated-icon:hover .icon-close-2,
    .animated-icon.is-animating .icon-close-2 {
      animation: closeRotate2 0.4s ease;
    }

    @keyframes closeRotate1 {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(15deg); }
    }

    @keyframes closeRotate2 {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(-15deg); }
    }

    /* ========== Carrot (VibeHealth special!) ========== */
    .icon-carrot-body {
      transform-origin: bottom right;
      transition: transform 0.25s ease;
    }

    .animated-icon:hover .icon-carrot-body,
    .animated-icon.is-animating .icon-carrot-body {
      animation: carrotWiggle 0.5s ease;
    }

    .icon-carrot-leaves {
      transform-origin: bottom;
      transition: transform 0.25s ease;
    }

    .animated-icon:hover .icon-carrot-leaves,
    .animated-icon.is-animating .icon-carrot-leaves {
      animation: carrotLeaves 0.5s ease;
    }

    @keyframes carrotWiggle {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(5deg); }
      75% { transform: rotate(-3deg); }
    }

    @keyframes carrotLeaves {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-8deg); }
      75% { transform: rotate(5deg); }
    }

    /* ========== Droplet ========== */
    .icon-droplet {
      transform-origin: center;
      transition: transform 0.25s ease;
    }

    .animated-icon:hover .icon-droplet,
    .animated-icon.is-animating .icon-droplet {
      animation: dropletBounce 0.5s ease;
    }

    @keyframes dropletBounce {
      0%, 100% { transform: translateY(0) scale(1); }
      30% { transform: translateY(-3px) scale(1.05); }
      50% { transform: translateY(0) scale(0.95); }
      70% { transform: translateY(-1px) scale(1.02); }
    }

    /* ========== Activity ========== */
    .icon-activity {
      stroke-dasharray: 60;
      stroke-dashoffset: 60;
      transition: stroke-dashoffset 0.5s ease;
    }

    .animated-icon:hover .icon-activity,
    .animated-icon.is-animating .icon-activity {
      stroke-dashoffset: 0;
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
      .icon-sparkle-main,
      .icon-plus-v, .icon-plus-h,
      .icon-minus,
      .icon-trash-lid, .icon-trash-body,
      .icon-settings-gear,
      .icon-user-head, .icon-user-body,
      .icon-home-roof,
      .icon-search-circle,
      .icon-menu-1, .icon-menu-2, .icon-menu-3,
      .icon-close-1, .icon-close-2,
      .icon-carrot-body, .icon-carrot-leaves,
      .icon-droplet,
      .icon-activity {
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
