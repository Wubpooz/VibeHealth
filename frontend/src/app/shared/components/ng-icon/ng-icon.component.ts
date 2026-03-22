/**
 * ng-animated-icons wrapper component for VibeHealth.
 * 
 * This component provides a simple interface to use icons from the ng-animated-icons library.
 * Icons animate on hover by default or when the `animate` input is triggered.
 * 
 * Usage:
 *   <!-- Static icon, animates on hover -->
 *   <app-ng-icon icon="check" [size]="24" />
 *   
 *   <!-- Icon with explicit animation trigger -->
 *   <app-ng-icon icon="heart" [animate]="isLiked()" />
 *   
 *   <!-- Icon with custom color -->
 *   <app-ng-icon icon="star" color="#f59e0b" />
 */
import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

// Import all commonly used icons from ng-animated-icons
import {
  CheckIcon,
  CheckCheckIcon,
  HeartIcon,
  BellIcon,
  BellRingIcon,
  StarIcon,
  DownloadIcon,
  UploadIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SparklesIcon,
  SparkleIcon,
  PlusIcon,
  MinusIcon,
  Trash2Icon,
  SettingsIcon,
  UserIcon,
  UserCheckIcon,
  HouseIcon,
  SearchIcon,
  GripIcon,
  XIcon,
  ActivityIcon,
  CalendarCheckIcon,
  ShieldCheckIcon,
  CircleCheckIcon,
  DropletOffIcon,
  RabbitIcon,
  LoaderPinwheelIcon,
  RefreshCwIcon,
  CopyIcon,
  CopyCheckIcon,
  BookmarkIcon,
  BookmarkCheckIcon,
  ClipboardIcon,
  ClipboardCheckIcon,
  MessageCircleIcon,
  SendIcon,
  MailCheckIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  EyeOffIcon,
  LightbulbIcon,
  LightbulbOffIcon,
  PlayIcon,
  WavesIcon,
  ChartBarIcon,
  ChartLineIcon,
  ChartPieIcon,
  GaugeIcon,
  TimerIcon,
  ClockIcon,
  BriefcaseMedicalIcon,
  ThermometerIcon,
  HeartOffIcon,
} from 'ng-animated-icons';

/**
 * Icon names supported by this component.
 * Maps to ng-animated-icons components.
 */
export type NgIconName =
  | 'check'
  | 'check-check'
  | 'heart'
  | 'heart-off'
  | 'bell'
  | 'bell-ring'
  | 'star'
  | 'download'
  | 'upload'
  | 'arrow-right'
  | 'arrow-left'
  | 'arrow-up'
  | 'arrow-down'
  | 'sparkles'
  | 'sparkle'
  | 'plus'
  | 'minus'
  | 'trash'
  | 'settings'
  | 'user'
  | 'user-check'
  | 'home'
  | 'search'
  | 'menu'
  | 'close'
  | 'activity'
  | 'calendar'
  | 'shield-check'
  | 'circle-check'
  | 'droplet'
  | 'rabbit'
  | 'loader'
  | 'refresh'
  | 'copy'
  | 'copy-check'
  | 'bookmark'
  | 'bookmark-check'
  | 'clipboard'
  | 'clipboard-check'
  | 'message'
  | 'send'
  | 'mail-check'
  | 'thumbs-up'
  | 'thumbs-down'
  | 'eye-off'
  | 'lightbulb'
  | 'lightbulb-off'
  | 'play'
  | 'waves'
  | 'chart-bar'
  | 'chart-line'
  | 'chart-pie'
  | 'gauge'
  | 'timer'
  | 'clock'
  | 'medical'
  | 'thermometer';

