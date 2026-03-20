import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  PLATFORM_ID,
  afterNextRender,
  ElementRef,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BunnyMascotComponent, ThemeToggleComponent } from '../../shared/components';

interface Feature {
  icon: string;
  title: string;
  description: string;
  color: 'rose' | 'sage' | 'amber' | 'violet';
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, BunnyMascotComponent, ThemeToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing.component.html',
  styles: [`
    :host {
      display: block;
    }

    /* Feature card hover shadows based on color */
    .feature-card.hover-rose:hover {
      box-shadow: 0 25px 50px -12px rgba(244, 63, 94, 0.15);
    }

    .feature-card.hover-sage:hover {
      box-shadow: 0 25px 50px -12px rgba(52, 211, 153, 0.15);
    }

    .feature-card.hover-amber:hover {
      box-shadow: 0 25px 50px -12px rgba(245, 158, 11, 0.15);
    }

    .feature-card.hover-violet:hover {
      box-shadow: 0 25px 50px -12px rgba(139, 92, 246, 0.15);
    }

    /* Animation utilities - only apply when visible */
    .animate-fade-in-up {
      animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      opacity: 0;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Reduce motion for accessibility */
    @media (prefers-reduced-motion: reduce) {
      .animate-fade-in-up,
      .animate-float,
      .animate-pulse-slow {
        animation: none !important;
        opacity: 1;
      }
    }
  `],
})
export class LandingComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly elementRef = inject(ElementRef);

  readonly isVisible = signal(false);
  readonly currentYear = new Date().getFullYear();

  readonly features: Feature[] = [
    {
      icon: '🆔',
      title: 'Medical ID',
      description: 'Your vital health information always accessible, even offline. Perfect for emergencies when every second counts.',
      color: 'rose',
    },
    {
      icon: '🥕',
      title: 'Carrot Rewards',
      description: 'Earn carrots for healthy habits! Gamification that makes your wellness journey fun and motivating.',
      color: 'sage',
    },
    {
      icon: '🩹',
      title: 'First Aid Guide',
      description: 'Offline-first emergency reference guide. Access critical first aid information anytime, anywhere.',
      color: 'amber',
    },
    {
      icon: '📊',
      title: 'Smart Dashboard',
      description: 'Personalized health insights powered by AI. Track progress and celebrate your wellness milestones.',
      color: 'violet',
    },
  ];

  readonly steps = [
    {
      number: 1,
      title: 'Create Your Profile',
      description: 'Sign up in seconds and let our bunny friend help you set up your health profile.',
    },
    {
      number: 2,
      title: 'Complete Onboarding',
      description: 'Answer a few quick questions so we can personalize your experience.',
    },
    {
      number: 3,
      title: 'Start Earning Carrots',
      description: 'Build healthy habits, track your progress, and watch your carrot collection grow!',
    },
  ];

  constructor() {
    afterNextRender(() => {
      // Trigger animations after component renders
      setTimeout(() => this.isVisible.set(true), 100);
    });
  }

  getFeatureHoverClass(color: Feature['color']): string {
    return `hover-${color}`;
  }

  getFeatureIconClass(color: Feature['color']): string {
    const classes: Record<Feature['color'], string> = {
      rose: 'bg-primary-100 dark:bg-primary-900/30',
      sage: 'bg-sage-100 dark:bg-sage-900/30',
      amber: 'bg-amber-100 dark:bg-amber-900/30',
      violet: 'bg-violet-100 dark:bg-violet-900/30',
    };
    return classes[color];
  }

  getFeatureGradientClass(color: Feature['color']): string {
    const classes: Record<Feature['color'], string> = {
      rose: 'bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/10 dark:to-gray-800',
      sage: 'bg-gradient-to-br from-sage-50 to-white dark:from-sage-900/10 dark:to-gray-800',
      amber: 'bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/10 dark:to-gray-800',
      violet: 'bg-gradient-to-br from-violet-50 to-white dark:from-violet-900/10 dark:to-gray-800',
    };
    return classes[color];
  }
}