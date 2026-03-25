import { Component, inject, input } from '@angular/core';
import { Location } from '@angular/common';
import { LucideArrowLeft } from '@lucide/angular';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [LucideArrowLeft],
  template: `
    <button
      type="button"
      class="back-button"
      (click)="goBack()"
      [attr.aria-label]="label() || 'Go back'"
    >
      <svg lucideArrowLeft [size]="20" [strokeWidth]="2" [attr.aria-hidden]="true"></svg>
      @if (showLabel()) {
        <span class="back-label">{{ label() }}</span>
      }
    </button>
  `,
  styles: [`
    .back-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: transparent;
      border: 1px solid rgba(255, 107, 107, 0.2);
      border-radius: 0.75rem;
      color: #636e72;
      font-family: 'Satoshi', sans-serif;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .back-button:hover {
      background: rgba(255, 107, 107, 0.05);
      border-color: rgba(255, 107, 107, 0.3);
      color: #ff6b6b;
      transform: translateX(-2px);
    }

    .back-button:active {
      transform: translateX(-4px);
    }

    :host-context(.dark) .back-button {
      border-color: rgba(255, 117, 116, 0.2);
      color: #a08d89;
    }

    :host-context(.dark) .back-button:hover {
      background: rgba(255, 117, 116, 0.1);
      border-color: rgba(255, 117, 116, 0.3);
      color: #ff7574;
    }

    .back-label {
      white-space: nowrap;
    }

    @media (prefers-reduced-motion: reduce) {
      .back-button {
        transition: none;
      }

      .back-button:hover,
      .back-button:active {
        transform: none;
      }
    }
  `]
})
export class BackButtonComponent {
  private readonly location = inject(Location);

  // Optional label text
  readonly label = input<string>('');

  // Show/hide label
  readonly showLabel = input(false);

  goBack(): void {
    this.location.back();
  }
}
