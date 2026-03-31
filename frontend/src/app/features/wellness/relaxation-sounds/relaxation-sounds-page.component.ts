import { Component, ChangeDetectionStrategy, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LucideHeadphones, LucidePlay, LucidePause, LucideCircleStop } from '@lucide/angular';

interface RelaxationTrack {
  id: string;
  titleKey: string;
  descriptionKey: string;
  url: string;
}

@Component({
  selector: 'app-relaxation-sounds-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, PageHeaderComponent, LucideHeadphones, LucidePlay, LucidePause, LucideCircleStop],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#f6f8ff] dark:bg-slate-900 text-gray-800 dark:text-gray-100">
      <app-page-header
        [title]="'WELLNESS.RELAXATION_SOUNDS.TITLE' | translate"
        [subtitle]="'WELLNESS.RELAXATION_SOUNDS.SUBTITLE' | translate"
        [backLabel]="'common.back_to_dashboard' | translate"
        [showBackLabel]="true"
      >
        <span pageHeaderIcon class="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-200 flex items-center justify-center" aria-hidden="true">
          <svg lucideHeadphones [size]="24" [strokeWidth]="2"></svg>
        </span>
      </app-page-header>

      <main class="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (track of tracks(); track track.id) {
            <article class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm hover:shadow-lg transition">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ track.titleKey | translate }}</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">{{ track.descriptionKey | translate }}</p>
                </div>
                <button
                  class="btn btn-sm bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90"
                  (click)="selectTrack(track)"
                  [attr.aria-label]="'WELLNESS.RELAXATION_SOUNDS.SELECT_TRACK' | translate"
                >
                  @if (selectedTrack()?.id === track.id && isPlaying()) {
                    <svg lucidePause [size]="18" [strokeWidth]="2" aria-hidden="true"></svg>
                  } @else {
                    <svg lucidePlay [size]="18" [strokeWidth]="2" aria-hidden="true"></svg>
                  }
                </button>
              </div>
            </article>
          }
        </section>

        @if (selectedTrack()) {
          <section class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 class="text-lg font-semibold">{{ 'WELLNESS.RELAXATION_SOUNDS.CURRENT_TRACK' | translate }}</h4>
              <p class="text-sm text-gray-600 dark:text-gray-300">{{ selectedTrack()?.titleKey | translate }}</p>
            </div>
            <div class="flex gap-2">
              <button class="btn btn-sm px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg" (click)="togglePlayback()">
                @if (isPlaying()) {
                  <span>{{ 'WELLNESS.RELAXATION_SOUNDS.PAUSE' | translate }}</span>
                } @else {
                  <span>{{ 'WELLNESS.RELAXATION_SOUNDS.PLAY' | translate }}</span>
                }
              </button>
              <button class="btn btn-sm px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg" (click)="stopPlayback()">
                <svg lucideCircleStop [size]="16" [strokeWidth]="2" aria-hidden="true"></svg>
                <span class="ml-1">{{ 'WELLNESS.RELAXATION_SOUNDS.STOP' | translate }}</span>
              </button>
            </div>
          </div>

          <div class="mt-4">
            <input
              type="range"
              min="0"
              [max]="duration() || 100"
              [value]="currentTime()"
              (input)="seek($event)"
              class="w-full"
              aria-label="{{ 'WELLNESS.RELAXATION_SOUNDS.SEEK' | translate }}"
            />
            <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>{{ formatTime(currentTime()) }}</span>
              <span>{{ formatTime(duration()) }}</span>
            </div>
          </div>
        </section>
      }
      </main>
    </div>
  `,
})
export class RelaxationSoundsPageComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly tracks = signal<RelaxationTrack[]>([
    {
      id: 'rainforest-rain',
      titleKey: 'WELLNESS.RELAXATION_SOUNDS.RAINFOREST_RAIN_TITLE',
      descriptionKey: 'WELLNESS.RELAXATION_SOUNDS.RAINFOREST_RAIN_DESCRIPTION',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },
    {
      id: 'ocean-waves',
      titleKey: 'WELLNESS.RELAXATION_SOUNDS.OCEAN_WAVES_TITLE',
      descriptionKey: 'WELLNESS.RELAXATION_SOUNDS.OCEAN_WAVES_DESCRIPTION',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    },
    {
      id: 'forest-breeze',
      titleKey: 'WELLNESS.RELAXATION_SOUNDS.FOREST_BREEZE_TITLE',
      descriptionKey: 'WELLNESS.RELAXATION_SOUNDS.FOREST_BREEZE_DESCRIPTION',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    },
  ]);

  private readonly audio = new Audio();
  private readonly _selectedTrack = signal<RelaxationTrack | null>(null);
  private readonly _isPlaying = signal(false);
  private readonly _currentTime = signal(0);
  private readonly _duration = signal(0);

  readonly selectedTrack = this._selectedTrack.asReadonly();
  readonly isPlaying = this._isPlaying.asReadonly();
  readonly currentTime = this._currentTime.asReadonly();
  readonly duration = this._duration.asReadonly();

  constructor() {
    this.audio.loop = false;

    const onTimeUpdate = () => {
      this._currentTime.set(this.audio.currentTime);
      this._duration.set(this.audio.duration || 0);
    };

    const onLoadedMetadata = () => {
      this._duration.set(this.audio.duration || 0);
    };

    const onEnded = () => {
      this._isPlaying.set(false);
      this._currentTime.set(0);
    };

    this.audio.addEventListener('timeupdate', onTimeUpdate);
    this.audio.addEventListener('loadedmetadata', onLoadedMetadata);
    this.audio.addEventListener('ended', onEnded);

    this.destroyRef.onDestroy(() => {
      this.audio.pause();
      this.audio.src = '';
      this.audio.removeEventListener('timeupdate', onTimeUpdate);
      this.audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      this.audio.removeEventListener('ended', onEnded);
    });
  }

  selectTrack(track: RelaxationTrack): void {
    const current = this._selectedTrack();

    if (current?.id === track.id) {
      this.togglePlayback();
      return;
    }

    this.audio.pause();
    this.audio.currentTime = 0;

    this._selectedTrack.set(track);
    this.audio.src = track.url;
    this.audio.load();

    this.audio.play().then(() => {
      this._isPlaying.set(true);
    }).catch(() => {
      this._isPlaying.set(false);
    });
  }

  togglePlayback(): void {
    if (!this._selectedTrack()) {
      return;
    }

    if (this._isPlaying()) {
      this.audio.pause();
      this._isPlaying.set(false);
    } else {
      this.audio.play().then(() => this._isPlaying.set(true)).catch(() => this._isPlaying.set(false));
    }
  }

  stopPlayback(): void {
    if (!this._selectedTrack()) {
      return;
    }

    this.audio.pause();
    this.audio.currentTime = 0;
    this._isPlaying.set(false);
    this._currentTime.set(0);
  }

  seek(event: Event): void {
    const input = event.target as HTMLInputElement;
    const targetTime = Number(input.value);
    if (!Number.isNaN(targetTime)) {
      this.audio.currentTime = targetTime;
      this._currentTime.set(targetTime);
    }
  }

  formatTime(value: number): string {
    if (!Number.isFinite(value) || value <= 0) {
      return '00:00';
    }

    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
