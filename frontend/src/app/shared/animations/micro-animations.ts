import {
  trigger,
  transition,
  style,
  animate,
  state,
  keyframes,
  query,
  stagger,
} from '@angular/animations';

/**
 * Reusable micro-animations for VibeHealth components.
 * Apply these triggers to components for consistent motion language.
 */

// Fade in/out animation
export const fadeInOut = trigger('fadeInOut', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('200ms ease-out', style({ opacity: 1 })),
  ]),
  transition(':leave', [
    animate('150ms ease-in', style({ opacity: 0 })),
  ]),
]);

// Slide in from bottom
export const slideInUp = trigger('slideInUp', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' })),
  ]),
]);

// Slide in from right
export const slideInRight = trigger('slideInRight', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(20px)' }),
    animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(20px)' })),
  ]),
]);

// Slide in from left
export const slideInLeft = trigger('slideInLeft', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(-20px)' }),
    animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(-20px)' })),
  ]),
]);

// Scale in animation (soft pop)
export const scaleIn = trigger('scaleIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.95)' }),
    animate('250ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
  ]),
  transition(':leave', [
    animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' })),
  ]),
]);

// Scale and fade (for modals/dialogs)
export const scaleAndFade = trigger('scaleAndFade', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.9) translateY(-10px)' }),
    animate('250ms cubic-bezier(0.34, 1.1, 0.64, 1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' })),
  ]),
  transition(':leave', [
    animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.95) translateY(5px)' })),
  ]),
]);

// Bounce in animation
export const bounceIn = trigger('bounceIn', [
  transition(':enter', [
    animate('400ms cubic-bezier(0.34, 1.56, 0.64, 1)', keyframes([
      style({ opacity: 0, transform: 'scale(0.8)', offset: 0 }),
      style({ opacity: 1, transform: 'scale(1.05)', offset: 0.7 }),
      style({ transform: 'scale(1)', offset: 1 }),
    ])),
  ]),
]);

// Pulse animation (for attention)
export const pulse = trigger('pulse', [
  state('inactive', style({ transform: 'scale(1)' })),
  state('active', style({ transform: 'scale(1)' })),
  transition('inactive => active', [
    animate('300ms ease-out', keyframes([
      style({ transform: 'scale(1)', offset: 0 }),
      style({ transform: 'scale(1.05)', offset: 0.5 }),
      style({ transform: 'scale(1)', offset: 1 }),
    ])),
  ]),
]);

// Pulse glow (for CTAs and important elements)
export const pulseGlow = trigger('pulseGlow', [
  state('inactive', style({ boxShadow: '0 0 0 rgba(255, 107, 107, 0)' })),
  state('active', style({ boxShadow: '0 0 0 rgba(255, 107, 107, 0)' })),
  transition('inactive => active', [
    animate('600ms ease-out', keyframes([
      style({ boxShadow: '0 0 0 rgba(255, 107, 107, 0)', offset: 0 }),
      style({ boxShadow: '0 0 20px rgba(255, 107, 107, 0.4)', offset: 0.5 }),
      style({ boxShadow: '0 0 0 rgba(255, 107, 107, 0)', offset: 1 }),
    ])),
  ]),
]);

// Shake animation (for errors)
export const shake = trigger('shake', [
  state('inactive', style({ transform: 'translateX(0)' })),
  state('active', style({ transform: 'translateX(0)' })),
  transition('inactive => active', [
    animate('400ms ease-out', keyframes([
      style({ transform: 'translateX(0)', offset: 0 }),
      style({ transform: 'translateX(-8px)', offset: 0.2 }),
      style({ transform: 'translateX(8px)', offset: 0.4 }),
      style({ transform: 'translateX(-6px)', offset: 0.6 }),
      style({ transform: 'translateX(4px)', offset: 0.8 }),
      style({ transform: 'translateX(0)', offset: 1 }),
    ])),
  ]),
]);

// Wiggle animation (playful)
export const wiggle = trigger('wiggle', [
  state('inactive', style({ transform: 'rotate(0deg)' })),
  state('active', style({ transform: 'rotate(0deg)' })),
  transition('inactive => active', [
    animate('400ms ease-out', keyframes([
      style({ transform: 'rotate(0deg)', offset: 0 }),
      style({ transform: 'rotate(-3deg)', offset: 0.25 }),
      style({ transform: 'rotate(3deg)', offset: 0.5 }),
      style({ transform: 'rotate(-2deg)', offset: 0.75 }),
      style({ transform: 'rotate(0deg)', offset: 1 }),
    ])),
  ]),
]);

