import {
  Component,
  ChangeDetectionStrategy,
  signal,
  afterNextRender,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BunnyMascotComponent, ThemeToggleComponent } from '../../shared/components';
import { ArrowRightIcon, ShieldCheckIcon, CheckIcon, HeartIcon } from 'ng-animated-icons';

interface Feature {
  icon: string;
  title: string;
  description: string;
  color: 'rose' | 'sage' | 'amber' | 'violet';
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, BunnyMascotComponent, ThemeToggleComponent, ArrowRightIcon, ShieldCheckIcon, CheckIcon, HeartIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing.component.html',
  styles: [`
    :host {
      display: block;
    }

    .hero-shell {
      position: relative;
      isolation: isolate;
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

    /* Dark mode: consistent shadow intensity */
    :host-context([data-theme="dark"]) .feature-card.hover-rose:hover,
    :host-context([data-theme="dark"]) .feature-card.hover-sage:hover,
    :host-context([data-theme="dark"]) .feature-card.hover-amber:hover,
    :host-context([data-theme="dark"]) .feature-card.hover-violet:hover {
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      border-color: rgba(255, 255, 255, 0.1);
    }

    /* Animation utilities - only apply when visible */
    .animate-fade-in-up {
      animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      opacity: 0;
    }

    .slide-in-cta {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      border-radius: 0.75rem;
      padding: 1rem 1.6rem;
      font-size: 1.125rem;
      font-weight: 700;
      color: #fff;
      background: #0f172a;
      overflow: hidden;
      isolation: isolate;
      transition: transform 0.25s ease;
    }

    .slide-in-cta::before {
      content: '';
      position: absolute;
      /* Position at bottom center */
      left: 50%;
      bottom: 0;
      width: 0;
      height: 0;
      background: #e11d48;
      border-radius: 50%;
      transform: translate(-50%, 50%);
      transition: width 0.45s cubic-bezier(0.4, 0, 0.2, 1), height 0.45s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: -1;
    }

    .slide-in-cta__label {
      position: relative;
      z-index: 1;
    }

    .slide-in-cta__icon {
      position: relative;
      z-index: 1;
      width: 1.25rem;
      height: 1.25rem;
      display: grid;
      place-items: center;
      transform: translateX(-4px);
      opacity: 0;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
      will-change: transform, opacity;
    }

    .slide-in-cta:hover,
    .slide-in-cta:focus-visible {
      transform: translateY(-2px);
    }

    .slide-in-cta:hover::before,
    .slide-in-cta:focus-visible::before {
      /* Expand to cover button with circular shape */
      width: 300%;
      height: 300%;
    }

    .slide-in-cta:hover .slide-in-cta__icon,
    .slide-in-cta:focus-visible .slide-in-cta__icon {
      transform: translateX(0);
      opacity: 1;
    }

    .trust-item {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      border-radius: 999px;
      border: 1px solid rgba(148, 163, 184, 0.35);
      background: rgba(255, 255, 255, 0.55);
      padding: 0.45rem 0.8rem;
      transition: border-color 0.25s ease, transform 0.25s ease, background-color 0.25s ease;
    }

    .trust-item:hover {
      border-color: rgba(244, 63, 94, 0.45);
      transform: translateY(-2px);
      background: rgba(255, 255, 255, 0.85);
    }

    .trust-icon {
      width: 1.25rem;
      height: 1.25rem;
      color: #059669;
      transition: transform 0.25s ease;
    }

    .trust-item:hover .trust-icon {
      transform: scale(1.05);
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
      .animate-pulse-slow,
      .slide-in-cta,
      .slide-in-cta::before,
      .slide-in-cta__icon,
      .trust-icon {
        animation: none !important;
        opacity: 1;
        transition: none !important;
      }

      .slide-in-cta::before {
        width: 300%;
        height: 300%;
      }

      .slide-in-cta__icon {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `],
})
export class LandingComponent {
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
      rose: 'bg-gradient-to-br from-primary-50 to-white dark:from-primary-950/50 dark:to-gray-800/80',
      sage: 'bg-gradient-to-br from-sage-50 to-white dark:from-sage-950/50 dark:to-gray-800/80',
      amber: 'bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/50 dark:to-gray-800/80',
      violet: 'bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/50 dark:to-gray-800/80',
    };
    return classes[color];
  }
}
