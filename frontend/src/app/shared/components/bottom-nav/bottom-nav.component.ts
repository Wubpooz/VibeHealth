import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="bottom-nav" [class.hidden]="hidden()">
      <!-- Active indicator pill -->
      <div 
        class="active-pill" 
        [style.left.%]="activePillPosition()"
        [style.opacity]="showPill() ? 1 : 0"
      ></div>
      
      @for (item of items; track item.id; let i = $index) {
        <a 
          class="nav-item"
          [routerLink]="item.route"
          routerLinkActive="active"
          (click)="onItemClick(i)"
          [attr.aria-label]="item.label"
        >
          <div class="nav-icon-wrapper">
            <!-- Custom SVG icons for each type -->
            @switch (item.icon) {
              @case ('home') {
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
              }
              @case ('medical') {
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              }
              @case ('journal') {
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                  <line x1="8" y1="7" x2="16" y2="7"/>
                  <line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
              }
              @case ('profile') {
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              }
              @case ('firstaid') {
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <line x1="12" y1="8" x2="12" y2="16"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
              }
              @default {
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              }
            }
            
            <!-- Badge -->
            @if (item.badge && item.badge > 0) {
              <span class="badge">{{ item.badge > 99 ? '99+' : item.badge }}</span>
            }
          </div>
          <span class="nav-label">{{ item.label }}</span>
        </a>
      }
    </nav>
  `,
  styles: [`
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 100;
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 0.5rem 0.75rem;
      padding-bottom: calc(0.5rem + env(safe-area-inset-bottom, 0));
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-top: 1px solid rgba(0, 0, 0, 0.06);
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .bottom-nav.hidden {
      transform: translateY(100%);
    }
    
    /* Active pill indicator */
    .active-pill {
      position: absolute;
      top: 4px;
      width: calc(100% / 5 - 1rem);
      height: 3px;
      background: linear-gradient(90deg, #f43f5e, #fb7185);
      border-radius: 0 0 4px 4px;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 2px 8px rgba(244, 63, 94, 0.4);
    }
    
    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
      padding: 0.5rem 1rem;
      text-decoration: none;
      color: #9CA3AF;
      transition: all 0.2s ease;
      position: relative;
      min-width: 60px;
    }
    
    .nav-item.active {
      color: #f43f5e;
    }
    
    .nav-item:active {
      transform: scale(0.95);
    }
    
    .nav-icon-wrapper {
      position: relative;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .nav-icon {
      width: 24px;
      height: 24px;
      transition: all 0.2s ease;
    }
    
    .nav-item.active .nav-icon {
      transform: scale(1.1);
      stroke-width: 2.5;
    }
    
    .nav-label {
      font-size: 0.625rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      transition: all 0.2s ease;
    }
    
    .nav-item.active .nav-label {
      font-weight: 700;
    }
    
    /* Badge */
    .badge {
      position: absolute;
      top: -4px;
      right: -8px;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      border-radius: 8px;
      background: linear-gradient(135deg, #f43f5e, #e11d48);
      color: white;
      font-size: 0.625rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(244, 63, 94, 0.4);
      animation: badge-pulse 2s ease-in-out infinite;
    }
    
    @keyframes badge-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    /* Dark mode */
    :host-context(.dark) .bottom-nav {
      background: rgba(17, 17, 17, 0.95);
      border-color: rgba(255, 255, 255, 0.06);
    }
    
    :host-context(.dark) .nav-item {
      color: #6B7280;
    }
    
    :host-context(.dark) .nav-item.active {
      color: #fb7185;
    }
    
    /* Responsive adjustments */
    @media (min-width: 768px) {
      .bottom-nav {
        display: none;
      }
    }
  `]
})
export class BottomNavComponent {
  @Input() items: NavItem[] = [];
  @Input() hidden = signal(false);
  @Output() navigate = new EventEmitter<NavItem>();
  
  private router = inject(Router);
  
  private activeIndex = signal(0);
  
  readonly showPill = signal(false);
  
  readonly activePillPosition = () => {
    const count = this.items.length || 1;
    const index = this.activeIndex();
    const itemWidth = 100 / count;
    return (index * itemWidth) + (itemWidth / 2) - (itemWidth / 2);
  };
  
  onItemClick(index: number) {
    this.activeIndex.set(index);
    this.showPill.set(true);
    this.navigate.emit(this.items[index]);
  }
  
  constructor() {
    // Show pill after a brief delay for initial render
    setTimeout(() => this.showPill.set(true), 100);
  }
}
