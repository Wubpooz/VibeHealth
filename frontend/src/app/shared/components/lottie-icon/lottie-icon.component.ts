import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
  computed,
  OnDestroy,
  NgZone,
  inject,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LottieComponent, AnimationOptions, AnimationItem } from 'ngx-lottie';

/**
 * Available Lottie animated icons.
 * Each maps to a JSON file in /assets/animations/
 */
export type LottieIconName =
  | 'check-circle'
  | 'heart'
  | 'bell'
  | 'loader'
  | 'arrow-right'
  | 'sparkles'
  | 'droplet'
  | 'carrot'
  | 'shield-check'
  | 'download'
  | 'settings'
  | 'user'
  | 'home'
  | 'search'
  | 'plus'
  | 'menu'
  | 'close'
  | 'activity'
  | 'calendar'
  | 'star';

@Component({
  selector: 'app-lottie-icon',
  imports: [CommonModule, LottieComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-lottie
      [options]="animationOptions()"
      [width]="sizeStyle()"
      [height]="sizeStyle()"
      [styles]="containerStyles"
      (animationCreated)="onAnimationCreated($event)"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
    />
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class LottieIconComponent implements OnDestroy {
  private readonly ngZone = inject(NgZone);
  private animationInstance: AnimationItem | null = null;

  /** Icon name - maps to /assets/animations/{name}.json */
  readonly name = input.required<LottieIconName>();

  /** Size in pixels (default: 24) */
  readonly size = input<number>(24);

  /** Whether the animation should loop (default: false for icons) */
  readonly loop = input<boolean>(false);

  /** Whether the animation should autoplay (default: true) */
  readonly autoplay = input<boolean>(true);

  /** Playback speed (default: 1) */
  readonly speed = input<number>(1);

  /** Play animation on hover instead of autoplay */
  readonly playOnHover = input<boolean>(false);

  /** Custom color override (CSS color value) */
  readonly color = input<string | undefined>(undefined);

  /** Animation state for external control */
  readonly isPlaying = signal(false);

  /** Computed animation options */
  readonly animationOptions = computed<AnimationOptions>(() => ({
    path: `/assets/animations/${this.name()}.json`,
    loop: this.loop(),
    autoplay: this.autoplay() && !this.playOnHover(),
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  }));

  /** Size as CSS string */
  readonly sizeStyle = computed(() => `${this.size()}px`);

  /** Container styles */
  readonly containerStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  constructor() {
    // Effect to update speed when it changes
    effect(() => {
      const speed = this.speed();
      if (this.animationInstance) {
        this.animationInstance.setSpeed(speed);
      }
    });
  }

  onAnimationCreated(animation: AnimationItem): void {
    this.animationInstance = animation;
    
    // Set initial speed
    animation.setSpeed(this.speed());

    // If playOnHover, stop the animation initially
    if (this.playOnHover()) {
      animation.stop();
    }

    // Track playing state
    animation.addEventListener('enterFrame', () => {
      this.ngZone.run(() => {
        this.isPlaying.set(true);
      });
    });

    animation.addEventListener('complete', () => {
      this.ngZone.run(() => {
        this.isPlaying.set(false);
      });
    });
  }

  onMouseEnter(): void {
    if (this.playOnHover() && this.animationInstance) {
      this.animationInstance.goToAndPlay(0);
    }
  }

  onMouseLeave(): void {
    // Optional: stop on mouse leave for non-looping
    if (this.playOnHover() && !this.loop() && this.animationInstance) {
      // Let the animation complete rather than stopping abruptly
    }
  }

  /** Public method to play the animation */
  play(): void {
    this.animationInstance?.play();
  }

  /** Public method to pause the animation */
  pause(): void {
    this.animationInstance?.pause();
  }

  /** Public method to stop and reset the animation */
  stop(): void {
    this.animationInstance?.stop();
  }

  /** Public method to go to a specific frame */
  goToFrame(frame: number, isFrame = true): void {
    this.animationInstance?.goToAndStop(frame, isFrame);
  }

  /** Public method to play from a specific frame */
  playFromFrame(frame: number, isFrame = true): void {
    this.animationInstance?.goToAndPlay(frame, isFrame);
  }

  ngOnDestroy(): void {
    // Clean up to prevent memory leaks
    if (this.animationInstance) {
      this.animationInstance.destroy();
      this.animationInstance = null;
    }
  }
}
