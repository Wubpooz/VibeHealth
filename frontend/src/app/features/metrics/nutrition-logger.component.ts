import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  afterNextRender,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MetricsService } from '../../core/metrics/metrics.service';
import { RewardsService } from '../../core/rewards/rewards.service';
import {
  MEAL_TYPE_INFO,
  DAILY_GOALS,
  type MealType,
} from '../../core/metrics/metrics.types';

@Component({
  selector: 'app-nutrition-logger',
  imports: [CommonModule, FormsModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="nutrition-card">
      <!-- Header -->
      <div class="header">
        <div class="title-row">
          <span class="icon">🥗</span>
          <h3>{{ 'METRICS.NUTRITION.TITLE' | translate }}</h3>
        </div>
        <button 
          class="add-btn"
          (click)="showForm.set(!showForm())"
          [class.active]="showForm()"
        >
          {{ showForm() ? '✕' : '+' }}
        </button>
      </div>

      <!-- Calories Progress -->
      <div class="calories-progress">
        <div class="progress-header">
          <span class="current">{{ caloriesToday() }}</span>
          <span class="separator">/</span>
          <span class="goal">{{ caloriesGoal }} kcal</span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill"
            [style.width.%]="caloriesPercentage()"
            [class.over]="caloriesPercentage() > 100"
          ></div>
        </div>
      </div>

      <!-- Macro Summary -->
      <div class="macros">
        <div class="macro protein">
          <span class="emoji">🥩</span>
          <span class="value">{{ proteinToday() }}g</span>
          <span class="label">{{ 'METRICS.NUTRITION.PROTEIN' | translate }}</span>
        </div>
        <div class="macro carbs">
          <span class="emoji">🍞</span>
          <span class="value">{{ carbsToday() }}g</span>
          <span class="label">{{ 'METRICS.NUTRITION.CARBS' | translate }}</span>
        </div>
        <div class="macro fat">
          <span class="emoji">🥑</span>
          <span class="value">{{ fatToday() }}g</span>
          <span class="label">{{ 'METRICS.NUTRITION.FAT' | translate }}</span>
        </div>
      </div>

      <!-- Quick Meal Buttons -->
      @if (!showForm()) {
        <div class="quick-meals">
          @for (meal of mealTypes; track meal.type) {
            <button
              class="meal-btn"
              (click)="selectMealType(meal.type)"
              [class.logged]="isMealLogged(meal.type)"
            >
              <span class="emoji">{{ meal.emoji }}</span>
              <span class="name">{{ meal.label }}</span>
              @if (isMealLogged(meal.type)) {
                <span class="check">✓</span>
              }
            </button>
          }
        </div>
      }

      <!-- Log Form -->
      @if (showForm()) {
        <form class="log-form" (ngSubmit)="submitForm()">
          <!-- Meal Type -->
          <div class="form-group">
            <div class="form-label" id="mealTypeLabel">{{ 'METRICS.NUTRITION.MEAL_TYPE' | translate }}</div>
            <div class="meal-type-selector" role="group" aria-labelledby="mealTypeLabel">
              @for (meal of mealTypes; track meal.type) {
                <button
                  type="button"
                  class="type-btn"
                  [class.selected]="selectedMealType() === meal.type"
                  (click)="selectedMealType.set(meal.type)"
                >
                  <span class="emoji">{{ meal.emoji }}</span>
                  <span class="name">{{ meal.label }}</span>
                </button>
              }
            </div>
          </div>

          <!-- Meal Name -->
          <div class="form-group">
            <label for="mealName">{{ 'METRICS.NUTRITION.MEAL_NAME' | translate }}</label>
            <input
              type="text"
              id="mealName"
              [ngModel]="mealName()"
              (ngModelChange)="mealName.set($event)"
              [placeholder]="'METRICS.NUTRITION.MEAL_NAME_PLACEHOLDER' | translate"
              required
            />
          </div>

          <!-- Calories -->
          <div class="form-group">
            <label for="calories">{{ 'METRICS.NUTRITION.CALORIES' | translate }}</label>
            <div class="input-with-unit">
              <input
                type="number"
                id="calories"
                [ngModel]="calories()"
                (ngModelChange)="calories.set($event)"
                min="0"
                max="5000"
                placeholder="0"
              />
              <span class="unit">kcal</span>
            </div>
          </div>

          <!-- Macros Toggle -->
          <button 
            type="button" 
            class="toggle-macros"
            (click)="showMacros.set(!showMacros())"
          >
            {{ showMacros() ? '▼' : '▶' }} {{ 'METRICS.NUTRITION.ADD_MACROS' | translate }}
          </button>

          <!-- Macro Inputs -->
          @if (showMacros()) {
            <div class="macro-inputs">
              <div class="macro-input">
                <label for="proteinInput">{{ 'METRICS.NUTRITION.PROTEIN' | translate }}</label>
                <div class="input-with-unit">
                  <input
                    type="number"
                    id="proteinInput"
                    [ngModel]="protein()"
                    (ngModelChange)="protein.set($event)"
                    min="0"
                    max="200"
                    placeholder="0"
                  />
                  <span class="unit">g</span>
                </div>
              </div>
              <div class="macro-input">
                <label for="carbsInput">{{ 'METRICS.NUTRITION.CARBS' | translate }}</label>
                <div class="input-with-unit">
                  <input
                    type="number"
                    id="carbsInput"
                    [ngModel]="carbs()"
                    (ngModelChange)="carbs.set($event)"
                    min="0"
                    max="500"
                    placeholder="0"
                  />
                  <span class="unit">g</span>
                </div>
              </div>
              <div class="macro-input">
                <label for="fatInput">{{ 'METRICS.NUTRITION.FAT' | translate }}</label>
                <div class="input-with-unit">
                  <input
                    type="number"
                    id="fatInput"
                    [ngModel]="fat()"
                    (ngModelChange)="fat.set($event)"
                    min="0"
                    max="200"
                    placeholder="0"
                  />
                  <span class="unit">g</span>
                </div>
              </div>
            </div>
          }

          <!-- Submit -->
          <button
            type="submit"
            class="submit-btn"
            [disabled]="!canSubmit() || logging()"
          >
            @if (logging()) {
              <span class="spinner">⏳</span>
            } @else {
              {{ 'METRICS.NUTRITION.LOG_MEAL' | translate }}
            }
          </button>
        </form>
      }

      <!-- Recent Meals -->
      @if (recentMeals().length > 0 && !showForm()) {
        <div class="recent">
          <h4>{{ 'METRICS.NUTRITION.TODAY_MEALS' | translate }}</h4>
          <div class="meal-list">
            @for (meal of recentMeals(); track meal.id) {
              <div class="meal-item">
                <span class="emoji">{{ getMealEmoji(meal.mealType) }}</span>
                <div class="details">
                  <span class="name">{{ meal.name }}</span>
                  <span class="meta">{{ meal.calories || 0 }} kcal</span>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .nutrition-card {
      background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
      border-radius: 1.5rem;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(76, 175, 80, 0.15);
    }

    :host-context([data-theme="dark"]) .nutrition-card {
      background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%);
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
      color: #2e7d32;
      margin: 0;
    }

    :host-context([data-theme="dark"]) .title-row h3 {
      color: #a5d6a7;
    }

    .add-btn {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      border: none;
      background: #4caf50;
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

    .calories-progress {
      margin-bottom: 1rem;
    }

    .progress-header {
      display: flex;
      align-items: baseline;
      gap: 0.25rem;
      margin-bottom: 0.5rem;
    }

    .progress-header .current {
      font-family: 'Satoshi', sans-serif;
      font-weight: 700;
      font-size: 1.75rem;
      color: #2e7d32;
    }

    :host-context([data-theme="dark"]) .progress-header .current {
      color: #a5d6a7;
    }

    .progress-header .separator {
      color: #66bb6a;
    }

    .progress-header .goal {
      font-size: 1rem;
      color: #66bb6a;
    }

    .progress-bar {
      height: 0.75rem;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 1rem;
      overflow: hidden;
    }

    :host-context([data-theme="dark"]) .progress-bar {
      background: rgba(0, 0, 0, 0.3);
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #66bb6a, #4caf50);
      border-radius: 1rem;
      transition: width 0.5s ease;
    }

    .progress-fill.over {
      background: linear-gradient(90deg, #ff9800, #f44336);
    }

    .macros {
      display: flex;
      justify-content: space-around;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 1rem;
      margin-bottom: 1rem;
    }

    :host-context([data-theme="dark"]) .macros {
      background: rgba(0, 0, 0, 0.2);
    }

    .macro {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }

    .macro .emoji {
      font-size: 1.25rem;
    }

    .macro .value {
      font-family: 'Satoshi', sans-serif;
      font-weight: 700;
      font-size: 1.125rem;
      color: #2e7d32;
    }

    :host-context([data-theme="dark"]) .macro .value {
      color: #a5d6a7;
    }

    .macro .label {
      font-size: 0.625rem;
      color: #558b2f;
      text-transform: uppercase;
    }

    :host-context([data-theme="dark"]) .macro .label {
      color: #c5e1a5;
    }

    .quick-meals {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .meal-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 0.75rem 0.5rem;
      background: white;
      border: 2px solid transparent;
      border-radius: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    :host-context([data-theme="dark"]) .meal-btn {
      background: #2e7d32;
    }

    .meal-btn:hover {
      transform: translateY(-2px);
      border-color: #4caf50;
    }

    .meal-btn.logged {
      border-color: #4caf50;
      background: #e8f5e9;
    }

    :host-context([data-theme="dark"]) .meal-btn.logged {
      background: #4caf50;
    }

    .meal-btn .emoji {
      font-size: 1.5rem;
    }

    .meal-btn .name {
      font-size: 0.625rem;
      font-weight: 600;
      color: #37474f;
    }

    :host-context([data-theme="dark"]) .meal-btn .name {
      color: #c8e6c9;
    }

    .meal-btn .check {
      position: absolute;
      top: 0.25rem;
      right: 0.25rem;
      font-size: 0.75rem;
      color: #4caf50;
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
      color: #2e7d32;
    }

    :host-context([data-theme="dark"]) .form-group label,
    :host-context([data-theme="dark"]) .form-group .form-label {
      color: #a5d6a7;
    }

    .meal-type-selector {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.5rem;
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

    :host-context([data-theme="dark"]) .type-btn {
      background: #388e3c;
    }

    .type-btn.selected {
      border-color: #4caf50;
      background: #e8f5e9;
    }

    :host-context([data-theme="dark"]) .type-btn.selected {
      background: #4caf50;
    }

    .type-btn .emoji {
      font-size: 1.25rem;
    }

    .type-btn .name {
      font-size: 0.625rem;
      color: #37474f;
    }

    :host-context([data-theme="dark"]) .type-btn .name {
      color: #c8e6c9;
    }

    .form-group input[type="text"],
    .form-group input[type="number"],
    .input-with-unit input {
      padding: 0.75rem;
      border: 2px solid rgba(0, 0, 0, 0.1);
      border-radius: 0.75rem;
      font-family: 'Satoshi', sans-serif;
      font-size: 1rem;
      background: white;
      width: 100%;
      box-sizing: border-box;
    }

    :host-context([data-theme="dark"]) .form-group input,
    :host-context([data-theme="dark"]) .input-with-unit input {
      background: #388e3c;
      border-color: rgba(255, 255, 255, 0.1);
      color: #e8f5e9;
    }

    .input-with-unit {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .input-with-unit .unit {
      font-size: 0.875rem;
      color: #558b2f;
      white-space: nowrap;
    }

    :host-context([data-theme="dark"]) .input-with-unit .unit {
      color: #c5e1a5;
    }

    .toggle-macros {
      background: none;
      border: none;
      color: #4caf50;
      font-family: 'Satoshi', sans-serif;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      text-align: left;
      padding: 0.5rem 0;
    }

    .toggle-macros:hover {
      color: #2e7d32;
    }

    .macro-inputs {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
    }

    .macro-input {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .macro-input label {
      font-size: 0.75rem;
      color: #558b2f;
    }

    :host-context([data-theme="dark"]) .macro-input label {
      color: #c5e1a5;
    }

    .macro-input input {
      padding: 0.5rem !important;
      font-size: 0.875rem !important;
    }

    .submit-btn {
      padding: 1rem;
      background: linear-gradient(135deg, #4caf50, #388e3c);
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
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
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
      color: #2e7d32;
      margin: 0 0 0.75rem;
    }

    :host-context([data-theme="dark"]) .recent h4 {
      color: #a5d6a7;
    }

    .meal-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .meal-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 0.75rem;
    }

    :host-context([data-theme="dark"]) .meal-item {
      background: rgba(0, 0, 0, 0.2);
    }

    .meal-item .emoji {
      font-size: 1.25rem;
    }

    .meal-item .details {
      display: flex;
      flex-direction: column;
    }

    .meal-item .name {
      font-weight: 600;
      font-size: 0.875rem;
      color: #37474f;
    }

    :host-context([data-theme="dark"]) .meal-item .name {
      color: #c8e6c9;
    }

    .meal-item .meta {
      font-size: 0.75rem;
      color: #78909c;
    }

    @media (prefers-reduced-motion: reduce) {
      .add-btn,
      .meal-btn,
      .type-btn,
      .submit-btn,
      .progress-fill {
        transition: none;
      }
      .spinner {
        animation: none;
      }
    }
  `],
})
export class NutritionLoggerComponent {
  private readonly metricsService = inject(MetricsService);
  private readonly rewardsService = inject(RewardsService);
  private readonly translate = inject(TranslateService);

  // Form state
  readonly showForm = signal(false);
  readonly showMacros = signal(false);
  readonly logging = signal(false);
  readonly selectedMealType = signal<MealType>('LUNCH');
  readonly mealName = signal('');
  readonly calories = signal<number | null>(null);
  readonly protein = signal<number | null>(null);
  readonly carbs = signal<number | null>(null);
  readonly fat = signal<number | null>(null);

  // Data
  readonly caloriesToday = this.metricsService.caloriesToday;
  readonly proteinToday = computed(() => Math.round(this.metricsService.proteinToday()));
  readonly carbsToday = computed(() => Math.round(this.metricsService.carbsToday()));
  readonly fatToday = computed(() => Math.round(this.metricsService.fatToday()));
  readonly caloriesGoal = DAILY_GOALS.calories;

  readonly caloriesPercentage = computed(() => {
    return Math.min(120, Math.round((this.caloriesToday() / this.caloriesGoal) * 100));
  });

  readonly recentMeals = computed(() => {
    const today = this.metricsService.nutritionToday();
    return today?.logs?.slice(0, 4) ?? [];
  });

  readonly loggedMealTypes = computed(() => {
    const today = this.metricsService.nutritionToday();
    return today?.byMealType ? Object.keys(today.byMealType) : [];
  });

  readonly mealTypes = Object.entries(MEAL_TYPE_INFO).map(([key, value]) => ({
    type: key as MealType,
    ...value,
  }));

  readonly canSubmit = computed(() => {
    return this.selectedMealType() && this.mealName().trim().length > 0;
  });

  constructor() {
    afterNextRender(() => {
      this.metricsService.loadNutritionToday();
    });
  }

  getMealEmoji(type: string): string {
    return MEAL_TYPE_INFO[type as MealType]?.emoji ?? '🍽️';
  }

  isMealLogged(type: MealType): boolean {
    return this.loggedMealTypes().includes(type);
  }

  selectMealType(type: MealType): void {
    this.selectedMealType.set(type);
    this.showForm.set(true);
  }

  async submitForm(): Promise<void> {
    if (!this.canSubmit()) return;

    this.logging.set(true);

    const result = await this.metricsService.logMeal({
      mealType: this.selectedMealType(),
      name: this.mealName(),
      calories: this.calories() ?? undefined,
      protein: this.protein() ?? undefined,
      carbs: this.carbs() ?? undefined,
      fat: this.fat() ?? undefined,
    });

    if (result.success && result.carrots) {
      this.rewardsService.awardCarrots(
        result.carrots,
        this.translate.instant('METRICS.NUTRITION.REWARD_MSG'),
        'nutrition'
      );
    }

    // Reset form
    this.mealName.set('');
    this.calories.set(null);
    this.protein.set(null);
    this.carbs.set(null);
    this.fat.set(null);
    this.showForm.set(false);
    this.showMacros.set(false);
    this.logging.set(false);
  }
}
