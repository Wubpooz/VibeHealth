import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type FabVariant = 'primary' | 'secondary' | 'danger' | 'success';

@Component({
  selector: 'app-fab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      class="fab"
      [class]="'fab-' + variant"
      [class.extended]="extended"
      [class.mini]="size === 'mini'"
      [class.pulsing]="pulse"
      [disabled]="disabled"
      (click)="onClick($event)"
      [attr.aria-label]="label"
    >
      <span class="fab-icon">
        <ng-content select="[icon]"></ng-content>
        @if (!hasCustomIcon) {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        }
      </span>
      @if (extended && label) {
        <span class="fab-label">{{ label }}</span>
      }
      
      <!-- Ripple effect container -->
      <span class="ripple-container">
        @if (showRipple()) {
          <span 
            class="ripple" 
            [style.left.px]="rippleX()" 
            [style.top.px]="rippleY()"
          ></span>
        }
      </span>
    </button>
  `,
  styles: [`
    .fab {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 56px;
      height: 56px;
      border: none;
      border-radius: 16px;
      cursor: pointer;
      overflow: hidden;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.15),
        0 8px 24px rgba(0, 0, 0, 0.1);
    }
    
    .fab:hover {
      transform: scale(1.05);
      box-shadow: 
        0 6px 16px rgba(0, 0, 0, 0.18),
        0 12px 32px rgba(0, 0, 0, 0.12);
    }
    
    .fab:active {
      transform: scale(0.95);
    }
    
    .fab:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    .fab.mini {
      width: 40px;
      height: 40px;
      border-radius: 12px;
    }
    
    .fab.extended {
      width: auto;
      padding: 0 1.5rem;
      border-radius: 28px;
    }
    
    /* Variants */
    .fab-primary {
      background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
      color: white;
    }
    
    .fab-primary:hover {
      box-shadow: 
        0 6px 20px rgba(244, 63, 94, 0.4),
        0 12px 32px rgba(244, 63, 94, 0.2);
    }
    
    .fab-secondary {
      background: linear-gradient(135deg, #34d399 0%, #059669 100%);
      color: white;
    }
    
    .fab-secondary:hover {
      box-shadow: 
        0 6px 20px rgba(52, 211, 153, 0.4),
        0 12px 32px rgba(52, 211, 153, 0.2);
    }
    
    .fab-danger {
      background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
      color: white;
    }
    
    .fab-success {
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: white;
    }
    
    /* Icon */
    .fab-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
    }
    
    .fab-icon svg {
      width: 100%;
      height: 100%;
    }
    
    .mini .fab-icon {
      width: 20px;
      height: 20px;
    }
    
    /* Label */
    .fab-label {
      font-weight: 700;
      font-size: 0.875rem;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }
    
    /* Pulse animation */
    .fab.pulsing {
      animation: fab-pulse 2s ease-in-out infinite;
    }
    
    @keyframes fab-pulse {
      0%, 100% {
        box-shadow: 
          0 4px 12px rgba(244, 63, 94, 0.3),
          0 0 0 0 rgba(244, 63, 94, 0.4);
      }
      50% {
        box-shadow: 
          0 4px 12px rgba(244, 63, 94, 0.3),
          0 0 0 12px rgba(244, 63, 94, 0);
      }
    }
    
    /* Ripple effect */
    .ripple-container {
      position: absolute;
      inset: 0;
      overflow: hidden;
      border-radius: inherit;
      pointer-events: none;
    }
    
    .ripple {
      position: absolute;
      width: 100px;
      height: 100px;
      margin-left: -50px;
      margin-top: -50px;
      background: rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      animation: ripple-expand 0.6s ease-out forwards;
      pointer-events: none;
    }
    
    @keyframes ripple-expand {
      0% {
        transform: scale(0);
        opacity: 1;
      }
      100% {
        transform: scale(4);
        opacity: 0;
      }
    }
    
    /* Dark mode */
    :host-context(.dark) .fab {
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.3),
        0 8px 24px rgba(0, 0, 0, 0.2);
    }
  `]
})
export class FabComponent {
  @Input() variant: FabVariant = 'primary';
  @Input() size: 'normal' | 'mini' = 'normal';
  @Input() extended = false;
  @Input() label = '';
  @Input() disabled = false;
  @Input() pulse = false;
  @Output() fabClick = new EventEmitter<MouseEvent>();
  
  hasCustomIcon = false;
  showRipple = signal(false);
  rippleX = signal(0);
  rippleY = signal(0);
  
  onClick(event: MouseEvent) {
    if (this.disabled) return;
    
    // Trigger ripple
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.rippleX.set(event.clientX - rect.left);
    this.rippleY.set(event.clientY - rect.top);
    this.showRipple.set(true);
    
    setTimeout(() => this.showRipple.set(false), 600);
    
    this.fabClick.emit(event);
  }
}
