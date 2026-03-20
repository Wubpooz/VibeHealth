import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Scroll-to-top button with circular progress indicator.
 * Progress ring fills as user scrolls down the page.
 */
@Component({
  selector: 'app-scroll-top-progress',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isVisible()) {
      <button
        class="scroll-top-btn"
        type="button"
        (click)="scrollToTop()"
        aria-label="Scroll to top"
      >
        <svg class="ring" viewBox="0 0 100 100" aria-hidden="true">
          <circle class="ring-bg" cx="50" cy="50" r="46" />
          <circle
            class="ring-progress"
            cx="50"
            cy="50"
            r="46"
            [style.stroke-dashoffset]="dashOffset()"
          />
        </svg>
        <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    }
  `,
  styles: [`
    :host {
      position: fixed;
      right: 1.25rem;
      bottom: 1.25rem;
      z-index: 65;
      pointer-events: none;
    }

    .scroll-top-btn {
      pointer-events: auto;
      position: relative;
      display: grid;
      place-items: center;
      width: 48px;
      height: 48px;
      border: none;
      border-radius: 999px;
      background: transparent;
      color: #0f172a;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .scroll-top-btn:hover {
      transform: scale(1.08);
    }

    .scroll-top-btn:hover .arrow {
      color: #e11d48;
    }

    .ring {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .ring-bg,
    .ring-progress {
      fill: none;
      stroke-width: 4;
    }

    .ring-bg {
      stroke: rgba(15, 23, 42, 0.1);
    }

    .ring-progress {
      stroke: #e11d48;
      stroke-linecap: round;
      stroke-dasharray: 289;
      transition: stroke-dashoffset 0.15s linear;
    }

    .arrow {
      width: 1.3rem;
      height: 1.3rem;
      transition: color 0.2s ease;
    }

    @media (prefers-reduced-motion: reduce) {
      .scroll-top-btn,
      .ring-progress,
      .arrow {
        transition: none !important;
      }
    }
  `],
})
export class ScrollTopProgressComponent {
  private readonly destroyRef = inject(DestroyRef);
  /** Circumference = 2πr = 2 × π × 46 ≈ 289 */
  private readonly circumference = 289;

  readonly progress = signal(0);
  readonly isVisible = signal(false);

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }

    const onScroll = () => {
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - document.documentElement.clientHeight,
      );
      const current = window.scrollY;
      const ratio = Math.min(1, Math.max(0, current / max));
      this.progress.set(ratio);
      this.isVisible.set(current > 220);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
    });
  }

  dashOffset(): number {
    return this.circumference * (1 - this.progress());
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
