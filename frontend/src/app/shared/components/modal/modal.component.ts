import { Component, Input, Output, EventEmitter, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div 
        class="modal-backdrop"
        [class.closing]="isClosing()"
        role="presentation"
        (click)="onBackdropClick()"
        (keydown.escape)="onBackdropClick()"
      >
        <div 
          class="modal-container"
          [class]="'modal-' + size"
          [class.closing]="isClosing()"
          (click)="$event.stopPropagation()"
          (keydown)="$event.stopPropagation()"
          role="dialog"
          [attr.aria-modal]="true"
          [attr.aria-labelledby]="title ? 'modal-title' : null"
        >
          <!-- Header -->
          @if (title || showClose) {
            <div class="modal-header">
              @if (title) {
                <h2 id="modal-title" class="modal-title">{{ title }}</h2>
              }
              @if (showClose) {
                <button 
                  class="close-btn"
                  (click)="close()"
                  aria-label="Close modal"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              }
            </div>
          }
          
          <!-- Body -->
          <div class="modal-body" [class.no-header]="!title && !showClose">
            <ng-content></ng-content>
          </div>
          
          <!-- Footer (optional slot) -->
          <div class="modal-footer">
            <ng-content select="[footer]"></ng-content>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      animation: backdrop-fade-in 0.2s ease-out;
    }
    
    .modal-backdrop.closing {
      animation: backdrop-fade-out 0.2s ease-out forwards;
    }
    
    @keyframes backdrop-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes backdrop-fade-out {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    
    .modal-container {
      position: relative;
      width: 100%;
      max-height: calc(100vh - 2rem);
      background: white;
      border-radius: 24px;
      box-shadow: 
        0 25px 50px rgba(0, 0, 0, 0.15),
        0 0 0 1px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: modal-slide-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    .modal-container.closing {
      animation: modal-slide-down 0.2s ease-out forwards;
    }
    
    @keyframes modal-slide-up {
      from { 
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    @keyframes modal-slide-down {
      from { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      to { 
        opacity: 0;
        transform: translateY(10px) scale(0.98);
      }
    }
    
    /* Sizes */
    .modal-sm { max-width: 360px; }
    .modal-md { max-width: 480px; }
    .modal-lg { max-width: 640px; }
    .modal-xl { max-width: 800px; }
    .modal-full { max-width: 100%; height: 100%; border-radius: 0; }
    
    /* Header */
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #F3F4F6;
    }
    
    .modal-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: #1F2937;
      margin: 0;
    }
    
    .close-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 10px;
      background: #F3F4F6;
      color: #6B7280;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .close-btn:hover {
      background: #E5E7EB;
      color: #1F2937;
    }
    
    .close-btn svg {
      width: 18px;
      height: 18px;
    }
    
    /* Body */
    .modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
    }
    
    .modal-body.no-header {
      padding-top: 2rem;
    }
    
    /* Footer */
    .modal-footer:not(:empty) {
      padding: 1rem 1.5rem;
      border-top: 1px solid #F3F4F6;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }
    
    /* Scrollbar styling */
    .modal-body::-webkit-scrollbar {
      width: 6px;
    }
    
    .modal-body::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .modal-body::-webkit-scrollbar-thumb {
      background: #D1D5DB;
      border-radius: 3px;
    }
    
    .modal-body::-webkit-scrollbar-thumb:hover {
      background: #9CA3AF;
    }
    
    /* Dark mode */
    :host-context(.dark) .modal-container {
      background: #1F1F1F;
      box-shadow: 
        0 25px 50px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.05);
    }
    
    :host-context(.dark) .modal-header {
      border-color: #374151;
    }
    
    :host-context(.dark) .modal-title {
      color: #F9FAFB;
    }
    
    :host-context(.dark) .close-btn {
      background: #374151;
      color: #9CA3AF;
    }
    
    :host-context(.dark) .close-btn:hover {
      background: #4B5563;
      color: #F9FAFB;
    }
    
    :host-context(.dark) .modal-footer {
      border-color: #374151;
    }
    
    /* Responsive */
    @media (max-width: 640px) {
      .modal-container:not(.modal-full) {
        max-width: 100%;
        max-height: 85vh;
        margin-top: auto;
        border-radius: 24px 24px 0 0;
        animation: modal-slide-up-mobile 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      
      @keyframes modal-slide-up-mobile {
        from { 
          opacity: 0;
          transform: translateY(100%);
        }
        to { 
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .modal-backdrop {
        align-items: flex-end;
        padding: 0;
      }
    }
  `]
})
export class ModalComponent {
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
  @Input() title = '';
  @Input() showClose = true;
  @Input() closeOnBackdrop = true;
  @Input() closeOnEscape = true;
  @Output() closed = new EventEmitter<void>();
  
  isOpen = signal(false);
  isClosing = signal(false);
  
  open() {
    this.isOpen.set(true);
    this.isClosing.set(false);
    document.body.style.overflow = 'hidden';
  }
  
  close() {
    this.isClosing.set(true);
    setTimeout(() => {
      this.isOpen.set(false);
      this.isClosing.set(false);
      document.body.style.overflow = '';
      this.closed.emit();
    }, 200);
  }
  
  onBackdropClick() {
    if (this.closeOnBackdrop) {
      this.close();
    }
  }
  
  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.closeOnEscape && this.isOpen()) {
      this.close();
    }
  }
}
