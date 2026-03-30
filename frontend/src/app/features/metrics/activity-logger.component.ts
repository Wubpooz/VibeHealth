import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  afterNextRender,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MetricsService } from '../../core/metrics/metrics.service';
import { ProfileService } from '../../core/profile/profile.service';
import { RewardsService } from '../../core/rewards/rewards.service';
import { AutocompleteComponent } from '../../shared/components/autocomplete/autocomplete.component';
import {
  ACTIVITY_PRESETS,
  INTENSITY_LABELS,
  type ActivityType,
  type Intensity,
} from '../../core/metrics/metrics.types';
import { LucideActivity } from '@lucide/angular';

type NumericInput = number | string | null;

@Component({
  selector: 'app-activity-logger',
  imports: [CommonModule, FormsModule, TranslateModule, AutocompleteComponent, LucideActivity],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="activity-card">
      <!-- Header -->
      <div class="header">
        <div class="title-row">
          <span class="icon" aria-hidden="true">
            <svg lucideActivity [size]="24" [strokeWidth]="2"></svg>
          </span>
          <h3>{{ 'METRICS.ACTIVITY.TITLE' | translate }}</h3>
        </div>
        <button 
          class="add-btn"
          (click)="showForm.set(!showForm())"
          [class.active]="showForm()"
        >
          {{ showForm() ? '✕' : '+' }}
        </button>
      </div>

      <!-- Today's Summary -->
      <div class="summary">
        <div class="stat">
          <span class="value">{{ activityMinutes() }}</span>
          <span class="label">{{ 'METRICS.ACTIVITY.MINUTES' | translate }}</span>
        </div>
        <div class="stat">
          <span class="value">{{ activityCalories() }}</span>
          <span class="label">{{ 'METRICS.ACTIVITY.CALORIES' | translate }}</span>
        </div>
        <div class="stat">
          <span class="value">{{ activitiesCount() }}</span>
          <span class="label">{{ 'METRICS.ACTIVITY.SESSIONS' | translate }}</span>
        </div>
      </div>

      <div class="logger-layout">
        <div class="logger-main">
          @if (topCatalogActivities().length > 0) {
            <div class="catalog-strip">
              <p class="catalog-strip-title">{{ 'METRICS.ACTIVITY.CATALOG_HELP' | translate }}</p>
              @for (activity of topCatalogActivities(); track activity.key) {
                <button class="catalog-pill" type="button" (click)="selectCatalogActivity(activity.key)">
                  <span class="emoji" aria-hidden="true">
                    <svg lucideActivity [size]="18" [strokeWidth]="2"></svg>
                  </span>
                  <span class="meta">
                    <strong>{{ activity.name }}</strong>
                    <small>{{ activity.metValue }} MET</small>
                  </span>
                </button>
              }
            </div>
          }

          <!-- Quick Activity Buttons -->
          @if (!showForm()) {
            <div class="quick-buttons">
              @for (activity of quickActivities; track activity.type) {
                <button
                  class="quick-btn"
                  (click)="quickLog(activity.type)"
                  [disabled]="logging()"
                >
                  <span class="emoji">{{ activity.emoji }}</span>
                  <span class="name">{{ activity.label }}</span>
                </button>
              }
            </div>
          }

          <!-- Log Form -->
          @if (showForm()) {
            <form class="log-form" (ngSubmit)="submitForm()">
              <!-- Activity Type -->
              <div class="form-group">
                <div class="form-label" id="activityTypeLabel">{{ 'METRICS.ACTIVITY.TYPE' | translate }}</div>
                <div class="type-grid" role="group" aria-labelledby="activityTypeLabel">
                  @for (activity of allActivities; track activity.type) {
                    <button
                      type="button"
                      class="type-btn"
                      [class.selected]="selectedType() === activity.type"
                      (click)="onActivityTypeChange(activity.type)"
                    >
                      <span class="emoji">{{ activity.emoji || '🏃' }}</span>
                      <span class="text-wrap">
                        <span class="name">{{ formatActivityTypeLabel(activity.type, activity.label) }}</span>
                        <small class="type-meta">{{ activityCountsByType()[activity.type] }} {{ 'METRICS.ACTIVITY.OPTIONS' | translate }}</small>
                      </span>
                    </button>
                  }
                </div>
                <p class="field-hint">{{ 'METRICS.ACTIVITY.TYPE_HELP' | translate }}</p>
              </div>

              <!-- Activity Catalog Search -->
              <div class="form-group">
                <div class="form-label">{{ 'METRICS.ACTIVITY.CATALOG_SEARCH' | translate }}</div>
                <app-autocomplete
                  [suggestions]="activitySuggestions()"
                  [selectedItems]="selectedActivitySearch()"
                  [placeholder]="'METRICS.ACTIVITY.CATALOG_SEARCH_PLACEHOLDER' | translate"
                  [allowCustom]="false"
                  [multiple]="false"
                  (itemsChange)="onActivitySearchChange($event)"
                />
                <p class="field-hint">{{ 'METRICS.ACTIVITY.CATALOG_HELP' | translate }}</p>
              </div>

              <div class="catalog-results" role="listbox" [attr.aria-label]="'METRICS.ACTIVITY.CATALOG_LIST_ARIA' | translate">
                <p class="catalog-count">
                  {{ 'METRICS.ACTIVITY.CATALOG_COUNT' | translate:{ count: catalogActivitiesForSelectedType().length } }}
                </p>
                @if (catalogActivitiesForSelectedType().length > 0) {
                  <div class="catalog-options-grid">
                    @for (activity of catalogActivitiesForSelectedType(); track activity.key) {
                      <button
                        type="button"
                        class="catalog-option"
                        [class.selected]="selectedCatalogActivity()?.key === activity.key"
                        (click)="selectCatalogActivity(activity.key)"
                      >
                        <span class="emoji" aria-hidden="true">{{ activity.emoji }}</span>
                        <span class="meta">
                          <strong>{{ activity.name }}</strong>
                          <small>{{ activity.metValue }} MET</small>
                          @if (activity.tags.length > 0) {
                            <small>{{ activity.tags.slice(0, 2).join(' • ') }}</small>
                          }
                        </span>
                      </button>
                    }
                  </div>
                } @else {
                  <p class="catalog-empty">{{ 'METRICS.ACTIVITY.CATALOG_EMPTY' | translate }}</p>
                }
              </div>

              @if (selectedCatalogActivity()) {
                <div class="catalog-detail">
                  <div class="catalog-detail-header">
                    <span class="emoji">{{ selectedCatalogActivity()!.emoji }}</span>
                    <div>
                      <strong>{{ selectedCatalogActivity()!.name }}</strong>
                      <p>{{ selectedCatalogActivity()!.category }} · {{ selectedCatalogActivity()!.metValue }} MET</p>
                    </div>
                  </div>
                  @if (selectedCatalogActivity()!.description) {
                    <p class="catalog-detail-description">{{ selectedCatalogActivity()!.description }}</p>
                  }
                </div>
              }

              <!-- Activity Name -->
              <div class="form-group">
                <label for="activityName">{{ 'METRICS.ACTIVITY.NAME' | translate }}</label>
                <input
                  type="text"
                  id="activityName"
                  [ngModel]="activityName()"
                  (ngModelChange)="activityName.set($event)"
                  [placeholder]="'METRICS.ACTIVITY.NAME_PLACEHOLDER' | translate"
                  required
                />
              </div>

              <!-- Duration -->
              <div class="form-group">
                <div class="form-label" id="durationLabel">{{ 'METRICS.ACTIVITY.DURATION' | translate }}</div>
                <div class="duration-presets" role="group" aria-labelledby="durationLabel">
                  @for (preset of durationPresets; track preset) {
                    <button
                      type="button"
                      class="preset-btn"
                      [class.selected]="duration() === preset"
                      (click)="setDuration(preset)"
                    >
                      {{ preset }}min
                    </button>
                  }
                </div>
                <div class="timer-row">
                  <button type="button" class="timer-btn" (click)="toggleTimer()">
                    {{ timerRunning() ? ('METRICS.ACTIVITY.STOP_TIMER' | translate) : ('METRICS.ACTIVITY.START_TIMER' | translate) }}
                  </button>
                  <button type="button" class="timer-btn secondary" (click)="resetTimer()">
                    {{ 'METRICS.ACTIVITY.RESET_TIMER' | translate }}
                  </button>
                  <span class="timer-display">{{ timerDisplay() }}</span>
                </div>
                <input
                  type="number"
                  id="durationInput"
                  [ngModel]="duration()"
                  (ngModelChange)="setDuration($event)"
                  min="1"
                  max="480"
                  [placeholder]="'METRICS.ACTIVITY.CUSTOM_DURATION_PLACEHOLDER' | translate"
                  aria-labelledby="durationLabel"
                />
                <p class="field-hint">{{ 'METRICS.ACTIVITY.DURATION_HELP' | translate }}</p>
              </div>

              <!-- Intensity -->
              <div class="form-group">
                <div class="form-label" id="intensityLabel">{{ 'METRICS.ACTIVITY.INTENSITY' | translate }}</div>
                <div class="intensity-slider" role="group" aria-labelledby="intensityLabel">
                  @for (int of intensityLevels; track int.key) {
                    <button
                      type="button"
                      class="intensity-btn"
                      [class.selected]="intensity() === int.key"
                      (click)="intensity.set(int.key)"
                    >
                      {{ int.label }}
                    </button>
                  }
                </div>
              </div>

              <div class="details-grid">
                <div class="form-group">
                  <label for="activityLocation">{{ 'METRICS.ACTIVITY.LOCATION' | translate }}</label>
                  <input
                    type="text"
                    id="activityLocation"
                    [ngModel]="location()"
                    (ngModelChange)="location.set($event)"
                    [placeholder]="'METRICS.ACTIVITY.LOCATION_PLACEHOLDER' | translate"
                  />
                </div>

                <div class="form-group">
                  <label for="activityDistance">{{ 'METRICS.ACTIVITY.DISTANCE' | translate }}</label>
                  <input
                    type="number"
                    id="activityDistance"
                    [ngModel]="distanceKm()"
                    (ngModelChange)="onDistanceChange($event)"
                    min="0"
                    max="1000"
                    step="0.1"
                    [placeholder]="'METRICS.ACTIVITY.DISTANCE_PLACEHOLDER' | translate"
                  />
                </div>

                <div class="form-group">
                  <label for="activityHeartRate">{{ 'METRICS.ACTIVITY.HEART_RATE_AVG' | translate }}</label>
                  <input
                    type="number"
                    id="activityHeartRate"
                    [ngModel]="heartRateAvg()"
                    (ngModelChange)="onHeartRateChange($event)"
                    min="40"
                    max="250"
                    [placeholder]="'METRICS.ACTIVITY.HEART_RATE_PLACEHOLDER' | translate"
                  />
                </div>

                <div class="form-group details-notes">
                  <label for="activityNotes">{{ 'METRICS.ACTIVITY.NOTES' | translate }}</label>
                  <textarea
                    id="activityNotes"
                    rows="3"
                    [ngModel]="sessionNotes()"
                    (ngModelChange)="sessionNotes.set($event)"
                    [placeholder]="'METRICS.ACTIVITY.NOTES_PLACEHOLDER' | translate"
                  ></textarea>
                </div>
              </div>
              <p class="field-hint">{{ 'METRICS.ACTIVITY.DETAILS_HELP' | translate }}</p>

              <!-- Estimated Calories -->
              <div class="calories-estimate">
                <span class="label">{{ 'METRICS.ACTIVITY.EST_CALORIES' | translate }}:</span>
                <span class="value">~{{ estimatedCalories() }} kcal</span>
              </div>

              <!-- Submit -->
              <button
                type="submit"
                class="submit-btn"
                [disabled]="!canSubmit() || logging()"
              >
                @if (logging()) {
                  <span class="spinner" aria-hidden="true"></span>
                } @else {
                  {{ 'METRICS.ACTIVITY.LOG_ACTIVITY' | translate }}
                }
              </button>
            </form>
          }
        </div>

        <aside class="recent-recap" aria-live="polite">
          <h4>{{ 'METRICS.ACTIVITY.RECENT' | translate }}</h4>
          @if (recentActivities().length > 0) {
            <div class="activity-list">
              @for (activity of recentActivities(); track activity.id) {
                <div class="activity-item">
                  <span class="emoji" aria-hidden="true">
                    <svg lucideActivity [size]="18" [strokeWidth]="2"></svg>
                  </span>
                  <div class="details">
                    <span class="name">{{ activity.name }}</span>
                    <span class="meta">{{ activity.duration }}min · {{ activity.calories || 0 }}kcal</span>
                  </div>
                </div>
              }
            </div>
          } @else {
            <p class="empty-recap">{{ 'STATS.NO_ACTIVITY_YET' | translate }}</p>
          }
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .activity-card {
      background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
      border-radius: 1.5rem;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(255, 152, 0, 0.15);
    }

    :host-context(.dark) .activity-card {
      background: linear-gradient(135deg, #263238 0%, #1f2937 100%);
      box-shadow: 0 4px 20px rgba(255, 152, 0, 0.35);
      border: 1px solid rgba(255, 152, 0, 0.3);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .title-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .title-row .icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #e65100;
    }

    :host-context(.dark) .title-row .icon {
      color: #ffd180;
    }

    .title-row h3 {
      font-family: 'Satoshi', sans-serif;
      font-weight: 700;
      font-size: 1.125rem;
      color: #e65100;
      margin: 0;
    }

    :host-context(.dark) .title-row h3 {
      color: #ffd180;
    }

    .add-btn {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      border: none;
      background: #ff9800;
      color: white;
      font-size: 1.25rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .add-btn:hover {
      transform: scale(1.1);
    }

    .add-btn.active {
      background: #f44336;
    }

    .summary {
      display: flex;
      justify-content: space-around;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 1rem;
      margin-bottom: 1rem;
    }

    :host-context(.dark) .summary {
      background: rgba(31, 41, 55, 0.3);
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat .value {
      font-family: 'Satoshi', sans-serif;
      font-weight: 700;
      font-size: 1.5rem;
      color: #e65100;
    }

    :host-context(.dark) .stat .value {
      color: #ffb74d;
    }

    .stat .label {
      font-size: 0.75rem;
      color: #bf360c;
      text-transform: uppercase;
    }

    :host-context(.dark) .stat .label {
      color: #ffcc80;
    }

    .logger-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
      align-items: stretch;
    }

    .logger-main {
      min-width: 0;
    }

    @media (min-width: 1024px) {
      .logger-layout {
        grid-template-columns: 1fr;
      }
    }

    .quick-buttons {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .catalog-strip {
      display: flex;
      gap: 0.55rem;
      margin-bottom: 1rem;
      overflow-x: auto;
      padding-bottom: 0.25rem;
      scroll-snap-type: x proximity;
    }

    .catalog-strip-title {
      display: none;
    }

    .catalog-pill {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-width: 14rem;
      padding: 0.75rem 0.9rem;
      border: 0;
      border-radius: 1rem;
      background: rgba(255, 255, 255, 0.78);
      cursor: pointer;
      text-align: left;
      box-shadow: 0 2px 10px rgba(255, 152, 0, 0.08);
      scroll-snap-align: start;
    }

    :host-context(.dark) .catalog-pill {
      background: rgba(38, 50, 56, 0.9);
      color: #eceff1;
    }

    .catalog-pill .emoji {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      color: #e65100;
    }

    .catalog-pill .meta {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
      gap: 0.1rem;
    }

    .catalog-pill strong {
      font-size: 0.9rem;
      color: #37474f;
    }

    :host-context(.dark) .catalog-pill strong {
      color: #eceff1;
    }

    .catalog-pill small {
      color: #bf360c;
      font-size: 0.72rem;
    }

    :host-context(.dark) .catalog-pill small {
      color: #ffcc80;
    }

    .quick-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 0.75rem;
      background: white;
      border: 2px solid transparent;
      border-radius: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    :host-context(.dark) .quick-btn {
      background: #37474f;
    }

    .quick-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      border-color: #ff9800;
    }

    .quick-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .quick-btn .emoji {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #e65100;
    }

    .quick-btn .name {
      font-size: 0.75rem;
      font-weight: 600;
      color: #37474f;
    }

    :host-context(.dark) .quick-btn .name {
      color: #eceff1;
    }

    .log-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label,
    .form-group .form-label {
      font-family: 'Satoshi', sans-serif;
      font-weight: 600;
      font-size: 0.875rem;
      color: #e65100;
    }

    :host-context(.dark) .form-group label,
    :host-context(.dark) .form-group .form-label {
      color: #ffb74d;
    }

    .type-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
      gap: 0.65rem;
    }

    .catalog-results {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .catalog-count {
      margin: 0;
      font-size: 0.78rem;
      color: #8d6e63;
    }

    :host-context(.dark) .catalog-count {
      color: #cfd8dc;
    }

    .catalog-options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
      gap: 0.55rem;
      max-height: 16rem;
      overflow-y: auto;
      padding-right: 0.25rem;
    }

    .catalog-option {
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      padding: 0.7rem 0.8rem;
      border: 1px solid rgba(255, 152, 0, 0.2);
      border-radius: 0.9rem;
      background: rgba(255, 255, 255, 0.72);
      cursor: pointer;
      text-align: left;
      transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .catalog-option:hover {
      transform: translateY(-1px);
      border-color: rgba(255, 152, 0, 0.45);
      box-shadow: 0 4px 14px rgba(255, 152, 0, 0.14);
    }

    .catalog-option.selected {
      border-color: #ff9800;
      background: #fff3e0;
      box-shadow: 0 4px 14px rgba(255, 152, 0, 0.18);
    }

    :host-context(.dark) .catalog-option {
      background: rgba(38, 50, 56, 0.8);
      border-color: rgba(255, 183, 77, 0.25);
      color: #eceff1;
    }

    :host-context(.dark) .catalog-option.selected {
      background: rgba(255, 183, 77, 0.18);
      border-color: rgba(255, 183, 77, 0.55);
    }

    .catalog-option .meta {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
      line-height: 1.25;
    }

    .catalog-option .meta small {
      color: #8d6e63;
      font-size: 0.72rem;
    }

    :host-context(.dark) .catalog-option .meta small {
      color: #cfd8dc;
    }

    .catalog-empty {
      margin: 0;
      font-size: 0.82rem;
      color: #8d6e63;
      padding: 0.5rem 0;
    }

    :host-context(.dark) .catalog-empty {
      color: #cfd8dc;
    }

    .catalog-detail {
      padding: 0.85rem;
      border-radius: 1rem;
      background: rgba(255, 255, 255, 0.55);
      border: 1px solid rgba(255, 152, 0, 0.15);
    }

    :host-context(.dark) .catalog-detail {
      background: rgba(38, 50, 56, 0.7);
      border-color: rgba(255, 183, 77, 0.18);
    }

    .catalog-detail-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .catalog-detail-header .emoji {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #e65100;
    }

    .catalog-detail-header strong {
      display: block;
      color: #37474f;
    }

    :host-context(.dark) .catalog-detail-header strong {
      color: #eceff1;
    }

    .catalog-detail-header p,
    .catalog-detail-description {
      margin: 0;
      font-size: 0.85rem;
      color: #78909c;
    }

    .catalog-detail-description {
      margin-top: 0.5rem;
    }

    .type-btn {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      text-align: left;
      min-height: 3.2rem;
      padding: 0.6rem 0.7rem;
      background: white;
      border: 2px solid transparent;
      border-radius: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    :host-context(.dark) .type-btn {
      background: #455a64;
    }

    .type-btn.selected {
      border-color: #ff9800;
      background: #fff3e0;
    }

    :host-context(.dark) .type-btn.selected {
      background: #ff9800;
    }

    .type-btn .emoji {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #e65100;
      font-size: 1.1rem;
      width: 1.4rem;
      flex: 0 0 1.4rem;
    }

    .type-btn .text-wrap {
      display: flex;
      flex-direction: column;
      gap: 0.12rem;
      min-width: 0;
    }

    .type-btn .name {
      font-size: 0.78rem;
      font-weight: 700;
      line-height: 1.2;
      color: #37474f;
    }

    :host-context(.dark) .type-btn .name {
      color: #eceff1;
    }

    .type-btn .type-meta {
      color: #8d6e63;
      font-size: 0.67rem;
      font-weight: 600;
      line-height: 1;
    }

    :host-context(.dark) .type-btn .type-meta {
      color: #cfd8dc;
    }

    .field-hint {
      margin: 0;
      color: #8d6e63;
      font-size: 0.76rem;
      line-height: 1.35;
    }

    :host-context(.dark) .field-hint {
      color: #cfd8dc;
    }

    .form-group input[type="text"],
    .form-group input[type="number"],
    .form-group textarea {
      padding: 0.75rem;
      border: 2px solid rgba(0, 0, 0, 0.1);
      border-radius: 0.75rem;
      font-family: 'Satoshi', sans-serif;
      font-size: 1rem;
      background: white;
      color: #37474f;
    }

    .form-group input::placeholder,
    .form-group textarea::placeholder {
      color: #90a4ae;
    }

    :host-context(.dark) .form-group input {
      background: #455a64;
      border-color: rgba(255, 255, 255, 0.1);
      color: #eceff1;
    }

    :host-context(.dark) .form-group textarea {
      background: #455a64;
      border-color: rgba(255, 255, 255, 0.1);
      color: #eceff1;
    }

    .form-group textarea {
      resize: vertical;
      min-height: 5rem;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
      gap: 0.75rem;
    }

    .details-notes {
      grid-column: 1 / -1;
    }

    .duration-presets {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .timer-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin: 0.25rem 0;
    }

    .timer-btn {
      padding: 0.5rem 0.8rem;
      background: #fff3e0;
      border: 1px solid rgba(255, 152, 0, 0.3);
      border-radius: 999px;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 700;
      color: #5d4037;
    }

    .timer-btn.secondary {
      background: rgba(255, 255, 255, 0.7);
    }

    :host-context(.dark) .timer-btn {
      background: rgba(255, 152, 0, 0.18);
      color: #eceff1;
    }

    .timer-display {
      font-family: 'Satoshi', sans-serif;
      font-weight: 700;
      color: #e65100;
    }

    :host-context(.dark) .timer-display {
      color: #ffcc80;
    }

    .preset-btn {
      padding: 0.5rem 1rem;
      background: white;
      border: 2px solid transparent;
      border-radius: 2rem;
      font-size: 0.875rem;
      font-weight: 700;
      color: #5d4037;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    :host-context(.dark) .preset-btn {
      background: #455a64;
      color: #eceff1;
    }

    .preset-btn.selected {
      border-color: #ff9800;
      background: #fff3e0;
    }

    :host-context(.dark) .preset-btn.selected {
      background: #ff9800;
      color: white;
    }

    .intensity-slider {
      display: flex;
      gap: 0.5rem;
    }

    .intensity-btn {
      flex: 1;
      padding: 0.5rem;
      background: white;
      border: 2px solid transparent;
      border-radius: 0.5rem;
      font-size: 0.75rem;
      font-weight: 700;
      color: #5d4037;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    :host-context(.dark) .intensity-btn {
      background: #455a64;
      color: #eceff1;
    }

    .intensity-btn.selected {
      border-color: #ff9800;
      background: #fff3e0;
    }

    :host-context(.dark) .intensity-btn.selected {
      background: #ff9800;
      color: white;
    }

    .calories-estimate {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 0.75rem;
    }

    :host-context(.dark) .calories-estimate {
      background: rgba(0, 0, 0, 0.2);
    }

    .calories-estimate .value {
      font-weight: 700;
      color: #e65100;
    }

    :host-context(.dark) .calories-estimate .value {
      color: #ffb74d;
    }

    .submit-btn {
      padding: 1rem;
      background: linear-gradient(135deg, #ff9800, #f57c00);
      color: white;
      border: none;
      border-radius: 1rem;
      font-family: 'Satoshi', sans-serif;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
    }

    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .recent-recap {
      margin-top: 0;
      padding: 1rem;
      border-radius: 1rem;
      background: rgba(255, 255, 255, 0.56);
      border: 1px solid rgba(255, 152, 0, 0.18);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    @media (min-width: 1024px) {
      .recent-recap {
        height: 100%;
      }
    }

    :host-context(.dark) .recent-recap {
      background: rgba(0, 0, 0, 0.2);
      border-color: rgba(255, 183, 77, 0.24);
    }

    .recent-recap h4 {
      font-family: 'Satoshi', sans-serif;
      font-size: 0.875rem;
      color: #e65100;
      margin: 0;
    }

    :host-context(.dark) .recent-recap h4 {
      color: #ffb74d;
    }

    .empty-recap {
      margin: 0;
      font-size: 0.85rem;
      color: #78909c;
      line-height: 1.4;
    }

    :host-context(.dark) .empty-recap {
      color: #b0bec5;
    }

    .spinner {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255, 255, 255, 0.45);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 0.75rem;
    }

    :host-context(.dark) .activity-item {
      background: rgba(0, 0, 0, 0.2);
    }

    .activity-item .emoji {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #e65100;
    }

    .activity-item .details {
      display: flex;
      flex-direction: column;
    }

    .activity-item .name {
      font-weight: 600;
      font-size: 0.875rem;
      color: #37474f;
    }

    :host-context(.dark) .activity-item .name {
      color: #eceff1;
    }

    .activity-item .meta {
      font-size: 0.75rem;
      color: #78909c;
    }

    @media (prefers-reduced-motion: reduce) {
      .add-btn,
      .quick-btn,
      .type-btn,
      .preset-btn,
      .intensity-btn,
      .submit-btn {
        transition: none;
      }
      .spinner {
        animation: none;
      }
    }
  `],
})
export class ActivityLoggerComponent implements OnDestroy {
  private readonly metricsService = inject(MetricsService);
  private readonly profileService = inject(ProfileService);
  private readonly rewardsService = inject(RewardsService);
  private readonly translate = inject(TranslateService);

  // Form state
  readonly showForm = signal(false);
  readonly logging = signal(false);
  readonly selectedType = signal<ActivityType>('WALK');
  readonly activityName = signal('');
  readonly duration = signal(30);
  readonly intensity = signal<Intensity>('MODERATE');
  readonly timerRunning = signal(false);
  readonly elapsedSeconds = signal(30 * 60);
  readonly selectedActivitySearch = signal<string[]>([]);
  readonly location = signal('');
  readonly distanceKm = signal<number | null>(null);
  readonly heartRateAvg = signal<number | null>(null);
  readonly sessionNotes = signal('');

  // Data
  readonly activityMinutes = this.metricsService.activityMinutesToday;
  readonly activityCalories = this.metricsService.activityCaloriesToday;
  readonly activitiesCount = computed(() => this.metricsService.activityToday()?.activitiesCount ?? 0);
  readonly activityCatalog = this.metricsService.activityCatalog;

  readonly recentActivities = computed(() => {
    const today = this.metricsService.activityToday();
    return today?.logs?.slice(0, 3) ?? [];
  });

  readonly selectedCatalogActivity = computed(() => {
    const selectedName = this.selectedActivitySearch()[0];
    if (!selectedName) return null;
    return this.activityCatalog().find((activity) => activity.name === selectedName) ?? null;
  });

  readonly resolvedCatalogActivity = computed(() => this.selectedCatalogActivity() ?? this.bestCatalogMatch());

  readonly activitySuggestions = computed(() =>
    this.activityCatalog()
      .map((activity) => activity.name)
      .sort((a, b) => a.localeCompare(b)),
  );

  readonly topCatalogActivities = computed(() =>
    [...this.activityCatalog()]
      .sort((a, b) => b.metValue - a.metValue)
      .slice(0, 6),
  );

  readonly bestCatalogMatch = computed(() => {
    const matches = this.activityCatalog().filter((activity) => activity.category === this.selectedType());
    const sortedMatches = [...matches].sort((a, b) => b.metValue - a.metValue);
    return sortedMatches[0] ?? null;
  });

  readonly catalogActivitiesForSelectedType = computed(() => {
    const matches = this.activityCatalog().filter((activity) => activity.category === this.selectedType());
    const pool = matches.length > 0 ? matches : this.activityCatalog();
    return [...pool]
      .sort((a, b) => b.metValue - a.metValue || a.name.localeCompare(b.name))
      .slice(0, 24);
  });

  readonly quickActivities = [
    ACTIVITY_PRESETS.WALK,
    ACTIVITY_PRESETS.RUN,
    ACTIVITY_PRESETS.STRENGTH,
  ].map((preset, i) => ({
    type: ['WALK', 'RUN', 'STRENGTH'][i] as ActivityType,
    ...preset,
  }));

  readonly allActivities = Object.entries(ACTIVITY_PRESETS).map(([key, value]) => ({
    type: key as ActivityType,
    ...value,
  }));

  readonly activityCountsByType = computed(() => {
    const counts = Object.keys(ACTIVITY_PRESETS).reduce((acc, key) => {
      acc[key as ActivityType] = 0;
      return acc;
    }, {} as Record<ActivityType, number>);

    for (const activity of this.activityCatalog()) {
      counts[activity.category] = (counts[activity.category] ?? 0) + 1;
    }

    return counts;
  });

  readonly intensityLevels = Object.entries(INTENSITY_LABELS).map(([key, value]) => ({
    key: key as Intensity,
    ...value,
  }));

  readonly durationPresets = [15, 30, 45, 60, 90];

  readonly estimatedCalories = computed(() => {
    const catalogMatch = this.resolvedCatalogActivity();
    const preset = ACTIVITY_PRESETS[this.selectedType()];
    const intensityMultiplier = INTENSITY_LABELS[this.intensity()].multiplier;
    const caloriesPerMin = catalogMatch ? (catalogMatch.metValue * 70) / 60 : preset.caloriesPerMin;
    return Math.round(this.duration() * caloriesPerMin * intensityMultiplier);
  });

  readonly canSubmit = computed(() => {
    return this.selectedType() && this.duration() > 0;
  });

  constructor() {
    afterNextRender(() => {
      void Promise.all([
        this.metricsService.loadActivityToday(),
        this.metricsService.loadActivityCatalog(),
        this.profileService.loadProfile(),
      ]).then(() => this.applyRememberedWorkout());
    });
    this.syncTimerFromDuration();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  onActivitySearchChange(items: string[]): void {
    this.selectedActivitySearch.set(items);
    const selectedName = items[0];
    if (!selectedName) return;

    const catalogItem = this.activityCatalog().find((activity) => activity.name === selectedName);
    if (!catalogItem) return;

    this.selectedType.set(catalogItem.category);
    this.activityName.set(catalogItem.name);
  }

  onActivityTypeChange(type: ActivityType): void {
    this.selectedType.set(type);
    this.selectedActivitySearch.set([]);
  }

  formatActivityTypeLabel(type: ActivityType, fallback?: string): string {
    if (fallback && fallback.trim().length > 0) {
      return fallback;
    }

    return type
      .split('_')
      .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
      .join(' ');
  }

  selectCatalogActivity(activityKey: string): void {
    const catalogItem = this.activityCatalog().find((activity) => activity.key === activityKey);
    if (!catalogItem) return;

    this.selectedType.set(catalogItem.category);
    this.activityName.set(catalogItem.name);
    this.selectedActivitySearch.set([catalogItem.name]);
  }

  private bestCatalogActivityForType(type: ActivityType) {
    const matches = this.activityCatalog().filter((activity) => activity.category === type);
    const sortedMatches = [...matches].sort((a, b) => b.metValue - a.metValue);
    return sortedMatches[0] ?? null;
  }

  private applyRememberedWorkout(): void {
    const rememberedKey = this.profileService.profile()?.preferredActivityKey;
    if (!rememberedKey) return;

    const catalogItem = this.activityCatalog().find((activity) => activity.key === rememberedKey);
    if (!catalogItem) return;

    this.selectedType.set(catalogItem.category);
    this.activityName.set(catalogItem.name);
    this.selectedActivitySearch.set([catalogItem.name]);
  }

  timerDisplay(): string {
    const totalSeconds = this.elapsedSeconds();
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  setDuration(value: number | string): void {
    const parsed = Number(value);
    const nextDuration = Number.isFinite(parsed) ? Math.max(1, Math.min(480, Math.round(parsed))) : 1;
    this.duration.set(nextDuration);
    if (!this.timerRunning()) {
      this.syncTimerFromDuration();
    }
  }

  onDistanceChange(value: NumericInput): void {
    this.distanceKm.set(this.parseOptionalNumber(value));
  }

  onHeartRateChange(value: NumericInput): void {
    const parsed = this.parseOptionalNumber(value);
    this.heartRateAvg.set(parsed === null ? null : Math.round(parsed));
  }

  toggleTimer(): void {
    if (this.timerRunning()) {
      this.stopTimer();
      return;
    }

    this.timerRunning.set(true);
    this.syncTimerFromDuration();

    const startedAt = Date.now() - this.elapsedSeconds() * 1000;
    const tick = () => {
      const nextSeconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
      this.elapsedSeconds.set(nextSeconds);
      this.duration.set(Math.max(1, Math.round(nextSeconds / 60)));
    };

    tick();
    const handle = setInterval(tick, 1000);
    this.timerHandle = handle;
  }

  resetTimer(): void {
    this.stopTimer();
    this.setDuration(30);
  }

  private stopTimer(): void {
    this.timerRunning.set(false);
    if (this.timerHandle) {
      clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
  }

  private syncTimerFromDuration(): void {
    this.elapsedSeconds.set(this.duration() * 60);
  }

  async quickLog(type: ActivityType): Promise<void> {
    this.logging.set(true);
    const preset = ACTIVITY_PRESETS[type];
    const catalogActivity = this.selectedCatalogActivity()?.category === type
      ? this.selectedCatalogActivity()
      : this.bestCatalogActivityForType(type);
    const preferredKey = catalogActivity?.key ?? null;
    
    const result = await this.metricsService.logActivity({
      type,
      name: `Quick ${preset.label}`,
      duration: 30,
      intensity: 'MODERATE',
      activityCatalogKey: preferredKey ?? undefined,
    });

    if (result.success && result.carrots) {
      this.rewardsService.awardCarrots(
        result.carrots,
        this.translate.instant('METRICS.ACTIVITY.REWARD_MSG'),
        'activity'
      );
    }

    if (preferredKey) {
      await this.profileService.updatePreferredWorkout(preferredKey);
    }

    this.logging.set(false);
  }

  async submitForm(): Promise<void> {
    if (!this.canSubmit()) return;

    this.logging.set(true);
    const preferredKey = this.resolvedCatalogActivity()?.key ?? null;

    const result = await this.metricsService.logActivity({
      type: this.selectedType(),
      name: this.activityName() || `${ACTIVITY_PRESETS[this.selectedType()].label} Session`,
      duration: this.duration(),
      intensity: this.intensity(),
      calories: this.estimatedCalories(),
      distance: this.distanceKm() ?? undefined,
      heartRateAvg: this.heartRateAvg() ?? undefined,
      notes: this.buildCombinedNotes(),
      activityCatalogKey: preferredKey ?? undefined,
    });

    if (result.success && result.carrots) {
      this.rewardsService.awardCarrots(
        result.carrots,
        this.translate.instant('METRICS.ACTIVITY.REWARD_MSG'),
        'activity'
      );
    }

    if (preferredKey) {
      await this.profileService.updatePreferredWorkout(preferredKey);
    }

    // Reset form
    this.activityName.set('');
    this.duration.set(30);
    this.intensity.set('MODERATE');
    this.elapsedSeconds.set(30 * 60);
    this.selectedActivitySearch.set([]);
    this.location.set('');
    this.distanceKm.set(null);
    this.heartRateAvg.set(null);
    this.sessionNotes.set('');
    this.showForm.set(false);
    this.logging.set(false);
  }

  private parseOptionalNumber(value: NumericInput): number | null {
    if (value === null || value === '' || value === undefined) {
      return null;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return null;
    }

    return parsed;
  }

  private buildCombinedNotes(): string | undefined {
    const location = this.location().trim();
    const notes = this.sessionNotes().trim();
    const segments: string[] = [];

    if (location) {
      segments.push(`Location: ${location}`);
    }

    if (notes) {
      segments.push(notes);
    }

    return segments.length > 0 ? segments.join('\n') : undefined;
  }

  private timerHandle: ReturnType<typeof setInterval> | null = null;
}
