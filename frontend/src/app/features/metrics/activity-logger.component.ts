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

@Component({
  selector: 'app-activity-logger',
  imports: [CommonModule, FormsModule, TranslateModule, AutocompleteComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="activity-card">
      <!-- Header -->
      <div class="header">
        <div class="title-row">
          <span class="icon">🏃</span>
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

      @if (topCatalogActivities().length > 0) {
        <div class="catalog-strip">
          @for (activity of topCatalogActivities(); track activity.key) {
            <button class="catalog-pill" type="button" (click)="selectCatalogActivity(activity.key)">
              <span class="emoji">{{ activity.emoji }}</span>
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
                  <span class="emoji">{{ activity.emoji }}</span>
                  <span class="name">{{ activity.label }}</span>
                </button>
              }
            </div>
          </div>

          <!-- Activity Catalog Search -->
          <div class="form-group">
            <div class="form-label">Search the activity catalog</div>
            <app-autocomplete
              [suggestions]="activitySuggestions()"
              [selectedItems]="selectedActivitySearch()"
              [placeholder]="'Search activities by name'"
              [allowCustom]="false"
              [multiple]="false"
              (itemsChange)="onActivitySearchChange($event)"
            />
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
                  (click)="duration.set(preset)"
                >
                  {{ preset }}min
                </button>
              }
            </div>
            <div class="timer-row">
              <button type="button" class="timer-btn" (click)="toggleTimer()">
                {{ timerRunning() ? '⏸ Stop timer' : '⏱ Start timer' }}
              </button>
              <button type="button" class="timer-btn secondary" (click)="resetTimer()">
                ↺ Reset
              </button>
              <span class="timer-display">{{ timerDisplay() }}</span>
            </div>
            <input
              type="number"
              id="durationInput"
              [ngModel]="duration()"
              (ngModelChange)="duration.set($event)"
              min="1"
              max="480"
              placeholder="Custom"
              aria-labelledby="durationLabel"
            />
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
              <span class="spinner">⏳</span>
            } @else {
              {{ 'METRICS.ACTIVITY.LOG_ACTIVITY' | translate }}
            }
          </button>
        </form>
      }

      <!-- Recent Activities -->
      @if (recentActivities().length > 0 && !showForm()) {
        <div class="recent">
          <h4>{{ 'METRICS.ACTIVITY.RECENT' | translate }}</h4>
          <div class="activity-list">
            @for (activity of recentActivities(); track activity.id) {
              <div class="activity-item">
                <span class="emoji">{{ getActivityEmoji(activity.type) }}</span>
                <div class="details">
                  <span class="name">{{ activity.name }}</span>
                  <span class="meta">{{ activity.duration }}min · {{ activity.calories || 0 }}kcal</span>
                </div>
              </div>
            }
          </div>
        </div>
      }
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
      font-size: 1.5rem;
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

    .quick-buttons {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .catalog-strip {
      display: grid;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .catalog-pill {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 0.9rem;
      border: 0;
      border-radius: 1rem;
      background: rgba(255, 255, 255, 0.78);
      cursor: pointer;
      text-align: left;
      box-shadow: 0 2px 10px rgba(255, 152, 0, 0.08);
    }

    :host-context(.dark) .catalog-pill {
      background: rgba(38, 50, 56, 0.9);
      color: #eceff1;
    }

    .catalog-pill .emoji {
      font-size: 1.3rem;
      flex: 0 0 auto;
    }

    .catalog-pill .meta {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
      gap: 0.1rem;
    }

    .catalog-pill strong {
      font-size: 0.9rem;
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
      font-size: 1.5rem;
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
      grid-template-columns: repeat(5, 1fr);
      gap: 0.5rem;
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
      font-size: 1.6rem;
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
      flex-direction: column;
      align-items: center;
      padding: 0.5rem;
      background: white;
      border: 2px solid transparent;
      border-radius: 0.75rem;
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
      font-size: 1.25rem;
    }

    .type-btn .name {
      font-size: 0.625rem;
      color: #37474f;
    }

    :host-context(.dark) .type-btn .name {
      color: #eceff1;
    }

    .form-group input[type="text"],
    .form-group input[type="number"] {
      padding: 0.75rem;
      border: 2px solid rgba(0, 0, 0, 0.1);
      border-radius: 0.75rem;
      font-family: 'Satoshi', sans-serif;
      font-size: 1rem;
      background: white;
    }

    :host-context(.dark) .form-group input {
      background: #455a64;
      border-color: rgba(255, 255, 255, 0.1);
      color: #eceff1;
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

    .spinner {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .recent {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.5);
    }

    .recent h4 {
      font-family: 'Satoshi', sans-serif;
      font-size: 0.875rem;
      color: #e65100;
      margin: 0 0 0.75rem;
    }

    :host-context(.dark) .recent h4 {
      color: #ffb74d;
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
      font-size: 1.25rem;
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

  getActivityEmoji(type: string): string {
    return ACTIVITY_PRESETS[type as ActivityType]?.emoji ?? '🎯';
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
    this.duration.set(30);
    this.elapsedSeconds.set(30 * 60);
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
    this.showForm.set(false);
    this.logging.set(false);
  }

  private timerHandle: ReturnType<typeof setInterval> | null = null;
}
