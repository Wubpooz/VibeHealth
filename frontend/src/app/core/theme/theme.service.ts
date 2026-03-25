import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'vibehealth-theme';
  
  // Private writable signal
  private readonly _theme = signal<Theme>(this.getInitialTheme());
  
  // Public readonly signal
  readonly theme = this._theme.asReadonly();
  
  constructor() {
    // Apply theme changes to document
    effect(() => {
      this.applyTheme(this._theme());
    });
    
    // Listen for system theme changes
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (this._theme() === 'system') {
          this.applyTheme('system');
        }
      });
    }
  }
  
  /**
   * Set the theme preference
   */
  setTheme(theme: Theme): void {
    this._theme.set(theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, theme);
    }
  }
  
  /**
   * Get the initial theme from localStorage or default to system
   */
  private getInitialTheme(): Theme {
    if (typeof window === 'undefined') {
      return 'system';
    }
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
    
    return 'system';
  }
  
  /**
   * Apply the theme to the document
   */
  private applyTheme(theme: Theme): void {
    if (typeof document === 'undefined') {
      return;
    }
    
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      // Use explicit theme
      root.classList.add(theme);
    }
  }
}