@Component({
  selector: 'app-ng-icon',
  imports: [
    CommonModule,
    CheckIcon,
    CheckCheckIcon,
    HeartIcon,
    HeartOffIcon,
    BellIcon,
    BellRingIcon,
    StarIcon,
    DownloadIcon,
    UploadIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    SparklesIcon,
    SparkleIcon,
    PlusIcon,
    MinusIcon,
    Trash2Icon,
    SettingsIcon,
    UserIcon,
    UserCheckIcon,
    HouseIcon,
    SearchIcon,
    GripIcon,
    XIcon,
    ActivityIcon,
    CalendarCheckIcon,
    ShieldCheckIcon,
    CircleCheckIcon,
    DropletOffIcon,
    RabbitIcon,
    LoaderPinwheelIcon,
    RefreshCwIcon,
    CopyIcon,
    CopyCheckIcon,
    BookmarkIcon,
    BookmarkCheckIcon,
    ClipboardIcon,
    ClipboardCheckIcon,
    MessageCircleIcon,
    SendIcon,
    MailCheckIcon,
    ThumbsUpIcon,
    ThumbsDownIcon,
    EyeOffIcon,
    LightbulbIcon,
    LightbulbOffIcon,
    PlayIcon,
    WavesIcon,
    ChartBarIcon,
    ChartLineIcon,
    ChartPieIcon,
    GaugeIcon,
    TimerIcon,
    ClockIcon,
    BriefcaseMedicalIcon,
    ThermometerIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="ng-icon-wrapper"
      [style.--icon-size.px]="size()"
      [style.--icon-color]="color()"
      (mouseenter)="onHover()"
      (mouseleave)="onLeave()"
    >
      @switch (icon()) {
        @case ('check') {
          <i-check [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('check-check') {
          <i-check-check [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('heart') {
          <i-heart [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('heart-off') {
          <i-heart-off [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('bell') {
          <i-bell [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('bell-ring') {
          <i-bell-ring [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('star') {
          <i-star [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('download') {
          <i-download [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('upload') {
          <i-upload [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('arrow-right') {
          <i-arrow-right [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('arrow-left') {
          <i-arrow-left [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('arrow-up') {
          <i-arrow-up [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('arrow-down') {
          <i-arrow-down [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('sparkles') {
          <i-sparkles [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('sparkle') {
          <i-sparkle [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('plus') {
          <i-plus [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('minus') {
          <i-minus [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('trash') {
          <i-trash-2 [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('settings') {
          <i-settings [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('user') {
          <i-user [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('user-check') {
          <i-user-check [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('home') {
          <i-house [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('search') {
          <i-search [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('menu') {
          <i-grip [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('close') {
          <i-x [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('activity') {
          <i-activity [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('calendar') {
          <i-calendar-check [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('shield-check') {
          <i-shield-check [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('circle-check') {
          <i-circle-check [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('droplet') {
          <i-droplet-off [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('rabbit') {
          <i-rabbit [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('loader') {
          <i-loader-pinwheel [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" animate />
        }
        @case ('refresh') {
          <i-refresh-cw [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('copy') {
          <i-copy [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('copy-check') {
          <i-copy-check [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('bookmark') {
          <i-bookmark [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('bookmark-check') {
          <i-bookmark-check [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('clipboard') {
          <i-clipboard [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('clipboard-check') {
          <i-clipboard-check [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('message') {
          <i-message-circle [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('send') {
          <i-send [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('mail-check') {
          <i-mail-check [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('thumbs-up') {
          <i-thumbs-up [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('thumbs-down') {
          <i-thumbs-down [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('eye-off') {
          <i-eye-off [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('lightbulb') {
          <i-lightbulb [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('lightbulb-off') {
          <i-lightbulb-off [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('play') {
          <i-play [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('waves') {
          <i-waves [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('chart-bar') {
          <i-chart-bar [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('chart-line') {
          <i-chart-line [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('chart-pie') {
          <i-chart-pie [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('gauge') {
          <i-gauge [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('timer') {
          <i-timer [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('clock') {
          <i-clock [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('medical') {
          <i-briefcase-medical [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @case ('thermometer') {
          <i-thermometer [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
        @default {
          <!-- Fallback: use check icon -->
          <i-check [size]="size()" [color]="color()" [strokeWidth]="strokeWidth()" [animate]="shouldAnimate()" />
        }
      }
    </span>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .ng-icon-wrapper {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }
  `],
})
export class NgIconComponent {
  /** The icon to display */
  readonly icon = input.required<NgIconName>();

  /** Size of the icon in pixels */
  readonly size = input<number>(24);

  /** Color of the icon (CSS color value) */
  readonly color = input<string>('currentColor');

  /** Stroke width */
  readonly strokeWidth = input<number>(2);

  /** External animate trigger */
  readonly animate = input<boolean>(false);

  /** Internal hover state */
  private readonly hovering = signal(false);

  /** Computed: should animate based on hover or external trigger */
  shouldAnimate(): boolean {
    return this.animate() || this.hovering();
  }

  onHover(): void {
    this.hovering.set(true);
  }

  onLeave(): void {
    this.hovering.set(false);
  }
}

