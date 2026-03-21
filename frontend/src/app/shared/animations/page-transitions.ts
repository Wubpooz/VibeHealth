import {
  trigger,
  transition,
  style,
  animate,
  query,
  group,
  animateChild,
} from '@angular/animations';

/**
 * Page transition animations for VibeHealth.
 * Uses Angular's built-in animation system for route transitions.
 * 
 * Usage in app.component.ts:
 *   @Component({
 *     template: `<div [@routeAnimations]="outlet.activatedRouteData['animation']">
 *                  <router-outlet #outlet="outlet" />
 *                </div>`,
 *     animations: [routeAnimations]
 *   })
 */

// Fade transition - simple and performant
export const fadeAnimation = trigger('routeAnimations', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
      }),
    ], { optional: true }),
    query(':enter', [
      style({ opacity: 0 }),
    ], { optional: true }),
    query(':leave', animateChild(), { optional: true }),
    group([
      query(':leave', [
        animate('200ms ease-out', style({ opacity: 0 })),
      ], { optional: true }),
      query(':enter', [
        animate('300ms 100ms ease-out', style({ opacity: 1 })),
      ], { optional: true }),
    ]),
    query(':enter', animateChild(), { optional: true }),
  ]),
]);

// Slide up transition - feels more dynamic
export const slideUpAnimation = trigger('routeAnimations', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
      }),
    ], { optional: true }),
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
    ], { optional: true }),
    query(':leave', animateChild(), { optional: true }),
    group([
      query(':leave', [
        animate('200ms ease-out', style({ opacity: 0, transform: 'translateY(-10px)' })),
      ], { optional: true }),
      query(':enter', [
        animate('300ms 100ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ], { optional: true }),
    ]),
    query(':enter', animateChild(), { optional: true }),
  ]),
]);

// Scale fade transition - soft pop aesthetic
export const scaleFadeAnimation = trigger('routeAnimations', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
      }),
    ], { optional: true }),
    query(':enter', [
      style({ opacity: 0, transform: 'scale(0.98)' }),
    ], { optional: true }),
    query(':leave', animateChild(), { optional: true }),
    group([
      query(':leave', [
        animate('200ms ease-out', style({ opacity: 0, transform: 'scale(1.01)' })),
      ], { optional: true }),
      query(':enter', [
        animate('300ms 100ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ], { optional: true }),
    ]),
    query(':enter', animateChild(), { optional: true }),
  ]),
]);

// Default export - the recommended transition for VibeHealth
export const routeAnimations = scaleFadeAnimation;
