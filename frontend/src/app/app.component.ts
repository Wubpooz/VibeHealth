import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { RouterOutlet, ChildrenOutletContexts, Router, NavigationEnd } from '@angular/router';
import { GoeyToastComponent, ScrollTopProgressComponent, SidebarComponent } from './shared/components';
import { routeAnimations } from './shared/animations';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GoeyToastComponent, ScrollTopProgressComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [routeAnimations],
})
export class AppComponent implements OnInit {
  private readonly contexts = inject(ChildrenOutletContexts);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly currentUrl = signal(this.router.url);

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl.set(event.urlAfterRedirects);
      }
    });
  }

  ngOnInit(): void {
    void this.authService.initSession();
  }

  // Show sidebar only on authenticated pages
  readonly showSidebar = computed(() => {
    const isAuth = this.authService.isAuthenticated();
    const currentUrl = this.currentUrl();
    const isAuthPage =
      currentUrl === '/' ||
      currentUrl.startsWith('/login') ||
      currentUrl.startsWith('/register') ||
      currentUrl.startsWith('/verify-email');
    return isAuth && !isAuthPage;
  });

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
}
