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
import { BarcodeScannerComponent, type ScannedFood } from '../../shared/components/barcode-scanner/barcode-scanner.component';
import { AutocompleteComponent } from '../../shared/components/autocomplete/autocomplete.component';
import {
  MEAL_TYPE_INFO,
  DAILY_GOALS,
  type MealType,
} from '../../core/metrics/metrics.types';
import { LucideLeaf, LucidePlus, LucideX } from '@lucide/angular';

type NumericInput = number | string | null;
type OptionalNumericInput = NumericInput | undefined;

@Component({
  selector: 'app-nutrition-logger',
  imports: [CommonModule, FormsModule, TranslateModule, BarcodeScannerComponent, AutocompleteComponent, LucideLeaf, LucidePlus, LucideX],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="nutrition-card">
      <!-- Header -->
      <div class="card-header">
        <div class="header-content">
          <div class="title-row">
            <span class="icon" aria-hidden="true">
              <svg lucideLeaf [size]="24" [strokeWidth]="2"></svg>
            </span>
            <div>
              <h3>{{ 'METRICS.NUTRITION.TITLE' | translate }}</h3>
              <p class="subtitle">{{ caloriesToday() }} / {{ caloriesGoal }} kcal</p>
            </div>
          </div>
          <button 
            class="toggle-btn"
            [class.active]="showForm()"
            (click)="toggleForm()"
            aria-label="Toggle add meal form"
          >
            @if (showForm()) {
              <svg lucideX [size]="20" [strokeWidth]="2" aria-hidden="true"></svg>
            } @else {
              <svg lucidePlus [size]="20" [strokeWidth]="2" aria-hidden="true"></svg>
            }
          </button>
        </div>
        
        <!-- Mini Macros -->
        <div class="mini-macros">
          <div class="mini-macro">
            <span class="label">P</span>
            <span class="value">{{ proteinToday() }}g</span>
          </div>
          <div class="mini-macro">
            <span class="label">C</span>
            <span class="value">{{ carbsToday() }}g</span>
          </div>
          <div class="mini-macro">
            <span class="label">F</span>
            <span class="value">{{ fatToday() }}g</span>
          </div>
        </div>
      </div>

      <!-- Calories Progress Bar -->
      <div class="progress-section">
        <div class="progress-bar">
          <div 
            class="progress-fill"
            [style.width.%]="caloriesPercentage()"
            [class.over]="caloriesPercentage() > 100"
            role="progressbar"
            [attr.aria-valuenow]="caloriesToday()"
            [attr.aria-valuemin]="0"
            [attr.aria-valuemax]="caloriesGoal"
          ></div>
        </div>
        <div class="progress-info">
          <span class="remaining" [class.over]="caloriesOverGoal()">
            @if (caloriesRemaining() > 0) {
              {{ caloriesRemaining() }} kcal left
            } @else {
              {{ caloriesOverBy() }} kcal over
            }
          </span>
          <span class="percentage">{{ caloriesPct() }}%</span>
        </div>
      </div>

      <!-- Quick Meal Buttons (always visible) -->
      <div class="quick-meals-section persistent">
        <div class="section-label">{{ 'METRICS.NUTRITION.QUICK_SEARCH' | translate }}</div>
        <div class="quick-meals">
          @for (meal of mealTypes; track meal.type) {
            <button
              class="quick-meal-btn"
              [class.logged]="isMealLogged(meal.type)"
              [class.active]="selectedMealType() === meal.type"
              (click)="selectMealType(meal.type)"
              [title]="'Add ' + meal.label"
              aria-label="Select {{ meal.label }}"
            >
              <span class="emoji">{{ meal.emoji }}</span>
              <span class="name">{{ meal.label }}</span>
              @if (isMealLogged(meal.type)) {
                <span class="logged-badge">✓</span>
              }
            </button>
          }
        </div>

        <button type="button" class="form-toggle-link" (click)="toggleForm()">
          @if (showForm()) {
            {{ 'METRICS.NUTRITION.CLOSE_FORM' | translate }}
          } @else {
            {{ 'METRICS.NUTRITION.OPEN_FORM' | translate }}
          }
        </button>
      </div>

      <!-- Log Form -->
      @if (showForm()) {
        <form class="log-form" (ngSubmit)="submitForm()">
          <!-- Step 1: Meal Type Selection -->
          <div class="form-section">
            <div class="section-label">{{ 'METRICS.NUTRITION.MEAL_TYPE' | translate }}</div>
            <div class="meal-type-grid" role="group">
              @for (meal of mealTypes; track meal.type) {
                <button
                  type="button"
                  class="meal-type-btn"
                  [class.selected]="selectedMealType() === meal.type"
                  (click)="selectMealType(meal.type)"
                  [attr.aria-pressed]="selectedMealType() === meal.type"
                >
                  <span class="emoji">{{ meal.emoji }}</span>
                  <span class="label">{{ meal.label }}</span>
                </button>
              }
            </div>
          </div>

          <!-- Step 2: Find Meal (Catalog or Manual) -->
          <div class="form-section">
            <div class="section-label">{{ 'METRICS.NUTRITION.FIND_MEAL' | translate }}</div>

            <!-- Tabs for Quick vs Catalog -->
            <div class="input-tabs">
              <button
                type="button"
                class="tab-btn"
                [class.active]="!useQuickEntry()"
                (click)="setEntryMode(false)"
              >
                {{ 'METRICS.NUTRITION.QUICK_SEARCH' | translate }}
              </button>
              <button
                type="button"
                class="tab-btn"
                [class.active]="useQuickEntry()"
                (click)="setEntryMode(true)"
              >
                {{ 'METRICS.NUTRITION.MANUAL_ENTRY' | translate }}
              </button>
            </div>

            <!-- Catalog Search -->
            @if (!useQuickEntry()) {
              <div class="input-wrapper">
                <app-autocomplete
                  [suggestions]="mealSuggestions()"
                  [selectedItems]="selectedMealSearch()"
                  [placeholder]="'METRICS.NUTRITION.SEARCH_MEALS' | translate"
                  [allowCustom]="false"
                  [multiple]="false"
                  (itemsChange)="onMealSearchChange($event)"
                />
              </div>

              @if (selectedCatalogMeal()) {
                <div class="meal-preview">
                  <div class="preview-header">
                    <span class="emoji">{{ selectedCatalogMeal()!.emoji }}</span>
                    <div class="preview-info">
                      <strong>{{ selectedCatalogMeal()!.name }}</strong>
                      <p>{{ selectedCatalogMeal()!.calories }} kcal</p>
                    </div>
                  </div>
                  @if (selectedCatalogMeal()!.servingSize) {
                    <p class="preview-serving">{{ selectedCatalogMeal()!.servingSize }}</p>
                  }
                </div>
              }
            }

            <!-- Barcode Scanner (Always available) -->
            <div class="barcode-section">
              <app-barcode-scanner 
                (foodScanned)="onFoodScanned($event)"
              />
            </div>

            <!-- Manual Entry -->
            @if (useQuickEntry()) {
              <div class="input-wrapper">
                <label for="mealName" class="floating-label">{{ 'METRICS.NUTRITION.MEAL_NAME' | translate }}</label>
                <input
                  type="text"
                  id="mealName"
                  class="form-input"
                  [ngModel]="mealName()"
                  (ngModelChange)="mealName.set($event)"
                  placeholder="e.g. Grilled Chicken Salad"
                  required
                />
              </div>
            }
          </div>

          <!-- Step 3: Calories & Macros -->
          <div class="form-section">
            <div class="section-label">{{ 'METRICS.NUTRITION.NUTRITIONAL_INFO' | translate }}</div>

            <!-- Calories (Always Required) -->
            <div class="input-wrapper">
              <label for="calories" class="floating-label">{{ 'METRICS.NUTRITION.CALORIES' | translate }}</label>
              <div class="input-with-unit">
                <input
                  type="number"
                  id="calories"
                  class="form-input"
                  [ngModel]="calories()"
                  (ngModelChange)="onCaloriesChange($event)"
                  min="0"
                  max="5000"
                  placeholder="0"
                  required
                />
                <span class="unit">kcal</span>
              </div>
            </div>

            <!-- Macros Toggle Button -->
            <button 
              type="button" 
              class="expand-macros-btn"
              (click)="showMacros.set(!showMacros())"
              [attr.aria-expanded]="showMacros()"
            >
              <span class="icon" [class.open]="showMacros()">▼</span>
              {{ 'METRICS.NUTRITION.ADD_MACROS' | translate }} ({{ 'OPTIONAL' | translate }})
            </button>

            <!-- Macro Inputs (Collapsible) -->
            @if (showMacros()) {
              <div class="macros-grid">
                <div class="macro-input-wrapper">
                  <label for="proteinInput" class="floating-label">{{ 'METRICS.NUTRITION.PROTEIN' | translate }}</label>
                  <div class="input-with-unit">
                    <input
                      type="number"
                      id="proteinInput"
                      class="form-input"
                      [ngModel]="protein()"
                      (ngModelChange)="onProteinChange($event)"
                      min="0"
                      max="200"
                      placeholder="0"
                    />
                    <span class="unit">g</span>
                  </div>
                </div>
                <div class="macro-input-wrapper">
                  <label for="carbsInput" class="floating-label">{{ 'METRICS.NUTRITION.CARBS' | translate }}</label>
                  <div class="input-with-unit">
                    <input
                      type="number"
                      id="carbsInput"
                      class="form-input"
                      [ngModel]="carbs()"
                      (ngModelChange)="onCarbsChange($event)"
                      min="0"
                      max="500"
                      placeholder="0"
                    />
                    <span class="unit">g</span>
                  </div>
                </div>
                <div class="macro-input-wrapper">
                  <label for="fatInput" class="floating-label">{{ 'METRICS.NUTRITION.FAT' | translate }}</label>
                  <div class="input-with-unit">
                    <input
                      type="number"
                      id="fatInput"
                      class="form-input"
                      [ngModel]="fat()"
                      (ngModelChange)="onFatChange($event)"
                      min="0"
                      max="200"
                      placeholder="0"
                    />
                    <span class="unit">g</span>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="submit-btn"
            [disabled]="!canSubmit() || logging()"
          >
            @if (logging()) {
              <span class="spinner" aria-hidden="true"></span>
              {{ 'METRICS.NUTRITION.LOGGING' | translate }}
            } @else {
              {{ 'METRICS.NUTRITION.LOG_MEAL' | translate }}
            }
          </button>
        </form>
      }

      <!-- Recent Meals Section -->
      @if (recentMeals().length > 0) {
        <div class="recent-meals">
          <div class="recent-header">
            <h4>{{ 'METRICS.NUTRITION.TODAY_MEALS' | translate }}</h4>
            <span class="count">{{ recentMeals().length }}</span>
          </div>
          <div class="meal-list">
            @for (meal of recentMeals(); track meal.id) {
              <div class="meal-row">
                <div class="meal-left">
                  <span class="emoji">{{ getMealEmoji(meal.mealType) }}</span>
                  <div class="meal-text">
                    <span class="meal-name">{{ meal.name }}</span>
                    <span class="meal-type">{{ getMealTypeLabel(meal.mealType) }}</span>
                  </div>
                </div>
                <span class="meal-calories">{{ meal.calories || 0 }}<span class="unit-small">kcal</span></span>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    /* Card Styling */
    .nutrition-card {
      background: linear-gradient(135deg, #fff5f2 0%, #ffe8e0 100%);
      border: 1px solid rgba(255, 134, 120, 0.1);
      border-radius: 1.5rem;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(255, 107, 107, 0.08);
    }

    :host-context(.dark) .nutrition-card {
      background: linear-gradient(135deg, #2a1f1d 0%, #3d2620 100%);
      border-color: rgba(255, 107, 107, 0.15);
      box-shadow: 0 4px 20px rgba(255, 107, 107, 0.12);
    }

    /* Card Header */
    .card-header {
      margin-bottom: 1.25rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: start;
      gap: 1rem;
      margin-bottom: 0.75rem;
    }

    .title-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
    }

    .title-row .icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #ff6b6b;
      font-size: 1.5rem;
    }

    :host-context(.dark) .title-row .icon {
      color: #ff9999;
    }

    .title-row h3 {
      font-family: 'Satoshi', sans-serif;
      font-weight: 700;
      font-size: 1.25rem;
      color: #2d3436;
      margin: 0;
      line-height: 1.2;
    }

    :host-context(.dark) .title-row h3 {
      color: #fff5f2;
    }

    .title-row .subtitle {
      font-family: 'Satoshi', sans-serif;
      font-size: 0.875rem;
      color: #636e72;
      margin: 0.25rem 0 0;
    }

    :host-context(.dark) .title-row .subtitle {
      color: #b7a9a9;
    }

    .toggle-btn {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      border: none;
      background: linear-gradient(135deg, #ff6b6b 0%, #ffa07a 100%);
      color: white;
      font-size: 1.25rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
    }

    .toggle-btn:hover {
      transform: scale(1.08) translateY(-2px);
      box-shadow: 0 6px 16px rgba(255, 107, 107, 0.4);
    }

    .toggle-btn:active {
      transform: scale(0.96);
    }

    .toggle-btn .icon-add {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Mini Macros */
    .mini-macros {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
    }

    .mini-macro {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.5rem;
      background: rgba(255, 255, 255, 0.4);
      border-radius: 0.75rem;
      border: 1px solid rgba(255, 107, 107, 0.1);
    }

    :host-context(.dark) .mini-macro {
      background: rgba(255, 107, 107, 0.05);
      border-color: rgba(255, 107, 107, 0.15);
    }

    .mini-macro .label {
      font-family: 'Satoshi', sans-serif;
      font-size: 0.625rem;
      font-weight: 600;
      color: #ff6b6b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .mini-macro .value {
      font-family: 'Satoshi', sans-serif;
      font-size: 0.95rem;
      font-weight: 700;
      color: #2d3436;
    }

    :host-context(.dark) .mini-macro .value {
      color: #fff5f2;
    }

    /* Progress Section */
    .progress-section {
      margin-bottom: 1rem;
    }

    .progress-bar {
      height: 0.625rem;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 1rem;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    :host-context(.dark) .progress-bar {
      background: rgba(0, 0, 0, 0.2);
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #ff6b6b, #ffa07a);
      border-radius: 1rem;
      transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 0 8px rgba(255, 107, 107, 0.3);
    }

    .progress-fill.over {
      background: linear-gradient(90deg, #f87171, #fb7185);
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      color: #636e72;
    }

    :host-context(.dark) .progress-info {
      color: #a9959a;
    }

    .progress-info .remaining {
      font-weight: 600;
    }

    .progress-info .remaining.over {
      color: #f87171;
    }

    .progress-info .percentage {
      font-weight: 700;
      color: #ff6b6b;
    }

    :host-context(.dark) .progress-info .percentage {
      color: #ff9999;
    }

    /* Quick Meals Section */
    .quick-meals-section {
      margin-bottom: 0.75rem;
      border: 1px solid rgba(255, 107, 107, 0.12);
      border-radius: 1rem;
      padding: 0.65rem;
      background: rgba(255, 255, 255, 0.45);
      box-shadow: inset 0 0 0 1px rgba(255, 107, 107, 0.05);
    }

    .quick-meals-section.persistent {
      margin-bottom: 1rem;
      border-color: rgba(255, 107, 107, 0.18);
      background: rgba(255, 255, 255, 0.65);
    }

    .form-toggle-link {
      margin-top: 0.65rem;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-family: 'Satoshi', sans-serif;
      font-weight: 700;
      color: #ff6b6b;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.35rem 0;
      text-decoration: underline;
    }

    .form-toggle-link:hover {
      color: #e55454;
    }

    .quick-meals {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
      gap: 0.5rem;
    }

    .quick-meal-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 0.75rem 0.5rem;
      background: rgba(255, 255, 255, 0.6);
      border: 2px solid transparent;
      border-radius: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      font-family: 'Satoshi', sans-serif;
    }

    :host-context(.dark) .quick-meal-btn {
      background: rgba(255, 107, 107, 0.08);
    }

    .quick-meal-btn:hover {
      transform: translateY(-2px);
      border-color: #ff6b6b;
      background: rgba(255, 107, 107, 0.1);
    }

    .quick-meal-btn.logged {
      border-color: #ff6b6b;
      background: linear-gradient(135deg, rgba(255, 107, 107, 0.15), rgba(255, 160, 122, 0.1));
    }

    :host-context(.dark) .quick-meal-btn.logged {
      border-color: #ff9999;
      background: linear-gradient(135deg, rgba(255, 107, 107, 0.25), rgba(255, 160, 122, 0.15));
    }

    .quick-meal-btn .emoji {
      font-size: 1.5rem;
    }

    .quick-meal-btn .name {
      font-size: 0.65rem;
      font-weight: 600;
      color: #2d3436;
      text-align: center;
    }

    :host-context(.dark) .quick-meal-btn .name {
      color: #fff5f2;
    }

    .quick-meal-btn .logged-badge {
      position: absolute;
      top: 0.25rem;
      right: 0.25rem;
      font-size: 0.75rem;
      color: #ff6b6b;
      font-weight: 700;
    }

    /* Form Styles */
    .log-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .section-label {
      font-family: 'Satoshi', sans-serif;
      font-weight: 700;
      font-size: 0.875rem;
      color: #2d3436;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    :host-context(.dark) .section-label {
      color: #fff5f2;
    }

    /* Meal Type Grid */
    .meal-type-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.5rem;
    }

    @media (max-width: 480px) {
      .meal-type-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .meal-type-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      padding: 0.65rem 0.5rem;
      background: rgba(255, 255, 255, 0.5);
      border: 2px solid transparent;
      border-radius: 1rem;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      font-family: 'Satoshi', sans-serif;
    }

    :host-context(.dark) .meal-type-btn {
      background: rgba(255, 107, 107, 0.08);
    }

    .meal-type-btn:hover {
      background: rgba(255, 107, 107, 0.08);
      border-color: #ffa07a;
    }

    .meal-type-btn.selected {
      border-color: #ff6b6b;
      background: linear-gradient(135deg, rgba(255, 107, 107, 0.15), rgba(255, 160, 122, 0.1));
      box-shadow: 0 4px 12px rgba(255, 107, 107, 0.2);
    }

    .meal-type-btn .emoji {
      font-size: 1.35rem;
    }

    .meal-type-btn .label {
      font-size: 0.625rem;
      font-weight: 600;
      color: #2d3436;
    }

    :host-context(.dark) .meal-type-btn .label {
      color: #fff5f2;
    }

    /* Input Tabs */
    .input-tabs {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .tab-btn {
      padding: 0.65rem;
      background: rgba(255, 255, 255, 0.4);
      border: none;
      border-radius: 0.75rem;
      font-family: 'Satoshi', sans-serif;
      font-weight: 600;
      font-size: 0.8rem;
      color: #636e72;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    :host-context(.dark) .tab-btn {
      background: rgba(255, 107, 107, 0.06);
      color: #a9959a;
    }

    .tab-btn.active {
      background: linear-gradient(135deg, #ff6b6b 0%, #ffa07a 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(255, 107, 107, 0.25);
    }

    /* Input Wrapper */
    .input-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .floating-label {
      font-family: 'Satoshi', sans-serif;
      font-weight: 600;
      font-size: 0.8rem;
      color: #2d3436;
    }

    :host-context(.dark) .floating-label {
      color: #fff5f2;
    }

    .form-input {
      padding: 0.85rem;
      border: 1.5px solid rgba(255, 107, 107, 0.2);
      border-radius: 0.85rem;
      font-family: 'Satoshi', sans-serif;
      font-size: 1rem;
      background: rgba(255, 255, 255, 0.7);
      color: #2d3436;
      transition: all 0.2s ease;
      width: 100%;
      box-sizing: border-box;
    }

    :host-context(.dark) .form-input {
      background: rgba(255, 107, 107, 0.06);
      border-color: rgba(255, 107, 107, 0.12);
      color: #fff5f2;
    }

    .form-input:focus {
      outline: none;
      border-color: #ff6b6b;
      background: rgba(255, 255, 255, 0.85);
      box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
    }

    :host-context(.dark) .form-input:focus {
      background: rgba(255, 107, 107, 0.08);
      border-color: #ff9999;
      box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.15);
    }

    .form-input::placeholder {
      color: #b2bec3;
    }

    :host-context(.dark) .form-input::placeholder {
      color: #7a6a6a;
    }

    /* Meal Preview */
    .meal-preview {
      padding: 1rem;
      background: linear-gradient(135deg, rgba(255, 107, 107, 0.08), rgba(255, 160, 122, 0.05));
      border: 1.5px solid rgba(255, 107, 107, 0.15);
      border-radius: 1rem;
      margin-top: 0.25rem;
    }

    :host-context(.dark) .meal-preview {
      background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 160, 122, 0.06));
      border-color: rgba(255, 107, 107, 0.2);
    }

    .preview-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .preview-header .emoji {
      font-size: 1.75rem;
    }

    .preview-info {
      display: flex;
      flex-direction: column;
    }

    .preview-info strong {
      font-size: 0.95rem;
      color: #2d3436;
    }

    :host-context(.dark) .preview-info strong {
      color: #fff5f2;
    }

    .preview-info p {
      margin: 0.25rem 0 0;
      font-size: 0.8rem;
      color: #636e72;
    }

    :host-context(.dark) .preview-info p {
      color: #a9959a;
    }

    .preview-serving {
      margin: 0;
      font-size: 0.8rem;
      color: #636e72;
      padding-top: 0.5rem;
      border-top: 1px solid rgba(255, 107, 107, 0.1);
    }

    :host-context(.dark) .preview-serving {
      color: #a9959a;
      border-top-color: rgba(255, 107, 107, 0.15);
    }

    /* Barcode Section */
    .barcode-section {
      padding: 1rem;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 1rem;
      border: 1.5px dashed rgba(255, 107, 107, 0.2);
      margin: 0.5rem 0;
    }

    :host-context(.dark) .barcode-section {
      background: rgba(255, 107, 107, 0.04);
      border-color: rgba(255, 107, 107, 0.15);
    }

    /* Input with Unit */
    .input-with-unit {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      position: relative;
    }

    .input-with-unit input {
      flex: 1;
      padding-right: 2.5rem;
    }

    .unit {
      position: absolute;
      right: 0.85rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: #ff6b6b;
      pointer-events: none;
    }

    :host-context(.dark) .unit {
      color: #ff9999;
    }

    .unit-small {
      font-size: 0.7rem;
    }

    /* Expand Macros Button */
    .expand-macros-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: none;
      border: none;
      color: #ff6b6b;
      font-family: 'Satoshi', sans-serif;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      text-align: left;
      padding: 0.5rem 0;
      transition: all 0.2s ease;
    }

    :host-context(.dark) .expand-macros-btn {
      color: #ff9999;
    }

    .expand-macros-btn:hover {
      color: #f87171;
    }

    .expand-macros-btn .icon {
      display: inline-flex;
      transition: transform 0.3s ease;
      font-size: 0.7rem;
    }

    .expand-macros-btn .icon.open {
      transform: rotate(180deg);
    }

    /* Macros Grid */
    .macros-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 0.75rem;
      animation: slideDown 0.3s ease;
    }

    @media (max-width: 480px) {
      .macros-grid {
        grid-template-columns: 1fr;
      }
    }

    .macro-input-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .macro-input-wrapper .floating-label {
      font-size: 0.75rem;
    }

    /* Submit Button */
    .submit-btn {
      padding: 1rem 1.5rem;
      background: linear-gradient(135deg, #ff6b6b 0%, #ffa07a 100%);
      color: white;
      border: none;
      border-radius: 1rem;
      font-family: 'Satoshi', sans-serif;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      box-shadow: 0 4px 16px rgba(255, 107, 107, 0.3);
      margin-top: 0.5rem;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
    }

    .submit-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .spinner {
      display: inline-block;
      width: 0.9rem;
      height: 0.9rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    /* Recent Meals */
    .recent-meals {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1.5px solid rgba(255, 107, 107, 0.1);
    }

    :host-context(.dark) .recent-meals {
      border-top-color: rgba(255, 107, 107, 0.15);
    }

    .recent-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .recent-header h4 {
      font-family: 'Satoshi', sans-serif;
      font-size: 0.95rem;
      font-weight: 700;
      color: #2d3436;
      margin: 0;
    }

    :host-context(.dark) .recent-header h4 {
      color: #fff5f2;
    }

    .count {
      font-family: 'Satoshi', sans-serif;
      font-size: 0.8rem;
      font-weight: 700;
      color: #ff6b6b;
      background: rgba(255, 107, 107, 0.1);
      padding: 0.25rem 0.5rem;
      border-radius: 0.5rem;
    }

    :host-context(.dark) .count {
      background: rgba(255, 107, 107, 0.15);
      color: #ff9999;
    }

    .meal-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .meal-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.4);
      border-radius: 0.85rem;
      border: 1px solid rgba(255, 107, 107, 0.08);
      transition: all 0.2s ease;
    }

    :host-context(.dark) .meal-row {
      background: rgba(255, 107, 107, 0.05);
      border-color: rgba(255, 107, 107, 0.12);
    }

    .meal-row:hover {
      background: rgba(255, 107, 107, 0.06);
      border-color: rgba(255, 107, 107, 0.12);
    }

    :host-context(.dark) .meal-row:hover {
      background: rgba(255, 107, 107, 0.08);
      border-color: rgba(255, 107, 107, 0.15);
    }

    .meal-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
    }

    .meal-left .emoji {
      font-size: 1.35rem;
      flex-shrink: 0;
    }

    .meal-text {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      min-width: 0;
    }

    .meal-name {
      font-family: 'Satoshi', sans-serif;
      font-weight: 600;
      font-size: 0.9rem;
      color: #2d3436;
      word-break: break-word;
    }

    :host-context(.dark) .meal-name {
      color: #fff5f2;
    }

    .meal-type {
      font-size: 0.7rem;
      color: #636e72;
    }

    :host-context(.dark) .meal-type {
      color: #a9959a;
    }

    .meal-calories {
      font-family: 'Satoshi', sans-serif;
      font-weight: 700;
      font-size: 0.95rem;
      color: #ff6b6b;
      flex-shrink: 0;
    }

    :host-context(.dark) .meal-calories {
      color: #ff9999;
    }

    /* Responsive */
    @media (max-width: 640px) {
      .nutrition-card {
        padding: 1.25rem;
      }

      .header-content {
        flex-direction: column;
        gap: 0.75rem;
      }

      .title-row h3 {
        font-size: 1.1rem;
      }

      .toggle-btn {
        width: 2.25rem;
        height: 2.25rem;
      }

      .mini-macros {
        grid-template-columns: repeat(3, 1fr);
        gap: 0.6rem;
      }

      .quick-meals {
        grid-template-columns: repeat(auto-fit, minmax(65px, 1fr));
      }

      .meal-type-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .input-tabs {
        grid-template-columns: 1fr;
      }

      .tab-btn {
        padding: 0.7rem;
        font-size: 0.75rem;
      }

      .macros-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .toggle-btn,
      .quick-meal-btn,
      .meal-type-btn,
      .tab-btn,
      .form-input,
      .submit-btn,
      .progress-fill,
      .spinner,
      .expand-macros-btn .icon,
      .log-form {
        transition: none;
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
  readonly useQuickEntry = signal(false);
  readonly selectedMealType = signal<MealType>('LUNCH');
  readonly mealName = signal('');
  readonly calories = signal<number | null>(null);
  readonly protein = signal<number | null>(null);
  readonly carbs = signal<number | null>(null);
  readonly fat = signal<number | null>(null);
  readonly selectedMealSearch = signal<string[]>([]);

  // Data
  readonly caloriesToday = this.metricsService.caloriesToday;
  readonly proteinToday = computed(() => Math.round(this.metricsService.proteinToday()));
  readonly carbsToday = computed(() => Math.round(this.metricsService.carbsToday()));
  readonly fatToday = computed(() => Math.round(this.metricsService.fatToday()));
  readonly caloriesGoal = DAILY_GOALS.calories;
  readonly mealCatalog = this.metricsService.mealCatalog;

  readonly caloriesPercentage = computed(() => {
    return Math.min(120, Math.round((this.caloriesToday() / this.caloriesGoal) * 100));
  });

  readonly caloriesPct = computed(() => {
    return Math.round((this.caloriesToday() / this.caloriesGoal) * 100);
  });

  readonly caloriesRemaining = computed(() => {
    return Math.max(0, this.caloriesGoal - this.caloriesToday());
  });

  readonly caloriesOverBy = computed(() => {
    return Math.max(0, this.caloriesToday() - this.caloriesGoal);
  });

  readonly caloriesOverGoal = computed(() => this.caloriesToday() > this.caloriesGoal);

  readonly recentMeals = computed(() => {
    const today = this.metricsService.nutritionToday();
    return today?.logs?.slice(0, 4) ?? [];
  });

  readonly mealSuggestions = computed(() =>
    this.mealCatalog()
      .map((meal) => meal.name)
      .sort((a, b) => a.localeCompare(b)),
  );

  readonly selectedCatalogMeal = computed(() => {
    const selectedName = this.selectedMealSearch()[0];
    if (!selectedName) return null;
    return this.mealCatalog().find((meal) => meal.name === selectedName) ?? null;
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
    const hasMealName = this.mealName().trim().length > 0;
    const hasSelectedCatalogMeal = Boolean(this.selectedCatalogMeal());
    const currentCalories = this.calories();
    const hasCalories = typeof currentCalories === 'number' && currentCalories > 0;

    return this.selectedMealType() && (hasSelectedCatalogMeal || hasMealName) && hasCalories;
  });

  constructor() {
    afterNextRender(() => {
      this.metricsService.loadNutritionToday();
      this.metricsService.loadMealCatalog();
    });
  }

  getMealEmoji(type: string): string {
    return MEAL_TYPE_INFO[type as MealType]?.emoji ?? '•';
  }

  getMealTypeLabel(type: string): string {
    return MEAL_TYPE_INFO[type as MealType]?.label ?? type;
  }

  isMealLogged(type: MealType): boolean {
    return this.loggedMealTypes().includes(type);
  }

  toggleForm(): void {
    this.showForm.set(!this.showForm());
    if (!this.showForm()) {
      this.resetForm();
    }
  }

  selectMealType(type: MealType): void {
    this.selectedMealType.set(type);
    this.showForm.set(true);
    this.setEntryMode(false);

    // Avoid empty form fields after tapping a meal type quick action by seeding values
    const catalogMatch = this.mealCatalog().find((meal) => meal.mealType === type);
    if (catalogMatch) {
      this.selectedMealSearch.set([catalogMatch.name]);
      this.mealName.set(catalogMatch.name);
      this.onCaloriesChange(catalogMatch.calories);
      this.onProteinChange(catalogMatch.protein ?? null);
      this.onCarbsChange(catalogMatch.carbs ?? null);
      this.onFatChange(catalogMatch.fat ?? null);
      return;
    }

    this.selectedMealSearch.set([]);
    this.mealName.set('');
  }

  onFoodScanned(food: ScannedFood): void {
    // Pre-fill form with scanned data
    this.mealName.set(food.brand ? `${food.brand} - ${food.name}` : food.name);
    this.onCaloriesChange(food.calories);
    this.onProteinChange(food.protein);
    this.onCarbsChange(food.carbs);
    this.onFatChange(food.fat);
    this.selectedMealSearch.set([]);
    this.showMacros.set(true); // Expand macros section
    this.setEntryMode(true);
  }

  onMealSearchChange(items: string[]): void {
    this.selectedMealSearch.set(items);
    const selectedName = items[0];
    if (!selectedName) return;

    const catalogItem = this.mealCatalog().find((meal) => meal.name === selectedName);
    if (!catalogItem) return;

    this.selectedMealType.set(catalogItem.mealType);
    this.mealName.set(catalogItem.name);
    this.onCaloriesChange(catalogItem.calories);
    this.onProteinChange(catalogItem.protein ?? null);
    this.onCarbsChange(catalogItem.carbs ?? null);
    this.onFatChange(catalogItem.fat ?? null);
    this.setEntryMode(false);
  }

  setEntryMode(manual: boolean): void {
    this.useQuickEntry.set(manual);

    if (manual) {
      this.selectedMealSearch.set([]);
      return;
    }

    if (this.selectedCatalogMeal()) {
      return;
    }

    const trimmedName = this.mealName().trim();
    if (trimmedName) {
      const exactMatch = this.mealCatalog().find((meal) => meal.name === trimmedName);
      if (exactMatch) {
        this.selectedMealSearch.set([exactMatch.name]);
      }
      return;
    }

    const mealTypeMatch = this.mealCatalog().find((meal) => meal.mealType === this.selectedMealType());
    if (mealTypeMatch) {
      this.selectedMealSearch.set([mealTypeMatch.name]);
      this.mealName.set(mealTypeMatch.name);
      this.onCaloriesChange(mealTypeMatch.calories);
      this.onProteinChange(mealTypeMatch.protein ?? null);
      this.onCarbsChange(mealTypeMatch.carbs ?? null);
      this.onFatChange(mealTypeMatch.fat ?? null);
    }
  }

  onCaloriesChange(value: NumericInput): void {
    this.calories.set(this.parsePositiveNumber(value, 5000, true));
  }

  onProteinChange(value: NumericInput): void {
    this.protein.set(this.parsePositiveNumber(value, 200, false));
  }

  onCarbsChange(value: NumericInput): void {
    this.carbs.set(this.parsePositiveNumber(value, 500, false));
  }

  onFatChange(value: NumericInput): void {
    this.fat.set(this.parsePositiveNumber(value, 200, false));
  }

  async submitForm(): Promise<void> {
    if (!this.canSubmit()) return;

    this.logging.set(true);
    const catalogMeal = this.selectedCatalogMeal();
    const resolvedName = catalogMeal?.name ?? this.mealName().trim();
    const mealName = resolvedName.length > 0
      ? resolvedName
      : this.getMealTypeLabel(this.selectedMealType());

    try {
      const result = await this.metricsService.logMeal({
        mealType: this.selectedMealType(),
        name: mealName,
        calories: this.calories() ?? undefined,
        protein: this.protein() ?? undefined,
        carbs: this.carbs() ?? undefined,
        fat: this.fat() ?? undefined,
        mealCatalogKey: catalogMeal?.key,
      });

      if (result.success && result.carrots) {
        this.rewardsService.awardCarrots(
          result.carrots,
          this.translate.instant('METRICS.NUTRITION.REWARD_MSG'),
          'nutrition'
        );
      }

      if (result.success) {
        this.resetForm();
      }
    } finally {
      this.logging.set(false);
    }
  }

  private parsePositiveNumber(
    value: OptionalNumericInput,
    max: number,
    roundToInt: boolean,
  ): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return null;
    }

    const capped = Math.min(parsed, max);
    if (roundToInt) {
      return Math.round(capped);
    }

    return Math.round(capped * 10) / 10;
  }

  private resetForm(): void {
    this.mealName.set('');
    this.calories.set(null);
    this.protein.set(null);
    this.carbs.set(null);
    this.fat.set(null);
    this.selectedMealSearch.set([]);
    this.showMacros.set(false);
    this.useQuickEntry.set(false);
  }
}
