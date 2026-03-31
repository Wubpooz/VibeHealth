import { Component, inject, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ThemeService, type Theme } from '../../../core/theme/theme.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ProfileService } from '../../../core/profile/profile.service';
import { CarrotCounterComponent } from '../carrot-counter/carrot-counter.component';

interface NavItem {
  route: string;
  labelKey: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    CarrotCounterComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly translate = inject(TranslateService);

  readonly currentTheme = this.themeService.theme;
  readonly user = this.authService.user;
  readonly profile = this.profileService.profile;

  readonly navItemClicked = output<void>();

  readonly mockAvatarUrl = 'https://api.dicebear.com/6.x/initials/svg?seed=VibeHealth';

  readonly userName = computed(() => {
    const userData = this.user();
    return userData?.name || this.translate.instant('SIDEBAR.USER');
  });

  readonly navItems: NavItem[] = [
    { route: '/dashboard', labelKey: 'nav.dashboard', icon: 'dashboard' },
    { route: '/vitals', labelKey: 'nav.vitals', icon: 'directions_walk' },
    { route: '/activity', labelKey: 'nav.activity', icon: 'directions_run' },
    { route: '/workouts', labelKey: 'nav.workouts', icon: 'fitness_center' },
    { route: '/nutrition', labelKey: 'nav.nutrition', icon: 'restaurant' },
    { route: '/medication', labelKey: 'nav.medical', icon: 'local_pharmacy' },
    { route: '/goals', labelKey: 'nav.goals', icon: 'track_changes' },
    { route: '/medical-id', labelKey: 'nav.medical_id', icon: 'badge' },
    { route: '/first-aid', labelKey: 'nav.first_aid', icon: 'medical_services' },
    { route: '/practitioner-map', labelKey: 'nav.practitioner_map', icon: 'place' },
    { route: '/wiki', labelKey: 'nav.wiki', icon: 'local_library' },
    { route: '/journal', labelKey: 'nav.journal', icon: 'menu_book' },
    { route: '/period', labelKey: 'nav.period', icon: 'calendar_today' },
    { route: '/relaxation-sounds', labelKey: 'nav.relaxation_sounds', icon: 'spa' },
    { route: '/rewards', labelKey: 'nav.rewards', icon: 'emoji_events' }
  ];



  isActive(route: string): boolean {
    return this.router.url === route;
  }

  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
  }

  goToSettings(): void {
    this.router.navigate(['/settings']);
  }

  async logout(): Promise<void> {
    await this.authService.signOut();
    this.router.navigate(['/']);
  }
}
