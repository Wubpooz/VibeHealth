import { Component, ChangeDetectionStrategy, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LucideHeadphones, LucidePlay, LucideCircleStop, LucideBookmark } from '@lucide/angular';

interface RelaxationTrack {
  id: string;
  titleKey: string;
  descriptionKey: string;
  url: string;
}

interface Journey {
  id: string;
  titleKey: string;
  descriptionKey: string;
  sessions: number;
  durationMinutes: number;
  trackId: string;
}

interface Soundscape {
  id: string;
  titleKey: string;
  imageUrl: string;
  trackId: string;
}

interface RecentlyPlayedItem {
  id: string;
  titleKey: string;
  subtitleKey: string;
  progress: number;
}

@Component({
  selector: 'app-relaxation-sounds-page',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    PageHeaderComponent,
    LucideHeadphones,
    LucidePlay,
    LucideCircleStop,
    LucideBookmark,
  ],
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

      <main class="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <section class="relative rounded-3xl overflow-hidden bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-2xl">
          <img src="https://images.unsplash.com/photo-1499084732479-de2c02d45fc4?auto=format&fit=crop&w=1200&q=80" alt="Featured meditation" class="absolute inset-0 object-cover w-full h-full opacity-30" />
          <div class="absolute inset-0 bg-slate-900/40"></div>
          <div class="relative p-6 sm:p-10">
            <div class="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1 text-xs uppercase tracking-wider">{{ 'WELLNESS.RELAXATION_SOUNDS.FEATURED' | translate }}</div>
            <h2 class="mt-3 text-3xl sm:text-4xl font-bold">{{ 'WELLNESS.RELAXATION_SOUNDS.FEATURED_SESSION_TITLE' | translate }}</h2>
            <p class="mt-2 text-sm sm:text-base text-slate-100 max-w-2xl">{{ 'WELLNESS.RELAXATION_SOUNDS.FEATURED_SESSION_SUBTITLE' | translate }}</p>
            <div class="mt-5 flex flex-wrap gap-3">
              @if (featuredTrack()) {
                <button
                  class="btn btn-lg px-5 py-2.5 rounded-2xl bg-white text-indigo-600 font-semibold hover:opacity-90 flex items-center gap-2"
                  (click)="selectTrack(featuredTrack())"
                  [attr.aria-label]="'WELLNESS.RELAXATION_SOUNDS.PLAY_NOW' | translate"
                >
                  <svg lucidePlay [size]="18" [strokeWidth]="2" aria-hidden="true"></svg>
                  <span>{{ 'WELLNESS.RELAXATION_SOUNDS.PLAY_NOW' | translate }}</span>
                </button>
                <button
                  class="btn btn-lg px-5 py-2.5 rounded-2xl bg-white/20 text-white border border-white/40 hover:bg-white/30 flex items-center gap-2"
                  (click)="saveToLibrary(featuredTrack())"
                  [attr.aria-label]="'WELLNESS.RELAXATION_SOUNDS.SAVE_TO_LIBRARY' | translate"
                >
                  <svg lucideBookmark [size]="18" [strokeWidth]="2" aria-hidden="true"></svg>
                  <span>{{ 'WELLNESS.RELAXATION_SOUNDS.SAVE_TO_LIBRARY' | translate }}</span>
                </button>
              }
            </div>
          </div>
        </section>

        <section>
          <h3 class="text-xl sm:text-2xl font-bold">{{ 'WELLNESS.RELAXATION_SOUNDS.GUIDED_JOURNEYS_TITLE' | translate }}</h3>
          <p class="text-gray-600 dark:text-gray-300 mt-1">{{ 'WELLNESS.RELAXATION_SOUNDS.GUIDED_JOURNEYS_SUBTITLE' | translate }}</p>
          <div class="mt-4 grid gap-4 sm:grid-cols-3">
            @for (journey of journeys(); track journey.id) {
              <article class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm hover:-translate-y-1 transition">
                <h4 class="font-semibold">{{ journey.titleKey | translate }}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">{{ journey.descriptionKey | translate }}</p>
                <div class="mt-3 text-xs text-gray-500 dark:text-gray-400">{{ journey.sessions }} {{ 'WELLNESS.RELAXATION_SOUNDS.SESSIONS' | translate }} · {{ journey.durationMinutes }} {{ 'WELLNESS.RELAXATION_SOUNDS.MINUTES' | translate }}</div>
                <button
                  class="mt-4 btn btn-sm w-full px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white"
                  (click)="selectJourney(journey)"
                >
                  {{ 'WELLNESS.RELAXATION_SOUNDS.START_JOURNEY' | translate }}
                </button>
              </article>
            }
          </div>
        </section>

        <section>
          <h3 class="text-xl sm:text-2xl font-bold">{{ 'WELLNESS.RELAXATION_SOUNDS.IMMERSIVE_SOUNDSCAPES_TITLE' | translate }}</h3>
          <p class="text-gray-600 dark:text-gray-300 mt-1">{{ 'WELLNESS.RELAXATION_SOUNDS.IMMERSIVE_SOUNDSCAPES_SUBTITLE' | translate }}</p>
          <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            @for (soundscape of soundscapes(); track soundscape.id) {
              <article class="group relative rounded-2xl overflow-hidden cursor-pointer border border-gray-200 dark:border-gray-800" (click)="selectSoundscape(soundscape)">
                <img src="{{ soundscape.imageUrl }}" alt="{{ soundscape.titleKey | translate }}" class="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div class="p-4 bg-white dark:bg-gray-900">
                  <h4 class="font-semibold">{{ soundscape.titleKey | translate }}</h4>
                  <button class="mt-2 btn btn-xs px-3 py-1.5 rounded-lg bg-indigo-500 text-white">{{ 'WELLNESS.RELAXATION_SOUNDS.PLAY' | translate }}</button>
                </div>
              </article>
            }
          </div>
        </section>

        @if (selectedTrack()) {
          <section class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 class="text-lg font-semibold">{{ 'WELLNESS.RELAXATION_SOUNDS.CURRENT_TRACK' | translate }}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">{{ selectedTrack()?.titleKey | translate }}</p>
              </div>
              <div class="flex gap-2">
                <button class="btn btn-sm px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800" (click)="togglePlayback()">
                  @if (isPlaying()) {
                    <span>{{ 'WELLNESS.RELAXATION_SOUNDS.PAUSE' | translate }}</span>
                  } @else {
                    <span>{{ 'WELLNESS.RELAXATION_SOUNDS.PLAY' | translate }}</span>
                  }
                </button>
                <button class="btn btn-sm px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800" (click)="stopPlayback()">
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

        <section>
          <h3 class="text-xl sm:text-2xl font-bold">{{ 'WELLNESS.RELAXATION_SOUNDS.RECENTLY_PLAYED_TITLE' | translate }}</h3>
          <div class="mt-3 space-y-3">
            @for (item of recentlyPlayed(); track item.id) {
              <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 flex items-center justify-between gap-4">
                <div>
                  <div class="font-semibold">{{ item.titleKey | translate }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ item.subtitleKey | translate }}</div>
                </div>
                <div class="w-24 text-right text-xs text-gray-500 dark:text-gray-400">{{ item.progress }}%</div>
              </div>
            }
            @if (recentlyPlayed().length === 0) {
              <div class="text-sm text-gray-600 dark:text-gray-300">{{ 'WELLNESS.RELAXATION_SOUNDS.NO_RECENTLY_PLAYED' | translate }}</div>
            }
          </div>
        </section>
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

  readonly journeys = signal<Journey[]>([
    {
      id: 'daily-calm',
      titleKey: 'WELLNESS.RELAXATION_SOUNDS.JOURNEY_DAILY_CALM_TITLE',
      descriptionKey: 'WELLNESS.RELAXATION_SOUNDS.JOURNEY_DAILY_CALM_DESCRIPTION',
      sessions: 12,
      durationMinutes: 8,
      trackId: 'forest-breeze',
    },
    {
      id: 'deep-sleep',
      titleKey: 'WELLNESS.RELAXATION_SOUNDS.JOURNEY_DEEP_SLEEP_TITLE',
      descriptionKey: 'WELLNESS.RELAXATION_SOUNDS.JOURNEY_DEEP_SLEEP_DESCRIPTION',
      sessions: 24,
      durationMinutes: 12,
      trackId: 'ocean-waves',
    },
    {
      id: 'mental-focus',
      titleKey: 'WELLNESS.RELAXATION_SOUNDS.JOURNEY_MENTAL_FOCUS_TITLE',
      descriptionKey: 'WELLNESS.RELAXATION_SOUNDS.JOURNEY_MENTAL_FOCUS_DESCRIPTION',
      sessions: 8,
      durationMinutes: 10,
      trackId: 'rainforest-rain',
    },
  ]);

  readonly soundscapes = signal<Soundscape[]>([
    {
      id: 'midnight-rain',
      titleKey: 'WELLNESS.RELAXATION_SOUNDS.SOUNDSCAPE_MIDNIGHT_RAIN',
      imageUrl: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=800&q=70',
      trackId: 'rainforest-rain',
    },
    {
      id: 'ancient-forest',
      titleKey: 'WELLNESS.RELAXATION_SOUNDS.SOUNDSCAPE_ANCIENT_FOREST',
      imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=70',
      trackId: 'forest-breeze',
    },
    {
      id: 'soft-white-noise',
      titleKey: 'WELLNESS.RELAXATION_SOUNDS.SOUNDSCAPE_SOFT_WHITE_NOISE',
      imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=70',
      trackId: 'ocean-waves',
    },
    {
      id: 'cozy-fireplace',
      titleKey: 'WELLNESS.RELAXATION_SOUNDS.SOUNDSCAPE_COZY_FIREPLACE',
      imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=70',
      trackId: 'forest-breeze',
    },
  ]);

  private readonly audio = new Audio();
  private readonly _selectedTrack = signal<RelaxationTrack | null>(null);
  private readonly _isPlaying = signal(false);
  private readonly _currentTime = signal(0);
  private readonly _duration = signal(0);
  private readonly _recentlyPlayed = signal<RecentlyPlayedItem[]>([]);

  readonly selectedTrack = this._selectedTrack.asReadonly();
  readonly isPlaying = this._isPlaying.asReadonly();
  readonly currentTime = this._currentTime.asReadonly();
  readonly duration = this._duration.asReadonly();
  readonly recentlyPlayed = this._recentlyPlayed.asReadonly();
  readonly featuredTrack = computed(() => this.tracks()[0] ?? null);

  constructor() {
    this.audio.loop = false;

    const onTimeUpdate = () => {
      this._currentTime.set(this.audio.currentTime);
      this._duration.set(this.audio.duration || 0);
      if (this.audio.duration > 0) {
        const progress = Math.min(100, Math.round((this.audio.currentTime / this.audio.duration) * 100));
        const playingId = this._selectedTrack()?.id;
        if (playingId) {
          this._recentlyPlayed.update((list) =>
            list.map((item) => (item.id === playingId ? { ...item, progress } : item))
          );
        }
      }
    };

    const onLoadedMetadata = () => {
      this._duration.set(this.audio.duration || 0);
    };

    const onEnded = () => {
      this._isPlaying.set(false);
      this._currentTime.set(0);
      this._recentlyPlayed.update((list) =>
        list.map((item) => (item.id === this._selectedTrack()?.id ? { ...item, progress: 100 } : item))
      );
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

  private addRecentlyPlayed(track: RelaxationTrack): void {
    const existing = this._recentlyPlayed().filter((item) => item.id !== track.id);
    this._recentlyPlayed.set([
      { id: track.id, titleKey: track.titleKey, subtitleKey: track.descriptionKey, progress: 0 },
      ...existing,
    ].slice(0, 5));
  }

  selectTrack(track: RelaxationTrack | null): void {
    if (!track) {
      return;
    }

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

    this.addRecentlyPlayed(track);

    this.audio
      .play()
      .then(() => {
        this._isPlaying.set(true);
      })
      .catch(() => {
        this._isPlaying.set(false);
      });
  }

  selectJourney(journey: Journey): void {
    const track = this.tracks().find((t) => t.id === journey.trackId);
    if (track) {
      this.selectTrack(track);
    }
  }

  selectSoundscape(soundscape: Soundscape): void {
    const track = this.tracks().find((t) => t.id === soundscape.trackId);
    if (track) {
      this.selectTrack(track);
    }
  }

  togglePlayback(): void {
    if (!this._selectedTrack()) {
      return;
    }

    if (this._isPlaying()) {
      this.audio.pause();
      this._isPlaying.set(false);
    } else {
      this.audio
        .play()
        .then(() => this._isPlaying.set(true))
        .catch(() => this._isPlaying.set(false));
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

  saveToLibrary(track: RelaxationTrack | null): void {
    if (!track) {
      return;
    }
    console.debug('Saved to library:', track.id);
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
