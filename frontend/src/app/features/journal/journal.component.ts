import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RewardsService } from '../../core/rewards/rewards.service';

export type MoodEmoji = '😔' | '😕' | '😐' | '🙂' | '😊' | '🤩';

export interface JournalEntry {
  id: string;
  date: string; // ISO date string
  mood: MoodEmoji | null;
  text: string;
  createdAt: number; // timestamp
}

const STORAGE_KEY = 'vibehealth_journal';
const MOODS: { emoji: MoodEmoji; label: string; color: string }[] = [
  { emoji: '😔', label: 'Sad', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  { emoji: '😕', label: 'Low', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
  { emoji: '😐', label: 'Okay', color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
  { emoji: '🙂', label: 'Good', color: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400' },
  { emoji: '😊', label: 'Great', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
  { emoji: '🤩', label: 'Amazing', color: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' },
];

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 pb-20">

      <!-- Header -->
      <header class="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 border-b border-gray-100 dark:border-gray-800 shadow-sm backdrop-blur-md">
        <div class="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <a routerLink="/dashboard" class="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </a>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="text-2xl">📓</span>
              <h1 class="text-xl font-bold text-gray-900 dark:text-white font-heading">{{ 'JOURNAL.TITLE' | translate }}</h1>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {{ entries().length }} {{ 'JOURNAL.ENTRIES' | translate }}
            </p>
          </div>
          <!-- Streak indicator -->
          @if (journalStreak() > 1) {
            <div class="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <span class="text-base">🔥</span>
              <span class="text-sm font-bold text-amber-700 dark:text-amber-400">{{ journalStreak() }}</span>
            </div>
          }
        </div>
      </header>

      <main class="max-w-2xl mx-auto px-4 py-6 space-y-6">

        <!-- New Entry Card -->
        <div class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
          <div class="bg-gradient-to-br from-primary-50 to-sage-50 dark:from-primary-900/20 dark:to-sage-900/20 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
            <h2 class="text-lg font-bold text-gray-900 dark:text-white font-heading">{{ 'JOURNAL.HOW_WAS_DAY' | translate }}</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ todayDateFormatted() }}</p>
          </div>

          <div class="p-6 space-y-5">
            <!-- Mood Selector -->
            <div>
              <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{{ 'JOURNAL.MOOD_LABEL' | translate }}</p>
              <div class="flex gap-2">
                @for (mood of moodOptions; track mood.emoji) {
                  <button
                    (click)="selectMood(mood.emoji)"
                    class="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border-2 transition-all duration-200 hover:scale-110 active:scale-95"
                    [class]="selectedMood() === mood.emoji
                      ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 shadow-lg shadow-primary-500/20 scale-110'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-gray-300'"
                  >
                    <span class="text-xl leading-none">{{ mood.emoji }}</span>
                    <span class="text-xs font-medium text-gray-500 dark:text-gray-400 hidden sm:block">{{ mood.label }}</span>
                  </button>
                }
              </div>
            </div>

            <!-- Text Input — use plain property for ngModel two-way binding -->
            <div>
              <textarea
                [ngModel]="entryText"
                (ngModelChange)="entryText = $event"
                [placeholder]="'JOURNAL.ENTRY_PLACEHOLDER' | translate"
                rows="4"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors placeholder-gray-400"
              ></textarea>
            </div>

            <!-- Save Button -->
            <button
              (click)="saveEntry()"
              [disabled]="!canSave() || isSaving()"
              class="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              [class]="canSave() && !isSaving()
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:brightness-110'
                : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'"
            >
              @if (isSaving()) {
                <span class="flex items-center justify-center gap-2">
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  {{ 'JOURNAL.SAVING' | translate }}
                </span>
              } @else if (savedMessage()) {
                <span class="flex items-center justify-center gap-2">
                  <span>✅</span>
                  {{ savedMessage() }}
                </span>
              } @else {
                {{ 'JOURNAL.SAVE_ENTRY' | translate }}
              }
            </button>
          </div>
        </div>

        <!-- Past Entries -->
        @if (entries().length > 0) {
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white font-heading px-2 mb-4">
              {{ 'JOURNAL.TITLE' | translate }}
            </h3>

            <div class="space-y-3">
              @for (entry of entries(); track entry.id) {
                <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden group transition-all hover:shadow-md">
                  <div class="flex items-start gap-4 p-4">
                    <!-- Mood & Date -->
                    <div class="flex-shrink-0 flex flex-col items-center gap-1">
                      @if (entry.mood) {
                        <span class="text-2xl leading-none">{{ entry.mood }}</span>
                      } @else {
                        <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <span class="text-sm">📝</span>
                        </div>
                      }
                      <span class="text-xs text-gray-400 font-medium whitespace-nowrap">{{ getRelativeDate(entry.createdAt) }}</span>
                    </div>

                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                      <p class="text-xs text-gray-400 dark:text-gray-500 font-medium mb-1">{{ formatDate(entry.date) }}</p>
                      @if (entry.text) {
                        <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">{{ entry.text }}</p>
                      } @else {
                        <p class="text-sm text-gray-400 italic">{{ 'JOURNAL.NO_NOTE' | translate }}</p>
                      }
                    </div>

                    <!-- Delete -->
                    <button
                      (click)="deleteEntry(entry.id)"
                      class="flex-shrink-0 opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                      [attr.aria-label]="'JOURNAL.DELETE_ENTRY' | translate"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        } @else {
          <!-- Empty state -->
          <div class="text-center py-12">
            <div class="text-6xl mb-4 animate-float">📓</div>
            <p class="text-gray-600 dark:text-gray-400 font-semibold text-lg">{{ 'JOURNAL.NO_ENTRIES' | translate }}</p>
            <p class="text-gray-400 dark:text-gray-500 text-sm mt-1">{{ 'JOURNAL.START_LOGGING' | translate }}</p>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
  `],
})
export class JournalComponent implements OnInit {
  private readonly rewards = inject(RewardsService);
  private readonly translate = inject(TranslateService);

  readonly moodOptions = MOODS;
  readonly selectedMood = signal<MoodEmoji | null>(null);
  // Use a plain property for two-way ngModel binding
  entryText = '';
  readonly isSaving = signal(false);
  readonly savedMessage = signal('');
  readonly entries = signal<JournalEntry[]>([]);
  readonly journalStreak = signal(0);

  readonly canSave = computed(() => this.entryText.trim().length > 0 || this.selectedMood() !== null);

  ngOnInit() {
    this.loadEntries();
    this.calculateStreak();
  }

  selectMood(mood: MoodEmoji) {
    this.selectedMood.update(current => current === mood ? null : mood);
  }

  saveEntry() {
    if (!this.canSave() || this.isSaving()) return;

    this.isSaving.set(true);

    setTimeout(() => {
      const today = new Date().toISOString().split('T')[0];
      const entry: JournalEntry = {
        id: crypto.randomUUID(),
        date: today,
        mood: this.selectedMood(),
        text: this.entryText.trim(),
        createdAt: Date.now(),
      };

      this.entries.update(prev => [entry, ...prev]);
      this.saveToStorage();

      // Award carrots
      this.rewards.awardCarrots(3, 'Journal entry! 📓', 'logging');

      // Reset form
      this.selectedMood.set(null);
      this.entryText = '';
      this.isSaving.set(false);
      this.savedMessage.set(this.translate.instant('JOURNAL.SAVED'));

      setTimeout(() => this.savedMessage.set(''), 3000);
    }, 600);
  }

  deleteEntry(id: string) {
    this.entries.update(prev => prev.filter(e => e.id !== id));
    this.saveToStorage();
  }

  getRelativeDate(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return this.translate.instant('JOURNAL.TODAY');
    if (days === 1) return this.translate.instant('JOURNAL.YESTERDAY');
    return `${days} ${this.translate.instant('JOURNAL.DAYS_AGO')}`;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  }

  todayDateFormatted() {
    return new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  private loadEntries() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.entries.set(JSON.parse(raw));
      }
    } catch {
      this.entries.set([]);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries()));
    } catch {
      // storage quota exceeded
    }
  }

  private calculateStreak() {
    const entries = this.entries();
    if (entries.length === 0) { this.journalStreak.set(0); return; }

    const dates = [...new Set(entries.map(e => e.date))].sort().reverse();
    let streak = 0;
    let current = new Date();
    current.setHours(0, 0, 0, 0);

    for (const dateStr of dates) {
      const entryDate = new Date(dateStr);
      entryDate.setHours(0, 0, 0, 0);
      const diff = Math.round((current.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diff <= 1) {
        streak++;
        current = entryDate;
      } else {
        break;
      }
    }

    this.journalStreak.set(streak);
  }
}
