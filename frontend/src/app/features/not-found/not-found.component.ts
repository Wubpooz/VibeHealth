import {
  ChangeDetectionStrategy,
  Component,
  signal,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

/**
 * Custom 404 page with playful eye-tracking animation.
 * Inspired by A Color Bright's 404 design.
 */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="not-found-page">
      <div class="grain"></div>

      <section class="content">
        <p class="eyebrow">VibeHealth</p>

        <!-- Eyes row: 4 + 0 + 4 -->
        <div class="eyes-row">
          <div class="digit-eyes">
            <div class="eye">
              <div class="pupil" [style.transform]="pupilTransform()"></div>
            </div>
            <div class="eye">
              <div class="pupil" [style.transform]="pupilTransform()"></div>
            </div>
          </div>
          <span class="digit-zero">0</span>
          <div class="digit-eyes">
            <div class="eye">
              <div class="pupil" [style.transform]="pupilTransform()"></div>
            </div>
            <div class="eye">
              <div class="pupil" [style.transform]="pupilTransform()"></div>
            </div>
          </div>
        </div>

        <p class="title">Page not found</p>
        <p class="subtitle">
          Looks like this page hopped away. Let's get you back on track.
        </p>

        <div class="actions">
          <a routerLink="/" class="btn primary">Go Home</a>
          <a routerLink="/dashboard" class="btn ghost">Dashboard</a>
        </div>
      </section>

      <!-- Decorative colored orbs -->
      <div class="orb orb-rose" aria-hidden="true"></div>
      <div class="orb orb-amber" aria-hidden="true"></div>
      <div class="orb orb-sage" aria-hidden="true"></div>
      <div class="orb orb-violet" aria-hidden="true"></div>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100dvh;
    }

    .not-found-page {
      position: relative;
      min-height: 100dvh;
      overflow: hidden;
      display: grid;
      place-items: center;
      padding: 1.5rem;
      background: #fffbf5;
    }

    :host-context(.light) .not-found-page {
      background: #fffbf5;
    }

    :host-context(.dark) .not-found-page {
      background: #090b11;
    }

    .grain {
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0.04;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    }

    .content {
      position: relative;
      z-index: 2;
      text-align: center;
      max-width: 560px;
    }

    .eyebrow {
      margin: 0 0 1.2rem;
      font-weight: 700;
      letter-spacing: 0.13em;
      text-transform: uppercase;
      color: #e11d48;
      font-size: 0.82rem;
    }

    /* Eyes row layout */
    .eyes-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: clamp(0.5rem, 2vw, 1.2rem);
      margin-bottom: 1.6rem;
    }

    .digit-eyes {
      display: flex;
      gap: clamp(0.3rem, 1vw, 0.6rem);
    }

    .eye {
      width: clamp(2.8rem, 8vw, 4.5rem);
      height: clamp(4rem, 11vw, 6.5rem);
      background: #fff;
      border-radius: 999px;
      border: 3px solid #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      box-shadow:
        inset 0 4px 12px rgba(0, 0, 0, 0.06),
        0 8px 24px -8px rgba(15, 23, 42, 0.12);
    }

    .pupil {
      width: clamp(1.1rem, 3vw, 1.6rem);
      height: clamp(1.1rem, 3vw, 1.6rem);
      background: radial-gradient(circle at 35% 35%, #334155 0%, #0f172a 60%);
      border-radius: 999px;
      transition: transform 0.08s ease-out;
      will-change: transform;
      position: relative;
    }

    .pupil::after {
      content: '';
      position: absolute;
      top: 20%;
      left: 25%;
      width: 30%;
      height: 30%;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 50%;
    }

    .digit-zero {
      font-size: clamp(4rem, 14vw, 8rem);
      font-weight: 800;
      color: #0f172a;
      line-height: 1;
      letter-spacing: -0.04em;
    }

    .title {
      margin: 0 0 0.6rem;
      font-size: clamp(1.3rem, 3.5vw, 2rem);
      font-weight: 700;
      color: #0f172a;
    }

    .subtitle {
      margin: 0 auto 1.6rem;
      max-width: 38ch;
      color: #475569;
      line-height: 1.55;
      font-size: clamp(0.95rem, 2vw, 1.1rem);
    }

    :host-context(.dark) .eyebrow {
      color: #f9a8d4;
    }

    :host-context(.dark) .digit-zero,
    :host-context(.dark) .title {
      color: #e2e8f0;
    }

    :host-context(.dark) .subtitle {
      color: #cbd5e1;
    }

    :host-context(.dark) .btn.primary {
      background: #eab308;
      color: #0f172a;
      box-shadow: 0 12px 28px -12px rgba(234, 179, 8, 0.8);
    }

    :host-context(.dark) .btn.ghost {
      color: #e2e8f0;
      background: rgba(255, 255, 255, 0.12);
    }

    :host-context(.dark) .btn.ghost:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .actions {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .btn {
      border-radius: 999px;
      padding: 0.72rem 1.4rem;
      font-weight: 700;
      text-decoration: none;
      font-size: 0.95rem;
      transition: transform 0.18s ease, box-shadow 0.18s ease;
    }

    .btn:hover {
      transform: translateY(-2px);
    }

    .btn.primary {
      color: #fff;
      background: #0f172a;
      box-shadow: 0 12px 28px -12px rgba(15, 23, 42, 0.5);
    }

    .btn.primary:hover {
      box-shadow: 0 16px 32px -10px rgba(15, 23, 42, 0.55);
    }

    .btn.ghost {
      color: #0f172a;
      background: rgba(15, 23, 42, 0.06);
    }

    .btn.ghost:hover {
      background: rgba(15, 23, 42, 0.1);
    }

    /* Decorative orbs */
    .orb {
      position: absolute;
      border-radius: 999px;
      filter: blur(24px);
      opacity: 0.75;
      z-index: 1;
    }

    .orb-rose {
      width: min(32vw, 220px);
      height: min(32vw, 220px);
      top: 8%;
      left: 6%;
      background: #fb7185;
    }

    .orb-amber {
      width: min(26vw, 180px);
      height: min(26vw, 180px);
      top: 12%;
      right: 8%;
      background: #fbbf24;
    }

    .orb-sage {
      width: min(28vw, 200px);
      height: min(28vw, 200px);
      bottom: 10%;
      right: 12%;
      background: #34d399;
    }

    .orb-violet {
      width: min(24vw, 160px);
      height: min(24vw, 160px);
      bottom: 14%;
      left: 10%;
      background: #a78bfa;
    }

    @media (prefers-reduced-motion: reduce) {
      .pupil {
        transition: none !important;
      }
      .btn {
        transition: none !important;
      }
    }
  `],
})
export class NotFoundComponent {
  private readonly mouseX = signal(0.5);
  private readonly mouseY = signal(0.5);

  /** Maximum pupil displacement in pixels */
  private readonly maxOffset = 8;

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    // Normalize to 0–1 range
    this.mouseX.set(event.clientX / window.innerWidth);
    this.mouseY.set(event.clientY / window.innerHeight);
  }

  /** CSS transform for pupil based on cursor position */
  pupilTransform(): string {
    // Map 0–1 to -1 to 1
    const dx = (this.mouseX() - 0.5) * 2 * this.maxOffset;
    const dy = (this.mouseY() - 0.5) * 2 * this.maxOffset;
    return `translate(${dx}px, ${dy}px)`;
  }
}
