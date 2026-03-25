import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  LucideLayoutDashboard,
  LucideActivity,
  LucideDumbbell,
  LucideUtensils,
  LucideTarget,
  LucideBadgeCheck,
  LucideCross,
  LucideBookOpen,
  LucideTrophy,
  LucideSettings,
  LucideSun,
  LucideMoon,
  LucideMonitor,
  LucideLogOut,
  LucideUser
} from '@lucide/angular';

import { ThemeService, type Theme } from '../../../core/theme/theme.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ProfileService } from '../../../core/profile/profile.service';

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
    LucideLayoutDashboard,
    LucideActivity,
    LucideDumbbell,
    LucideUtensils,
    LucideTarget,
    LucideBadgeCheck,
    LucideCross,
    LucideBookOpen,
    LucideTrophy,
    LucideSettings,
    LucideSun,
    LucideMoon,
    LucideMonitor,
    LucideLogOut,
    LucideUser
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);

  readonly currentTheme = this.themeService.theme;
  readonly user = this.authService.user;
  readonly profile = this.profileService.profile;

  readonly userName = computed(() => {
    const userData = this.user();
    return userData?.name || 'User';
  });

  readonly navItems: NavItem[] = [
    { route: '/dashboard', labelKey: 'nav.dashboard', icon: 'LayoutDashboard' },
    { route: '/vitals', labelKey: 'nav.vitals', icon: 'Activity' },
    { route: '/activity', labelKey: 'nav.activity', icon: 'Dumbbell' },
    { route: '/nutrition', labelKey: 'nav.nutrition', icon: 'Utensils' },
    { route: '/goals', labelKey: 'nav.goals', icon: 'Target' },
    { route: '/medical-id', labelKey: 'nav.medical_id', icon: 'BadgeCheck' },
    { route: '/first-aid', labelKey: 'nav.first_aid', icon: 'Cross' },
    { route: '/journal', labelKey: 'nav.journal', icon: 'BookOpen' },
    { route: '/rewards', labelKey: 'nav.rewards', icon: 'Trophy' }
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

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  async logout(): Promise<void> {
    await this.authService.signOut();
    this.router.navigate(['/']);
  }
}
