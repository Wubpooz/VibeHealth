import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '../../../core/theme/theme.service';
import { WellnessJournalService } from '../../../core/wellness/wellness-journal.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ToastService } from '../../../core/toast/toast.service';
import {
  type MoodEmoji,
  type MoodUpsertPayload,
  type JournalEntryCreatePayload,
  MOOD_EMOJI_MAP,
  MOOD_LABELS,
} from '../../../core/wellness/wellness-journal.types';

@Component({
  selector: 'app-wellness-journal-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wellness-journal-page">
      <!-- Header -->
      <app-page-header
        [title]="'WELLNESS.JOURNAL.TITLE' | translate"
        [subtitle]="'WELLNESS.JOURNAL.SUBTITLE' | translate"
        [showBackLabel]="false"
      >
        <span pageHeaderIcon class="text-3xl">📝</span>

        <div pageHeaderRight class="flex items-center gap-3">
          <div class="stat-chip">
            <span class="stat-value">{{ journalService.journalCount() }}</span>
            <span class="stat-label">{{ 'WELLNESS.JOURNAL.ENTRIES' | translate }}</span>
          </div>
          <div class="stat-chip carrot-chip">
            <span class="carrot-icon">🥕</span>
            <span class="stat-value">+3</span>
          </div>
        </div>
      </app-page-header>

      <main class="journal-main">
        <!-- Left Panel: Timeline -->
        <section class="journal-timeline">
          <div class="timeline-header">
            <h2 class="text-lg font-semibold dark:text-white">{{ 'WELLNESS.JOURNAL.RECENT_ENTRIES' | translate }}</h2>
            <button class="btn-new-entry" (click)="openNewEntryDialog()" [attr.aria-label]="'WELLNESS.JOURNAL.NEW_ENTRY' | translate">
              ➕
            </button>
          </div>

          @if (journalService.journalLoading()) {
            <div class="loading-spinner">
              <div class="spinner"></div>
              <p class="dark:text-gray-300">{{ 'WELLNESS.JOURNAL.LOADING' | translate }}</p>
            </div>
          } @else if (journalService.journalError()) {
            <div class="error-message">
              <p>{{ journalService.journalError() }}</p>
              <button class="btn-retry" (click)="retryFetch()">{{ 'WELLNESS.JOURNAL.RETRY' | translate }}</button>
            </div>
          } @else if (journalService.journalEntries().length === 0) {
            <div class="empty-state">
              <div class="empty-icon">📝</div>
              <p class="text-center text-gray-500 dark:text-gray-400">{{ 'WELLNESS.JOURNAL.NO_ENTRIES' | translate }}</p>
            </div>
          } @else {
            <div class="entries-list">
              @for (entry of journalService.journalEntries(); track entry.id) {
                <article class="entry-card" [class.has-mood]="entry.mood">
                  <div class="entry-header">
                    <div class="entry-date-mood">
                      @if (entry.mood) {
                        <span class="mood-emoji" [title]="entry.mood.mood">{{ getMoodEmoji(entry.mood.mood) }}</span>
                        <time class="entry-date dark:text-gray-400">{{ entry.createdAt | date : 'MMM d, yyyy' }}</time>
                      } @else {
                        <time class="entry-date dark:text-gray-400">{{ entry.createdAt | date : 'MMM d, yyyy' }}</time>
                      }
                    </div>
                    <button
                      class="btn-delete-entry"
                      (click)="deleteEntry(entry.id)"
                      [attr.aria-label]="'WELLNESS.JOURNAL.DELETE' | translate"
                      [disabled]="journalService.journalLoading()"
                    >
                      🗑️
                    </button>
                  </div>

                  @if (entry.title) {
                    <h3 class="entry-title dark:text-white">{{ entry.title }}</h3>
                  }
                  <p class="entry-preview dark:text-gray-400">{{ entry.richText | slice : 0 : 150 }}{{ entry.richText.length > 150 ? '...' : '' }}</p>

                  @if (entry.media && entry.media.length > 0) {
                    <div class="entry-media-count">
                      <span class="badge">{{ entry.media.length }} {{ 'WELLNESS.JOURNAL.MEDIA_FILES' | translate }}</span>
                    </div>
                  }
                </article>
              }
            </div>
          }

          @if (journalService.journalPagination().hasMore) {
            <button class="btn-load-more" (click)="loadMoreEntries()">
              {{ 'WELLNESS.JOURNAL.LOAD_MORE' | translate }}
            </button>
          }
        </section>

        <!-- Right Panel: Mood Selector & Calendar -->
        <aside class="wellness-sidebar">
          <!-- Mood Selector -->
          <div class="mood-section card">
            <h2 class="section-title">{{ 'WELLNESS.JOURNAL.TODAY_MOOD' | translate }}</h2>

            <div class="mood-date-picker">
              <button class="btn-date-nav" (click)="previousDay()">
                ◀️
              </button>
              <input
                type="date"
                [value]="selectedDate() | date : 'yyyy-MM-dd'"
                (change)="onDateChange($event)"
                class="input-date dark:bg-gray-800 dark:text-white dark:border-gray-700"
              />
              <button class="btn-date-nav" (click)="nextDay()">
                ▶️
              </button>
            </div>

            <div class="mood-grid">
              @for (mood of moods; track mood) {
                <button
                  class="mood-btn"
                  [class.selected]="selectedMood() === mood"
                  (click)="selectMood(mood)"
                  [attr.title]="getMoodLabel(mood) | translate"
                >
                  <span class="mood-emoji-large">{{ getMoodEmoji(mood) }}</span>
                  <span class="mood-label">{{ getMoodLabel(mood) | translate }}</span>
                </button>
              }
            </div>

            @if (selectedMood()) {
              <button class="btn-save-mood" (click)="saveMood()" [disabled]="journalService.moodLoading()">
                {{ 'WELLNESS.JOURNAL.SAVE_MOOD' | translate }}
              </button>
            }
          </div>

          <!-- Mood History / Streak -->
          <div class="streak-section card">
            <h3 class="section-title">{{ 'WELLNESS.JOURNAL.MOOD_HISTORY' | translate }}</h3>

            @if (journalService.moodLoading()) {
              <div class="loading-mini">
                <div class="spinner-mini"></div>
              </div>
            } @else if (journalService.moodError()) {
              <p class="text-xs text-red-500">{{ journalService.moodError() }}</p>
            } @else if (journalService.moodLogs().length === 0) {
              <p class="text-xs text-gray-400 dark:text-gray-500">{{ 'WELLNESS.JOURNAL.NO_MOOD_HISTORY' | translate }}</p>
            } @else {
              <div class="mood-history-list">
                @for (log of journalService.moodLogs() | slice : 0 : 7; track log.id) {
                  <div class="mood-history-item">
                    <span class="mood-date">{{ log.date | date : 'MMM d' }}</span>
                    <span class="mood-emoji">{{ getMoodEmoji(log.mood) }}</span>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Carrot Rewards -->
          <div class="rewards-section card">
            <div class="rewards-header">
              <h3 class="section-title">{{ 'WELLNESS.JOURNAL.EARN_CARROTS' | translate }}</h3>
              <span class="carrot-big">🥕</span>
            </div>
            <ul class="rewards-list">
              <li class="reward-item">
                <span class="reward-text">{{ 'WELLNESS.JOURNAL.REWARD_MOOD' | translate }}</span>
                <span class="reward-value">+3</span>
              </li>
              <li class="reward-item">
                <span class="reward-text">{{ 'WELLNESS.JOURNAL.REWARD_ENTRY' | translate }}</span>
                <span class="reward-value">+3</span>
              </li>
            </ul>
          </div>
        </aside>
      </main>

      <!-- New Entry Modal -->
      @if (showNewEntryDialog()) {
        <div class="modal-overlay" (click)="closeNewEntryDialog()" (keydown.escape)="closeNewEntryDialog()" role="presentation">
          <div class="modal-content" (click)="$event.stopPropagation()" (keydown.enter)="$event.stopPropagation()" role="dialog" aria-modal="true">
            <div class="modal-header">
              <h2>{{ 'WELLNESS.JOURNAL.NEW_ENTRY_TITLE' | translate }}</h2>
              <button 
                type="button"
                class="modal-close" 
                (click)="closeNewEntryDialog()" 
                (keydown.enter)="closeNewEntryDialog()" 
                (keydown.space)="closeNewEntryDialog()" 
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <form [formGroup]="entryForm" class="modal-form">
              <div class="form-group">
                <label for="entry-title">{{ 'WELLNESS.JOURNAL.ENTRY_TITLE_LABEL' | translate }}</label>
                <input
                  id="entry-title"
                  type="text"
                  formControlName="title"
                  placeholder="{{ 'WELLNESS.JOURNAL.ENTRY_TITLE_PLACEHOLDER' | translate }}"
                  class="form-input dark:bg-gray-800 dark:text-white dark:border-gray-700"
                />
              </div>
              <div class="form-group">
                <label for="entry-text">{{ 'WELLNESS.JOURNAL.ENTRY_TEXT_LABEL' | translate }}</label>
                <textarea
                  id="entry-text"
                  formControlName="richText"
                  placeholder="{{ 'WELLNESS.JOURNAL.ENTRY_TEXT_PLACEHOLDER' | translate }}"
                  class="form-textarea dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  rows="6"
                ></textarea>
              </div>

              <!-- File Upload Section -->
              <div class="form-group">
                <label for="media-input" class="media-label">{{ 'WELLNESS.JOURNAL.ADD_MEDIA' | translate }}</label>
                <input
                  #fileInput
                  id="media-input"
                  type="file"
                  multiple
                  accept="image/*,audio/*"
                  (change)="onFileSelected($event)"
                  class="hidden-file-input"
                  aria-label="{{ 'WELLNESS.JOURNAL.SELECT_MEDIA' | translate }}"
                />
                <button
                  type="button"
                  class="btn-add-media"
                  (click)="fileInput.click()"
                  (keydown.enter)="fileInput.click()"
                  (keydown.space)="fileInput.click()"
                  [attr.aria-label]="'WELLNESS.JOURNAL.SELECT_MEDIA' | translate"
                >
                  📎 {{ 'WELLNESS.JOURNAL.ATTACH_FILES' | translate }}
                </button>

                <!-- Selected Files Chips -->
                @if (selectedFiles().length > 0) {
                  <div class="media-chips">
                    @for (file of selectedFiles(); track file.name + file.size) {
                      <div class="media-chip" [class.is-audio]="isAudioFile(file)">
                        <span class="media-icon">
                          @if (isAudioFile(file)) {
                            🎵
                          } @else {
                            🖼️
                          }
                        </span>
                        <div class="media-info">
                          <span class="media-name">{{ file.name }}</span>
                          <span class="media-size">{{ formatFileSize(file.size) }}</span>
                        </div>
                        <button
                          type="button"
                          class="remove-media"
                          (click)="removeFile(file.name)"
                          (keydown.enter)="removeFile(file.name)"
                          (keydown.space)="removeFile(file.name)"
                          [attr.aria-label]="('WELLNESS.JOURNAL.REMOVE_FILE' | translate) + ': ' + file.name"
                        >
                          ✕
                        </button>
                      </div>
                    }
                  </div>
                }
              </div>

              <div class="modal-actions">
                <button type="button" class="btn-cancel" (click)="closeNewEntryDialog()">
                  {{ 'WELLNESS.JOURNAL.CANCEL' | translate }}
                </button>
                <button type="button" class="btn-submit" (click)="createEntry()" [disabled]="!entryForm.valid || isCreatingEntry()">
                  {{ isCreatingEntry() ? ('WELLNESS.JOURNAL.CREATING' | translate) : ('WELLNESS.JOURNAL.CREATE_ENTRY' | translate) }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .wellness-journal-page {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: linear-gradient(135deg, #fff5f1 0%, #fffbf8 100%);
      transition: background-color 0.3s ease;
      font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    :host-context(.dark) .wellness-journal-page {
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    }

    .wellness-header {
      padding: 2rem 1.5rem;
      background: linear-gradient(135deg, #ff9d87 0%, #ffa89e 100%);
      color: white;
      border-radius: 0 0 1.5rem 1.5rem;
      box-shadow: 0 8px 20px rgba(255, 157, 135, 0.15);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    }

    .header-container h1 {
      margin: 0;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .header-container p {
      margin: 0.5rem 0 0 0;
      opacity: 0.95;
    }

    .header-stats {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .stat-chip {
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 0.75rem 1.25rem;
      border-radius: 999px;
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.75rem;
      opacity: 0.85;
      margin-top: 0.25rem;
    }

    .carrot-chip {
      gap: 0.5rem;
      flex-direction: row;
      align-items: center;
    }

    .carrot-icon {
      font-size: 1.5rem;
    }

    .journal-main {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 2rem;
      padding: 2rem 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }

    @media (max-width: 1024px) {
      .journal-main {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
    }

    .journal-timeline {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .timeline-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #333;
    }

    :host-context(.dark) .timeline-header h2 {
      color: #fff;
    }

    .btn-new-entry {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 999px;
      background: linear-gradient(135deg, #ff9d87 0%, #ffa89e 100%);
      border: none;
      color: white;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(255, 157, 135, 0.2);
    }

    .btn-new-entry:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(255, 157, 135, 0.3);
    }

    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 3rem 2rem;
      background: white;
      border-radius: 1.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    :host-context(.dark) .loading-spinner {
      background: #2d2d2d;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 4rem 2rem;
      background: white;
      border-radius: 1.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    :host-context(.dark) .empty-state {
      background: #2d2d2d;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255, 157, 135, 0.2);
      border-top-color: #ff9d87;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .error-message {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1.5rem;
      background: white;
      border: 1px solid rgba(255, 0, 0, 0.2);
      border-radius: 1.5rem;
      color: #d32f2f;
    }

    :host-context(.dark) .error-message {
      background: #2d2d2d;
      border-color: rgba(255, 0, 0, 0.3);
    }

    .error-message p {
      margin: 0;
      font-size: 0.9rem;
    }

    .btn-retry {
      align-self: flex-start;
      padding: 0.5rem 1rem;
      background: #d32f2f;
      color: white;
      border: none;
      border-radius: 999px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .btn-retry:hover {
      background: #b71c1c;
    }

    .empty-icon {
      font-size: 3rem;
      opacity: 0.5;
    }

    .entries-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .entry-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 1.25rem;
      background: white;
      border: 1px solid rgba(255, 157, 135, 0.1);
      border-radius: 1.25rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
    }

    :host-context(.dark) .entry-card {
      background: #2d2d2d;
      border-color: rgba(255, 157, 135, 0.2);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .entry-card:hover {
      border-color: rgba(255, 157, 135, 0.3);
      box-shadow: 0 4px 16px rgba(255, 157, 135, 0.1);
      transform: translateY(-2px);
    }

    .entry-card.has-mood {
      border-left: 4px solid #ff9d87;
    }

    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }

    .entry-date-mood {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .mood-emoji {
      font-size: 1.5rem;
      line-height: 1;
    }

    .entry-date {
      font-size: 0.875rem;
      color: #666;
      font-weight: 500;
    }

    :host-context(.dark) .entry-date {
      color: #999;
    }

    .btn-delete-entry {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: rgba(255, 0, 0, 0.05);
      border: 1px solid rgba(255, 0, 0, 0.15);
      border-radius: 999px;
      color: #d32f2f;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    :host-context(.dark) .btn-delete-entry {
      background: rgba(255, 0, 0, 0.1);
      border-color: rgba(255, 0, 0, 0.2);
    }

    .btn-delete-entry:hover:not(:disabled) {
      background: #d32f2f;
      color: white;
    }

    .btn-delete-entry:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .entry-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #333;
    }

    :host-context(.dark) .entry-title {
      color: #fff;
    }

    .entry-preview {
      margin: 0;
      font-size: 0.9rem;
      color: #666;
      line-height: 1.5;
    }

    :host-context(.dark) .entry-preview {
      color: #bbb;
    }

    .entry-media-count {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: rgba(255, 157, 135, 0.15);
      color: #ff9d87;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    :host-context(.dark) .badge {
      background: rgba(255, 157, 135, 0.2);
    }

    .btn-load-more {
      padding: 1rem;
      background: white;
      border: 2px dashed rgba(255, 157, 135, 0.3);
      border-radius: 1rem;
      color: #ff9d87;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }

    :host-context(.dark) .btn-load-more {
      background: #2d2d2d;
      border-color: rgba(255, 157, 135, 0.3);
    }

    .btn-load-more:hover {
      border-color: rgba(255, 157, 135, 0.6);
      background: rgba(255, 157, 135, 0.05);
    }

    :host-context(.dark) .btn-load-more:hover {
      background: rgba(255, 157, 135, 0.1);
    }

    .wellness-sidebar {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .card {
      padding: 1.5rem;
      background: white;
      border: 1px solid rgba(255, 157, 135, 0.1);
      border-radius: 1.25rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .card {
      padding: 1.5rem;
      background: white;
      border: 1px solid rgba(255, 157, 135, 0.1);
      border-radius: 1.25rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
    }

    :host-context(.dark) .card {
      background: #2d2d2d;
      border-color: rgba(255, 157, 135, 0.2);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .section-title {
      margin: 0 0 1rem 0;
      font-size: 0.95rem;
      font-weight: 600;
      color: #333;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.8;
    }

    :host-context(.dark) .section-title {
      color: #ddd;
    }

    .mood-date-picker {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .btn-date-nav {
      width: 36px;
      height: 36px;
      border: 1px solid rgba(255, 157, 135, 0.2);
      background: white;
      border-radius: 999px;
      cursor: pointer;
      color: #ff9d87;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-date-nav:hover {
      background: rgba(255, 157, 135, 0.1);
      border-color: rgba(255, 157, 135, 0.4);
    }

    .input-date {
      flex: 1;
      padding: 0.5rem 0.75rem;
      border: 1px solid rgba(255, 157, 135, 0.2);
      border-radius: 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
    }

    .input-date:focus {
      outline: none;
      border-color: #ff9d87;
      box-shadow: 0 0 0 3px rgba(255, 157, 135, 0.1);
    }

    .mood-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .mood-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 0.5rem;
      background: rgba(255, 157, 135, 0.05);
      border: 2px solid transparent;
      border-radius: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.65rem;
      font-weight: 500;
      color: #666;
    }

    :host-context(.dark) .mood-btn {
      background: rgba(255, 157, 135, 0.1);
      color: #aaa;
    }

    .mood-btn:hover {
      background: rgba(255, 157, 135, 0.15);
      border-color: rgba(255, 157, 135, 0.3);
    }

    :host-context(.dark) .mood-btn:hover {
      background: rgba(255, 157, 135, 0.2);
    }

    .mood-btn.selected {
      background: linear-gradient(135deg, #ff9d87 0%, #ffa89e 100%);
      border-color: #ff9d87;
      color: white;
    }

    .mood-emoji-large {
      font-size: 1.5rem;
      line-height: 1;
    }

    .mood-label {
      text-transform: capitalize;
      letter-spacing: 0.3px;
      max-width: 100%;
    }

    .mood-note-input {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .input-note {
      padding: 0.75rem;
      border: 1px solid rgba(255, 157, 135, 0.2);
      border-radius: 0.75rem;
      font-family: inherit;
      font-size: 0.875rem;
      resize: vertical;
      transition: all 0.2s ease;
    }

    .input-note:focus {
      outline: none;
      border-color: #ff9d87;
      box-shadow: 0 0 0 3px rgba(255, 157, 135, 0.1);
    }

    .btn-save-mood {
      padding: 0.75rem 1rem;
      background: linear-gradient(135deg, #ff9d87 0%, #ffa89e 100%);
      color: white;
      border: none;
      border-radius: 999px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-save-mood:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 157, 135, 0.3);
    }

    .btn-save-mood:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .mood-history-list {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.5rem;
    }

    .mood-history-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
      padding: 0.5rem;
      background: rgba(255, 157, 135, 0.05);
      border-radius: 0.75rem;
    }

    :host-context(.dark) .mood-history-item {
      background: rgba(255, 157, 135, 0.1);
    }

    .mood-date {
      font-size: 0.7rem;
      color: #999;
      font-weight: 500;
    }

    :host-context(.dark) .mood-date {
      color: #666;
    }

    .mood-emoji {
      font-size: 1.25rem;
      line-height: 1;
    }

    .loading-mini {
      display: flex;
      justify-content: center;
      padding: 1rem;
    }

    .spinner-mini {
      width: 24px;
      height: 24px;
      border: 2px solid rgba(255, 157, 135, 0.2);
      border-top-color: #ff9d87;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .rewards-section {
      background: linear-gradient(135deg, rgba(255, 157, 135, 0.1) 0%, rgba(255, 168, 158, 0.05) 100%);
      border: 2px dashed rgba(255, 157, 135, 0.3);
    }

    :host-context(.dark) .rewards-section {
      background: linear-gradient(135deg, rgba(255, 157, 135, 0.15) 0%, rgba(255, 168, 158, 0.08) 100%);
    }

    .rewards-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .carrot-big {
      font-size: 2rem;
      opacity: 0.8;
    }

    .rewards-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .reward-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(255, 157, 135, 0.1);
      font-size: 0.85rem;
    }

    .reward-item:last-child {
      border-bottom: none;
    }

    .reward-text {
      color: #666;
    }

    :host-context(.dark) .reward-text {
      color: #aaa;
    }

    .reward-value {
      font-weight: 700;
      color: #ff9d87;
      font-size: 1rem;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .modal-content {
      background: white;
      border-radius: 1.5rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUp 0.3s ease-out;
    }

    :host-context(.dark) .modal-content {
      background: #2d2d2d;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255, 157, 135, 0.1);
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #333;
    }

    :host-context(.dark) .modal-header h2 {
      color: #fff;
    }

    .modal-close {
      width: 36px;
      height: 36px;
      border: none;
      background: rgba(255, 157, 135, 0.1);
      border-radius: 50%;
      color: #ff9d87;
      font-size: 1.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-close:hover {
      background: rgba(255, 157, 135, 0.2);
    }

    .modal-form {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 600;
      font-size: 0.9rem;
      color: #333;
    }

    :host-context(.dark) .form-group label {
      color: #ddd;
    }

    .form-input,
    .form-textarea {
      padding: 0.75rem;
      border: 1px solid rgba(255, 157, 135, 0.2);
      border-radius: 0.75rem;
      font-family: inherit;
      font-size: 0.9rem;
    }

    .form-input:focus,
    .form-textarea:focus {
      outline: none;
      border-color: #ff9d87;
      box-shadow: 0 0 0 3px rgba(255, 157, 135, 0.1);
    }

    .form-textarea {
      resize: vertical;
      min-height: 120px;
    }

    /* File Upload Styles */
    .hidden-file-input {
      display: none;
    }

    .media-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      font-size: 0.9rem;
      color: #333;
    }

    :host-context(.dark) .media-label {
      color: #ddd;
    }

    .btn-add-media {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: rgba(255, 157, 135, 0.1);
      border: 2px solid rgba(255, 157, 135, 0.3);
      border-radius: 999px;
      color: #ff9d87;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }

    :host-context(.dark) .btn-add-media {
      background: rgba(255, 157, 135, 0.15);
      border-color: rgba(255, 157, 135, 0.4);
    }

    .btn-add-media:hover {
      background: rgba(255, 157, 135, 0.2);
      border-color: rgba(255, 157, 135, 0.5);
      transform: translateY(-1px);
    }

    :host-context(.dark) .btn-add-media:hover {
      background: rgba(255, 157, 135, 0.25);
    }

    .btn-add-media:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(255, 157, 135, 0.2);
    }

    .media-chips {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .media-chip {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: rgba(255, 157, 135, 0.08);
      border: 1px solid rgba(255, 157, 135, 0.2);
      border-radius: 999px;
      border-left: 3px solid #ffa89e;
    }

    :host-context(.dark) .media-chip {
      background: rgba(255, 157, 135, 0.12);
      border-color: rgba(255, 157, 135, 0.3);
    }

    .media-chip.is-audio {
      border-left-color: #ff9d87;
    }

    .media-icon {
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .media-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      flex: 1;
      min-width: 0;
    }

    .media-name {
      font-size: 0.9rem;
      font-weight: 500;
      color: #333;
      word-break: break-all;
    }

    :host-context(.dark) .media-name {
      color: #fff;
    }

    .media-size {
      font-size: 0.75rem;
      color: #999;
      font-weight: 400;
    }

    :host-context(.dark) .media-size {
      color: #bbb;
    }

    .remove-media {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      min-width: 28px;
      background: rgba(255, 0, 0, 0.1);
      border: 1px solid rgba(255, 0, 0, 0.2);
      border-radius: 50%;
      color: #d32f2f;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }

    :host-context(.dark) .remove-media {
      background: rgba(255, 0, 0, 0.15);
      border-color: rgba(255, 0, 0, 0.3);
    }

    .remove-media:hover {
      background: #d32f2f;
      color: white;
      transform: scale(1.1);
    }

    .remove-media:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(255, 0, 0, 0.2);
    }

    .modal-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      padding: 1.5rem;
      border-top: 1px solid rgba(255, 157, 135, 0.1);
    }

    .btn-cancel {
      padding: 0.75rem 1.5rem;
      border: 1px solid rgba(255, 157, 135, 0.3);
      background: white;
      border-radius: 999px;
      color: #666;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    :host-context(.dark) .btn-cancel {
      background: #3a3a3a;
      color: #aaa;
      border-color: rgba(255, 157, 135, 0.2);
    }

    .btn-cancel:hover {
      background: rgba(255, 157, 135, 0.1);
      color: #333;
    }

    :host-context(.dark) .btn-cancel:hover {
      background: rgba(255, 157, 135, 0.15);
      color: #ddd;
    }

    .btn-submit {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #ff9d87 0%, #ffa89e 100%);
      border: none;
      border-radius: 999px;
      color: white;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 157, 135, 0.3);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `,
})
export class WellnessJournalPageComponent implements OnInit {
  readonly journalService = inject(WellnessJournalService);
  readonly themeService = inject(ThemeService);
  readonly formBuilder = inject(FormBuilder);
  readonly toastService = inject(ToastService);

  readonly moods: MoodEmoji[] = ['VERY_SAD', 'SAD', 'NEUTRAL', 'HAPPY', 'VERY_HAPPY', 'EXCITED'];

  readonly selectedDate = signal(new Date());
  readonly selectedMood = signal<MoodEmoji | null>(null);
  readonly showNewEntryDialog = signal(false);
  readonly isCreatingEntry = signal(false);
  readonly selectedFiles = signal<File[]>([]);

  entryForm!: FormGroup;

  async ngOnInit(): Promise<void> {
    this.entryForm = this.formBuilder.group({
      title: [''],
      richText: ['', Validators.required],
    });

    await this.journalService.fetchJournalEntries();
    await this.journalService.fetchMoodLogs();
  }

  getMoodEmoji(mood: MoodEmoji): string {
    return MOOD_EMOJI_MAP[mood] || '😐';
  }

  getMoodLabel(mood: MoodEmoji): string {
    return MOOD_LABELS[mood] || 'mood';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const newFiles = Array.from(input.files);
      const currentFiles = this.selectedFiles();
      this.selectedFiles.set([...currentFiles, ...newFiles]);
      // Reset input so same file can be selected again
      input.value = '';
    }
  }

  removeFile(fileName: string): void {
    const currentFiles = this.selectedFiles();
    this.selectedFiles.set(currentFiles.filter(f => f.name !== fileName));
  }

  isAudioFile(file: File): boolean {
    return file.type.startsWith('audio/');
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  selectMood(mood: MoodEmoji): void {
    this.selectedMood.set(mood);
  }

  async saveMood(): Promise<void> {
    const mood = this.selectedMood();
    if (!mood) return;

    const dateStr = this.selectedDate().toISOString().split('T')[0];
    const payload: MoodUpsertPayload = {
      date: dateStr,
      mood,
      tags: [],
    };

    const result = await this.journalService.upsertMoodLog(payload);
    if (result) {
      this.selectedMood.set(null);
    }
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedDate.set(new Date(input.value));
  }

  previousDay(): void {
    const date = new Date(this.selectedDate());
    date.setDate(date.getDate() - 1);
    this.selectedDate.set(date);
  }

  nextDay(): void {
    const date = new Date(this.selectedDate());
    date.setDate(date.getDate() + 1);
    this.selectedDate.set(date);
  }

  async deleteEntry(entryId: string): Promise<void> {
    const confirmed = confirm('Are you sure you want to delete this entry?');
    if (confirmed) {
      await this.journalService.deleteJournalEntry(entryId);
    }
  }

  openNewEntryDialog(): void {
    this.showNewEntryDialog.set(true);
  }

  closeNewEntryDialog(): void {
    this.showNewEntryDialog.set(false);
    this.entryForm.reset();
  }

  async createEntry(): Promise<void> {
    if (!this.entryForm.valid) return;

    this.isCreatingEntry.set(true);
    try {
      const payload: JournalEntryCreatePayload = {
        title: this.entryForm.value.title || undefined,
        richText: this.entryForm.value.richText,
      };

      const files = this.selectedFiles();
      const result = await this.journalService.createJournalEntryWithMedia(payload, files);
      if (result) {
        this.toastService.show({
          message: 'WELLNESS.JOURNAL.ENTRY_CREATED',
          tone: 'success',
        });
        this.closeNewEntryDialog();
        this.selectedFiles.set([]);
        await this.journalService.fetchJournalEntries();
      } else {
        const error = this.journalService.journalError();
        this.toastService.show({
          message: error || 'Failed to create entry',
          tone: 'error',
        });
      }
    } catch (error) {
      console.error('[Journal] Create entry error:', error);
      this.toastService.show({
        message: 'Error creating entry',
        tone: 'error',
      });
    } finally {
      this.isCreatingEntry.set(false);
    }
  }

  async retryFetch(): Promise<void> {
    await this.journalService.fetchJournalEntries();
  }

  async loadMoreEntries(): Promise<void> {
    const pagination = this.journalService.journalPagination();
    await this.journalService.fetchJournalEntries(pagination.limit, pagination.offset + pagination.limit);
  }
}
