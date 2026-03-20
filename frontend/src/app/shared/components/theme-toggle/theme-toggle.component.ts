import { Component, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

type Theme = 'light' | 'dark' | 'system';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      class="theme-toggle"
      [class.dark-active]="isDark()"
      (click)="toggleTheme()"
      [attr.aria-label]="isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
    >
      <div class="toggle-track">
        <!-- Sun icon -->
        <div class="icon sun-icon" [class.active]="!isDark()">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="5"/>
            <g stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </g>
          </svg>
        </div>
        
        <!-- Moon icon -->
        <div class="icon moon-icon" [class.active]="isDark()">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </div>
        
        <!-- Slider thumb -->
        <div class="thumb" [class.dark]="isDark()">
          <!-- Stars inside thumb when dark -->
          @if (isDark()) {
            <div class="stars">
              <span class="star s1">✦</span>
              <span class="star s2">✦</span>
            </div>
          }
        </div>
      </div>
    </button>
  `,
  styles: [`
    .theme-toggle {
      position: relative;
      width: 64px;
      height: 32px;
      padding: 0;
      border: none;
      background: transparent;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    
    .toggle-track {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 16px;
      background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
      box-shadow: 
        inset 0 2px 4px rgba(0, 0, 0, 0.1),
        0 2px 8px rgba(0, 0, 0, 0.05);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }
    
    .dark-active .toggle-track {
      background: linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%);
    }
    
    /* Icons */
    .icon {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 18px;
      height: 18px;
      transition: all 0.3s ease;
      opacity: 0.4;
    }
    
    .icon.active {
      opacity: 1;
    }
    
    .sun-icon {
      left: 6px;
      color: #F59E0B;
    }
    
    .moon-icon {
      right: 6px;
      color: #E2E8F0;
    }
    
    .icon svg {
      width: 100%;
      height: 100%;
    }
    
    /* Thumb */
    .thumb {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: linear-gradient(135deg, #FFFFFF 0%, #FEF3C7 100%);
      box-shadow: 
        0 2px 8px rgba(0, 0, 0, 0.15),
        0 1px 2px rgba(0, 0, 0, 0.1);
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    
    .thumb.dark {
      left: calc(100% - 29px);
      background: linear-gradient(135deg, #475569 0%, #1E293B 100%);
    }
    
    /* Stars in dark mode */
    .stars {
      position: relative;
      width: 100%;
      height: 100%;
    }
    
    .star {
      position: absolute;
      color: #FEF3C7;
      font-size: 6px;
      animation: twinkle 1.5s ease-in-out infinite;
    }
    
    .s1 {
      top: 5px;
      left: 6px;
      animation-delay: 0s;
    }
    
    .s2 {
      bottom: 6px;
      right: 5px;
      font-size: 4px;
      animation-delay: 0.5s;
    }
    
    @keyframes twinkle {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.2); }
    }
    
    /* Hover effects */
    .theme-toggle:hover .thumb {
      transform: scale(1.05);
    }
    
    .theme-toggle:active .thumb {
      transform: scale(0.95);
    }
    
    /* Focus styling */
    .theme-toggle:focus-visible .toggle-track {
      outline: 2px solid #f43f5e;
      outline-offset: 2px;
    }
  `]
})
export class ThemeToggleComponent {
  private platformId = inject(PLATFORM_ID);
  
  readonly theme = signal<Theme>('system');
  readonly isDark = signal(false);
  
  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Load saved theme
      const saved = localStorage.getItem('vibehealth_theme') as Theme;
      if (saved) {
        this.theme.set(saved);
      }
      
      // Set initial dark state
      this.updateDarkMode();
      
      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (this.theme() === 'system') {
          this.updateDarkMode();
        }
      });
    }
    
    // React to theme changes
    effect(() => {
      const currentTheme = this.theme();
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('vibehealth_theme', currentTheme);
        this.updateDarkMode();
      }
    });
  }
  
  toggleTheme() {
    // Simple toggle between light and dark (skip system for simplicity)
    this.theme.set(this.isDark() ? 'light' : 'dark');
  }
  
  private updateDarkMode() {
    const currentTheme = this.theme();
    let shouldBeDark: boolean;
    
    if (currentTheme === 'system') {
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      shouldBeDark = currentTheme === 'dark';
    }
    
    this.isDark.set(shouldBeDark);
    
    // Apply to document
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
