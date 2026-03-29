import { Component, ViewChild, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet, ChildrenOutletContexts, Router, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { GoeyToastComponent, ScrollTopProgressComponent, SidebarComponent } from './shared/components';
import { routeAnimations } from './shared/animations';
import { AuthService } from './core/auth/auth.service';
import { ThemeService } from './core/theme/theme.service';
import { ProfileService } from './core/profile/profile.service';
import { FirstAidService } from './features/first-aid/first-aid.service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    GoeyToastComponent,
    ScrollTopProgressComponent,
    SidebarComponent,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [routeAnimations],
})
export class AppComponent implements OnInit {
  private readonly contexts = inject(ChildrenOutletContexts);
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly firstAidService = inject(FirstAidService);
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly currentUrl = signal(this.router.url);

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl.set(event.urlAfterRedirects);
        this.themeService.applyCurrentTheme();
      }
    });
  }

  readonly isMobile = signal(false);

  ngOnInit(): void {
    void this.authService.initSession().then(async () => {
      const profile = await this.profileService.loadProfile();
      const countryCode = profile?.preferredCountryCode;
      if (countryCode) {
        this.firstAidService.setUserCountry(countryCode);
      }
    });

    this.updateIsMobile();
    window.addEventListener('resize', this.updateIsMobile);
  }

  private readonly updateIsMobile = (): void => {
    this.isMobile.set(window.innerWidth < 1024);
  };

  // Show sidebar only on authenticated pages
  readonly isNotFoundPage = computed(() => this.currentUrl().startsWith('/not-found'));

  readonly showSidebar = computed(() => {
    const isAuth = this.authService.isAuthenticated();
    const currentUrl = this.currentUrl();
    const isAuthPage =
      currentUrl === '/' ||
      currentUrl.startsWith('/login') ||
      currentUrl.startsWith('/register') ||
      currentUrl.startsWith('/verify-email') ||
      currentUrl.startsWith('/forgot-password');
    return isAuth && !isAuthPage && !this.isNotFoundPage();
  });

  // Toolbar is primarily part of mobile navigation.
  // On desktop for mobile-only pages, hide it; on core app pages, keep it behind the sidebar.
  readonly showToolbar = computed(() => !this.isNotFoundPage() && (this.isMobile()));

  @ViewChild('drawer') readonly drawer?: MatSidenav;

  readonly showDesktopSidebar = computed(() => !this.isMobile() && this.showSidebar());

  readonly isLanding = computed(() => this.currentUrl() === '/');

  toggleMenu(): void {
    this.drawer?.toggle();
  }

  readonly pageTitle = computed(() => {
    const url = this.currentUrl();
    if (url.startsWith('/dashboard')) return 'Dashboard';
    if (url.startsWith('/vitals')) return 'Vitals';
    if (url.startsWith('/activity')) return 'Activity';
    if (url.startsWith('/nutrition')) return 'Nutrition';
    if (url.startsWith('/goals')) return 'Goals';
    if (url.startsWith('/medical-id')) return 'Medical ID';
    if (url.startsWith('/medication')) return 'Medication';
    if (url.startsWith('/first-aid')) return 'First Aid';
    if (url.startsWith('/journal')) return 'Journal';
    if (url.startsWith('/rewards')) return 'Rewards';
    if (url.startsWith('/onboarding')) return 'Onboarding';
    if (url.startsWith('/settings')) return 'Settings';
    if (url.startsWith('/profile')) return 'Profile';
    if (url.startsWith('/not-found')) return 'Not Found';
    return 'VibeHealth';
  });

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
}