// Expand height animation (for accordions)
export const expandCollapse = trigger('expandCollapse', [
  state('collapsed', style({ height: '0', opacity: 0, overflow: 'hidden' })),
  state('expanded', style({ height: '*', opacity: 1 })),
  transition('collapsed <=> expanded', [
    animate('250ms ease-out'),
  ]),
]);

// Stagger children (use with @defer)
export const staggerList = trigger('staggerList', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-out', style({ opacity: 1 })),
  ]),
]);

// Stagger children with slide (use on parent with query)
export const staggerSlideIn = trigger('staggerSlideIn', [
  transition(':enter', [
    query('.stagger-item', [
      style({ opacity: 0, transform: 'translateY(15px)' }),
      stagger(50, [
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ], { optional: true }),
  ]),
]);

// Card hover lift animation
export const cardHover = trigger('cardHover', [
  state('idle', style({ transform: 'translateY(0)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' })),
  state('hovered', style({ transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)' })),
  transition('idle <=> hovered', [
    animate('200ms ease-out'),
  ]),
]);

// Button press animation
export const buttonPress = trigger('buttonPress', [
  state('up', style({ transform: 'scale(1)' })),
  state('down', style({ transform: 'scale(0.97)' })),
  transition('up <=> down', [
    animate('100ms ease-out'),
  ]),
]);

// Success checkmark draw animation
export const successCheck = trigger('successCheck', [
  transition(':enter', [
    style({ strokeDashoffset: 100, opacity: 0 }),
    animate('400ms 200ms ease-out', style({ strokeDashoffset: 0, opacity: 1 })),
  ]),
]);

// Notification badge bounce
export const badgeBounce = trigger('badgeBounce', [
  transition(':enter', [
    animate('400ms cubic-bezier(0.34, 1.56, 0.64, 1)', keyframes([
      style({ opacity: 0, transform: 'scale(0)', offset: 0 }),
      style({ opacity: 1, transform: 'scale(1.2)', offset: 0.6 }),
      style({ transform: 'scale(1)', offset: 1 }),
    ])),
  ]),
]);

// Flip card animation
export const flipCard = trigger('flipCard', [
  state('front', style({ transform: 'rotateY(0deg)' })),
  state('back', style({ transform: 'rotateY(180deg)' })),
  transition('front <=> back', [
    animate('400ms ease-in-out'),
  ]),
]);

// Float animation (for mascot/decorative elements)
export const float = trigger('float', [
  state('down', style({ transform: 'translateY(0)' })),
  state('up', style({ transform: 'translateY(-10px)' })),
  transition('down <=> up', [
    animate('1500ms ease-in-out'),
  ]),
]);

// Spin animation (for loading)
export const spin = trigger('spin', [
  state('spinning', style({ transform: 'rotate(0deg)' })),
  transition('spinning => spinning', [
    animate('1000ms linear', style({ transform: 'rotate(360deg)' })),
  ]),
]);

// Reveal from center (for progress bars/rings)
export const revealCenter = trigger('revealCenter', [
  transition(':enter', [
    style({ clipPath: 'inset(50% 50% 50% 50%)' }),
    animate('400ms ease-out', style({ clipPath: 'inset(0% 0% 0% 0%)' })),
  ]),
]);

// Highlight flash (for new/updated items)
export const highlightFlash = trigger('highlightFlash', [
  state('normal', style({ backgroundColor: 'transparent' })),
  state('highlighted', style({ backgroundColor: 'transparent' })),
  transition('normal => highlighted', [
    animate('600ms ease-out', keyframes([
      style({ backgroundColor: 'transparent', offset: 0 }),
      style({ backgroundColor: 'rgba(255, 107, 107, 0.15)', offset: 0.3 }),
      style({ backgroundColor: 'transparent', offset: 1 }),
    ])),
  ]),
]);

// Count up animation helper (state-based)
export const countUp = trigger('countUp', [
  transition(':increment', [
    style({ transform: 'translateY(-100%)', opacity: 0 }),
    animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 })),
  ]),
  transition(':decrement', [
    style({ transform: 'translateY(100%)', opacity: 0 }),
    animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 })),
  ]),
]);

// Drawer slide in/out
export const drawerSlide = trigger('drawerSlide', [
  state('closed', style({ transform: 'translateX(-100%)' })),
  state('open', style({ transform: 'translateX(0)' })),
  transition('closed <=> open', [
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)'),
  ]),
]);

// Tab indicator slide
export const tabIndicator = trigger('tabIndicator', [
  transition('* => *', [
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)'),
  ]),
]);

// Tooltip show/hide
export const tooltipAnim = trigger('tooltipAnim', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.9) translateY(4px)' }),
    animate('150ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' })),
  ]),
  transition(':leave', [
    animate('100ms ease-in', style({ opacity: 0, transform: 'scale(0.9) translateY(4px)' })),
  ]),
]);
