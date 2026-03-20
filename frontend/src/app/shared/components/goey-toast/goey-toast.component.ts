import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService, type ToastTone } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-goey-toast',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="toast-portal" aria-live="polite" aria-atomic="true">
      @for (toast of toastService.toasts(); track toast.id) {
        <article class="goey-toast" [class]="toneClass(toast.tone)">
          <div class="blob blob-a" aria-hidden="true"></div>
          <div class="blob blob-b" aria-hidden="true"></div>
          <div class="blob blob-c" aria-hidden="true"></div>

          <div class="content">
            @if (toast.title) {
              <h3 class="title">{{ toast.title }}</h3>
            }
            <p class="message">{{ toast.message }}</p>
            @if (toast.action; as action) {
              <button type="button" class="action" (click)="runAction(toast.id, action.callback)">
                {{ action.label }}
              </button>
            }
          </div>

          <button
            type="button"
            class="close"
            [attr.aria-label]="'common.dismiss_notification' | translate"
            (click)="toastService.dismiss(toast.id)"
          >
            ×
          </button>
        </article>
      }
    </section>
  `,
  styles: [`
    :host {
      position: fixed;
      inset: auto 1rem 1rem auto;
      z-index: 70;
      pointer-events: none;
    }

    .toast-portal {
      display: grid;
      gap: 0.7rem;
      max-width: min(92vw, 380px);
    }

    .goey-toast {
      pointer-events: auto;
      position: relative;
      overflow: hidden;
      border-radius: 1.15rem;
      border: 1px solid rgba(255, 255, 255, 0.32);
      padding: 0.9rem 0.95rem;
      color: #fff;
      box-shadow: 0 18px 32px -20px rgba(0, 0, 0, 0.45);
      isolation: isolate;
      animation: toastIn 0.46s cubic-bezier(0.2, 0.9, 0.2, 1) both;
      will-change: transform, opacity;
    }

    .tone-success { background: linear-gradient(140deg, #059669 0%, #34d399 60%, #6ee7b7 100%); }
    .tone-error { background: linear-gradient(140deg, #be123c 0%, #f43f5e 60%, #fb7185 100%); }
    .tone-info { background: linear-gradient(140deg, #1d4ed8 0%, #3b82f6 58%, #60a5fa 100%); }
    .tone-warning { background: linear-gradient(140deg, #c2410c 0%, #f97316 58%, #fdba74 100%); }

    .blob {
      position: absolute;
      border-radius: 999px;
      filter: blur(14px);
      opacity: 0.65;
      z-index: -1;
      animation: blobMove 5s ease-in-out infinite;
    }

    .blob-a {
      width: 90px;
      height: 90px;
      background: rgba(255, 255, 255, 0.42);
      left: -24px;
      top: -34px;
    }

    .blob-b {
      width: 78px;
      height: 78px;
      background: rgba(255, 255, 255, 0.35);
      right: -24px;
      top: 12px;
      animation-delay: -1.6s;
    }

    .blob-c {
      width: 62px;
      height: 62px;
      background: rgba(255, 255, 255, 0.25);
      right: 60px;
      bottom: -22px;
      animation-delay: -2.9s;
    }

    .content {
      display: grid;
      gap: 0.24rem;
      padding-right: 2rem;
    }

    .title {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 700;
      letter-spacing: 0.01em;
    }

    .message {
      margin: 0;
      font-size: 0.84rem;
      line-height: 1.35;
      opacity: 0.97;
    }

    .action {
      justify-self: start;
      margin-top: 0.35rem;
      border: 1px solid rgba(255, 255, 255, 0.45);
      background: rgba(255, 255, 255, 0.16);
      color: #fff;
      border-radius: 0.75rem;
      padding: 0.28rem 0.6rem;
      font-size: 0.72rem;
      font-weight: 700;
      cursor: pointer;
      transition: background-color 0.2s ease, transform 0.2s ease;
    }

    .action:hover {
      background: rgba(255, 255, 255, 0.28);
      transform: translateY(-1px);
    }

    .close {
      position: absolute;
      right: 0.45rem;
      top: 0.4rem;
      width: 1.5rem;
      height: 1.5rem;
      border: none;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.16);
      color: #fff;
      font-size: 1.1rem;
      line-height: 1;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .close:hover {
      background: rgba(255, 255, 255, 0.28);
    }

    @keyframes toastIn {
      from {
        opacity: 0;
        transform: translateY(14px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes blobMove {
      0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
      50% { transform: translate3d(8px, -7px, 0) scale(1.08); }
    }

    @media (prefers-reduced-motion: reduce) {
      .goey-toast,
      .blob {
        animation: none !important;
      }
    }
  `],
})
export class GoeyToastComponent {
  readonly toastService = inject(ToastService);

  toneClass(tone: ToastTone): string {
    return `tone-${tone}`;
  }

  runAction(id: string, callback: () => void): void {
    callback();
    this.toastService.dismiss(id);
  }
}
