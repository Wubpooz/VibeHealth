import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, catchError, of } from 'rxjs';
import { BunnyMascotComponent } from '../../shared/components/bunny-mascot/bunny-mascot.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { AutocompleteComponent } from '../../shared/components/autocomplete/autocomplete.component';
import {
  OnboardingProfile,
  ONBOARDING_STEPS,
  HEALTH_GOALS,
  FITNESS_LEVELS,
  COMMON_CONDITIONS,
  COMMON_ALLERGIES,
  HealthGoal,
} from './onboarding.types';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';
import { ReferenceDataService } from '../../core/reference-data/reference-data.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, BunnyMascotComponent, SpinnerComponent, AutocompleteComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-rose-50 via-white to-sage-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden relative">

      <!-- Simplified background - no blur -->
      <div class="fixed inset-0 pointer-events-none overflow-hidden">
        <!-- Static gradient orbs (no animation) -->
        <div class="absolute top-[-20%] right-[-15%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary-200/20 to-transparent"></div>
        <div class="absolute bottom-[-30%] left-[-20%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-sage-200/20 to-transparent"></div>
      </div>

      <!-- Header with progress -->
      <header class="relative z-10 px-6 py-6">
        <div class="max-w-3xl mx-auto">
          <!-- Logo & Skip -->
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-white shadow-lg shadow-primary-500/10 flex items-center justify-center dark:bg-gray-800">
                <img src="assets/logo.png" alt="VibeHealth Logo" class="w-6 h-6 object-contain" />
              </div>
              <span class="font-heading font-bold text-xl text-gray-900 dark:text-white">VibeHealth</span>
            </div>

            @if (currentStep() < steps.length - 1) {
              <button
                (click)="skipOnboarding()"
                class="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
              >
                Skip for now
              </button>
            }
          </div>

          <!-- Carrot Progress Trail -->
          <div class="flex items-center justify-center gap-2">
            @for (step of steps; track step.id; let i = $index) {
              <div class="flex items-center">
                <div
                  class="progress-dot"
                  [class.completed]="i < currentStep()"
                  [class.active]="i === currentStep()"
                >
                  @if (i < currentStep()) {
                    <span class="text-sm">🥕</span>
                  } @else if (i === currentStep()) {
                    <div class="w-3 h-3 rounded-full bg-primary-500"></div>
                  } @else {
                    <div class="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                  }
                </div>
                @if (i < steps.length - 1) {
                  <div
                    class="w-8 h-0.5 mx-1 rounded-full transition-colors duration-200"
                    [class]="i < currentStep() ? 'bg-primary-400' : 'bg-gray-200 dark:bg-gray-700'"
                  ></div>
                }
              </div>
            }
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="relative z-10 px-6 pb-12">
        <div class="max-w-2xl mx-auto">

          <!-- Step Container -->
          <div class="relative min-h-[500px]" [class]="'step-' + currentStep()">

            <!-- STEP 0: Welcome -->
            @if (currentStep() === 0) {
              <div class="step-content animate-fade-in-up">
                <div class="text-center mb-8">
                  <app-bunny-mascot
                    [mood]="'wave'"
                    [size]="180"
                    [message]="'Hi there! 👋'"
                  />
                </div>

                <div class="glass-card text-center">
                  <h1 class="text-4xl sm:text-5xl font-heading font-bold text-gray-900 dark:text-white mb-4">
                    Welcome to VibeHealth!
                  </h1>
                  <p class="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                    I'm your health buddy! Let's set up your profile so I can help you feel your best.
                  </p>

                  <button
                    (click)="nextStep()"
                    class="btn-primary text-lg px-10 py-4 group"
                  >
                    Let's Go!
                    <span class="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>
            }

            <!-- STEP 1: Personal Info -->
            @if (currentStep() === 1) {
              <div class="step-content">
                <div class="text-center mb-6">
                  <app-bunny-mascot
                    [mood]="'curious'"
                    [size]="140"
                    [message]="'Tell me about yourself!'"
                  />
                </div>

                <div class="glass-card">
                  <div class="flex items-center gap-3 mb-6">
                    <span class="text-3xl">🪪</span>
                    <div>
                      <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-white">About You</h2>
                      <p class="text-gray-500">The basics to personalize your experience</p>
                    </div>
                  </div>

                  <div class="space-y-5">
                    <!-- Name (Required) -->
                    <div class="form-group">
                      <label class="form-label">
                        What should I call you? <span class="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        [(ngModel)]="profile.name"
                        placeholder="Your name"
                        class="input-field"
                        [class.input-field-error]="nameError()"
                        required
                      />
                      @if (nameError()) {
                        <p class="text-sm text-red-500 mt-1">Please enter your name to continue</p>
                      }
                    </div>

                    <!-- Date of Birth -->
                    <div class="form-group">
                      <label class="form-label">When's your birthday?</label>
                      <div class="relative">
                        <input
                          type="date"
                          [(ngModel)]="profile.dateOfBirth"
                          class="input-field date-input pl-10"
                          [max]="maxDate"
                          [min]="minDate"
                        />
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                          📅
                        </span>
                      </div>
                      <p class="text-xs text-gray-400 mt-1">Used for age-appropriate recommendations</p>
                    </div>

                    <!-- Biological Sex -->
                    <div class="form-group">
                      <label class="form-label">Biological sex</label>
                      <p class="text-xs text-gray-400 mb-3">Helps with accurate health calculations</p>
                      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        @for (option of sexOptions; track option.id) {
                          <button
                            type="button"
                            (click)="profile.biologicalSex = option.id"
                            class="option-chip"
                            [class.selected]="profile.biologicalSex === option.id"
                          >
                            {{ option.label }}
                          </button>
                        }
                      </div>
                    </div>
                  </div>

                  <div class="flex justify-between mt-8">
                    <button (click)="prevStep()" class="btn-ghost">
                      ← Back
                    </button>
                    <button
                      (click)="validateAndNext()"
                      class="btn-primary"
                    >
                      Continue →
                    </button>
                  </div>
                </div>
              </div>
            }

            <!-- STEP 2: Body Metrics -->
            @if (currentStep() === 2) {
              <div class="step-content animate-fade-in-up">
                <div class="text-center mb-6">
                  <app-bunny-mascot
                    [mood]="'thinking'"
                    [size]="140"
                    [message]="'This helps me give better advice!'"
                  />
                </div>

                <div class="glass-card">
                  <div class="flex items-center gap-3 mb-6">
                    <span class="text-3xl">📏</span>
                    <div>
                      <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-white">Your Body</h2>
                      <p class="text-gray-500">Help us tailor recommendations</p>
                    </div>
                  </div>

                  <div class="space-y-6">
                    <!-- Height -->
                    <div class="form-group">
                      <label class="form-label">Height</label>
                      <div class="flex gap-3">
                        <input
                          type="number"
                          [(ngModel)]="profile.height"
                          [placeholder]="profile.heightUnit === 'cm' ? '175' : '5.9'"
                          class="input-field flex-1"
                          min="0"
                        />
                        <div class="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                          <button
                            type="button"
                            (click)="profile.heightUnit = 'cm'"
                            class="px-4 py-2 text-sm font-medium transition-colors"
                            [class]="profile.heightUnit === 'cm' ? 'bg-primary-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400'"
                          >cm</button>
                          <button
                            type="button"
                            (click)="profile.heightUnit = 'ft'"
                            class="px-4 py-2 text-sm font-medium transition-colors"
                            [class]="profile.heightUnit === 'ft' ? 'bg-primary-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400'"
                          >ft</button>
                        </div>
                      </div>
                    </div>

                    <!-- Weight -->
                    <div class="form-group">
                      <label class="form-label">Weight</label>
                      <div class="flex gap-3">
                        <input
                          type="number"
                          [(ngModel)]="profile.weight"
                          [placeholder]="profile.weightUnit === 'kg' ? '70' : '154'"
                          class="input-field flex-1"
                          min="0"
                        />
                        <div class="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                          <button
                            type="button"
                            (click)="profile.weightUnit = 'kg'"
                            class="px-4 py-2 text-sm font-medium transition-colors"
                            [class]="profile.weightUnit === 'kg' ? 'bg-primary-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400'"
                          >kg</button>
                          <button
                            type="button"
                            (click)="profile.weightUnit = 'lb'"
                            class="px-4 py-2 text-sm font-medium transition-colors"
                            [class]="profile.weightUnit === 'lb' ? 'bg-primary-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400'"
                          >lb</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="flex justify-between mt-8">
                    <button (click)="prevStep()" class="btn-ghost">
                      ← Back
                    </button>
                    <button (click)="nextStep()" class="btn-primary">
                      Continue →
                    </button>
                  </div>
                </div>
              </div>
            }

            <!-- STEP 3: Health Background -->
            @if (currentStep() === 3) {
              <div class="step-content animate-fade-in-up">
                <div class="text-center mb-6">
                  <app-bunny-mascot
                    [mood]="'curious'"
                    [size]="140"
                    [message]="'This info helps keep you safe!'"
                  />
                </div>

                <div class="glass-card">
                  <div class="flex items-center gap-3 mb-6">
                    <span class="text-3xl">🏥</span>
                    <div>
                      <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-white">Health Background</h2>
                      <p class="text-gray-500">Optional but helpful for safety</p>
                    </div>
                  </div>

                  <div class="space-y-6">
                    <!-- Medical Conditions -->
                    <div class="form-group">
                      <label class="form-label">Any medical conditions?</label>
                      <app-autocomplete
                        [suggestions]="commonConditions()"
                        [selectedItems]="profile.medicalConditions"
                        [placeholder]="'Search conditions...'"
                        [allowCustom]="true"
                        (itemsChange)="profile.medicalConditions = $event"
                      ></app-autocomplete>
                    </div>

                    <!-- Allergies -->
                    <div class="form-group">
                      <label class="form-label">Any allergies?</label>
                      <app-autocomplete
                        [suggestions]="commonAllergies()"
                        [selectedItems]="profile.allergies"
                        [placeholder]="'Search allergies...'"
                        [allowCustom]="true"
                        (itemsChange)="profile.allergies = $event"
                      ></app-autocomplete>
                    </div>

                    <!-- Medications -->
                    <div class="form-group">
                      <label class="form-label">Current medications?</label>
                      <app-autocomplete
                        [suggestions]="commonMedications()"
                        [selectedItems]="profile.currentMedications"
                        [placeholder]="'Add medications...'"
                        [allowCustom]="true"
                        (itemsChange)="profile.currentMedications = $event"
                      ></app-autocomplete>
                    </div>
                  </div>

                  <div class="flex justify-between mt-8">
                    <button (click)="prevStep()" class="btn-ghost">
                      ← Back
                    </button>
                    <button (click)="nextStep()" class="btn-primary">
                      Continue →
                    </button>
                  </div>
                </div>
              </div>
            }

            <!-- STEP 4: Goals -->
            @if (currentStep() === 4) {
              <div class="step-content animate-fade-in-up">
                <div class="text-center mb-6">
                  <app-bunny-mascot
                    [mood]="'excited'"
                    [size]="140"
                    [message]="'Love your ambition! 🎯'"
                  />
                </div>

                <div class="glass-card">
                  <div class="flex items-center gap-3 mb-6">
                    <span class="text-3xl">🎯</span>
                    <div>
                      <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-white">Your Goals</h2>
                      <p class="text-gray-500">What would you like to achieve?</p>
                    </div>
                  </div>

                  <div class="space-y-6">
                    <!-- Fitness Level -->
                    <div class="form-group">
                      <label class="form-label">Current activity level</label>
                      <div class="space-y-2">
                        @for (level of fitnessLevels; track level.id) {
                          <button
                            type="button"
                            (click)="profile.fitnessLevel = level.id"
                            class="w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200"
                            [class]="profile.fitnessLevel === level.id
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'"
                          >
                            <span class="font-semibold text-gray-900 dark:text-white">{{ level.label }}</span>
                            <span class="text-sm text-gray-500 ml-2">{{ level.description }}</span>
                          </button>
                        }
                      </div>
                    </div>

                    <!-- Health Goals -->
                    <div class="form-group">
                      <label class="form-label">Select your goals <span class="text-gray-400 font-normal">(pick any)</span></label>
                      <div class="grid grid-cols-2 gap-3">
                        @for (goal of healthGoals; track goal.id) {
                          <button
                            type="button"
                            (click)="toggleGoal(goal.id)"
                            class="goal-card"
                            [class.selected]="profile.goals.includes(goal.id)"
                          >
                            <span class="text-2xl mb-1">{{ goal.emoji }}</span>
                            <span class="font-semibold text-gray-900 dark:text-white text-sm">{{ goal.label }}</span>
                            <span class="text-xs text-gray-500">{{ goal.description }}</span>
                          </button>
                        }
                      </div>
                    </div>
                  </div>

                  <div class="flex justify-between mt-8">
                    <button (click)="prevStep()" class="btn-ghost">
                      ← Back
                    </button>
                    <button
                      (click)="completeOnboarding()"
                      class="btn-primary"
                      [disabled]="saving()"
                    >
                      @if (saving()) {
                        <app-spinner [size]="'sm'" />
                        <span class="ml-2">Saving...</span>
                      } @else {
                        Complete Setup →
                      }
                    </button>
                  </div>
                </div>
              </div>
            }

            <!-- STEP 5: Complete -->
            @if (currentStep() === 5) {
              <div class="step-content animate-fade-in-up text-center">
                <div class="mb-8">
                  <app-bunny-mascot
                    [mood]="'celebrate'"
                    [size]="200"
                  />
                </div>

                <div class="glass-card">
                  <!-- Confetti effect -->
                  <div class="confetti-container">
                    @for (i of confettiPieces; track i) {
                      <div
                        class="confetti"
                        [style.left.%]="i * 10"
                        [style.animation-delay.ms]="i * 100"
                        [style.background-color]="confettiColors[i % confettiColors.length]"
                      ></div>
                    }
                  </div>

                  <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sage-100 text-5xl mb-6 dark:bg-sage-900/30">
                    🎉
                  </div>

                  <h1 class="text-4xl font-heading font-bold text-gray-900 dark:text-white mb-4">
                    You're All Set!
                  </h1>
                  <p class="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                    Awesome, {{ profile.name }}! Your health journey starts now. I'll be here cheering you on every step of the way!
                  </p>

                  <button
                    (click)="goToDashboard()"
                    class="btn-primary text-lg px-10 py-4 group"
                  >
                    Go to Dashboard
                    <span class="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>
            }

          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    /* Progress dots */
    .progress-dot {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    :host-context(.dark) .progress-dot {
      background: #1f2937;
    }

    .progress-dot.completed {
      background: linear-gradient(135deg, #fef2f2, #fff1f2);
    }

    .progress-dot.active {
      box-shadow: 0 0 0 4px rgba(244, 63, 94, 0.15);
    }

    /* Glass card - NO backdrop-filter for performance */
    .glass-card {
      background: rgba(255, 255, 255, 0.97);
      border-radius: 24px;
      padding: 28px;
      border: 1px solid rgba(0, 0, 0, 0.06);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    :host-context(.dark) .glass-card {
      background: rgba(17, 24, 39, 0.97);
      border-color: rgba(255, 255, 255, 0.1);
    }

    /* Form styles */
    .form-group {
      position: relative;
    }

    .form-label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
    }

    :host-context(.dark) .form-label {
      color: #e5e7eb;
    }

    /* Option chip (for sex selection) */
    .option-chip {
      padding: 12px 16px;
      border-radius: 12px;
      border: 2px solid #e5e7eb;
      background: #f9fafb;
      font-weight: 500;
      font-size: 14px;
      color: #4b5563;
      transition: all 0.2s ease;
    }

    .option-chip:hover {
      border-color: #d1d5db;
      background: white;
    }

    .option-chip.selected {
      border-color: #f43f5e;
      background: #fff1f2;
      color: #e11d48;
    }

    :host-context(.dark) .option-chip {
      border-color: #374151;
      background: #1f2937;
      color: #9ca3af;
    }

    :host-context(.dark) .option-chip.selected {
      border-color: #f43f5e;
      background: rgba(244, 63, 94, 0.2);
      color: #fb7185;
    }

    /* Tag chips (for conditions/allergies) */
    .tag-chip {
      padding: 8px 14px;
      border-radius: 20px;
      border: 1.5px solid #e5e7eb;
      background: white;
      font-size: 13px;
      font-weight: 500;
      color: #6b7280;
      transition: all 0.2s ease;
    }

    .tag-chip:hover {
      border-color: #d1d5db;
      background: #f9fafb;
    }

    .tag-chip.selected {
      border-color: #f43f5e;
      background: #fff1f2;
      color: #e11d48;
    }

    :host-context(.dark) .tag-chip {
      border-color: #374151;
      background: #1f2937;
      color: #9ca3af;
    }

    :host-context(.dark) .tag-chip.selected {
      border-color: #f43f5e;
      background: rgba(244, 63, 94, 0.2);
      color: #fb7185;
    }

    /* Goal cards */
    .goal-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px 12px;
      border-radius: 16px;
      border: 2px solid #e5e7eb;
      background: #f9fafb;
      transition: all 0.2s ease;
      text-align: center;
    }

    .goal-card:hover {
      border-color: #d1d5db;
      background: white;
      transform: translateY(-2px);
    }

    .goal-card.selected {
      border-color: #f43f5e;
      background: linear-gradient(135deg, #fff1f2, #fef2f2);
      box-shadow: 0 4px 12px rgba(244, 63, 94, 0.15);
    }

    :host-context(.dark) .goal-card {
      border-color: #374151;
      background: #1f2937;
    }

    :host-context(.dark) .goal-card.selected {
      border-color: #f43f5e;
      background: rgba(244, 63, 94, 0.15);
    }

    /* Buttons */
    .btn-ghost {
      padding: 12px 20px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
      color: #6b7280;
      transition: all 0.2s ease;
    }

    .btn-ghost:hover {
      color: #374151;
      background: rgba(0, 0, 0, 0.04);
    }

    :host-context(.dark) .btn-ghost {
      color: #9ca3af;
    }

    :host-context(.dark) .btn-ghost:hover {
      color: #e5e7eb;
      background: rgba(255, 255, 255, 0.05);
    }

    /* Confetti - simplified */
    .confetti-container {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 100%;
      overflow: hidden;
      pointer-events: none;
    }

    .confetti {
      position: absolute;
      width: 8px;
      height: 8px;
      top: -10px;
      border-radius: 2px;
      animation: confetti-fall 2s ease-out forwards;
    }

    @keyframes confetti-fall {
      0% { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(300px); opacity: 0; }
    }

    /* Step content - simple fade */
    .step-content {
      animation: fade-in 0.3s ease forwards;
    }

    @keyframes fade-in {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }

    /* Date picker improvements */
    .date-picker-wrapper {
      position: relative;
    }

    .date-input {
      cursor: pointer;
    }

    .date-input::-webkit-calendar-picker-indicator {
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.2s;
    }

    .date-input::-webkit-calendar-picker-indicator:hover {
      opacity: 1;
    }

    /* Error state for inputs */
    .input-field-error {
      border-color: #ef4444 !important;
      background-color: #fef2f2 !important;
    }

    :host-context(.dark) .input-field-error {
      border-color: #f87171 !important;
      background-color: rgba(239, 68, 68, 0.1) !important;
    }
  `],
})
export class OnboardingComponent {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly referenceDataService = inject(ReferenceDataService);

  // Step data
  steps = ONBOARDING_STEPS;
  healthGoals = HEALTH_GOALS;
  fitnessLevels = FITNESS_LEVELS;
  
  // Expose signals from service
  commonConditions = this.referenceDataService.conditions;
  commonAllergies = this.referenceDataService.allergies;
  commonMedications = this.referenceDataService.medications;

  // State
  currentStep = signal(0);
  saving = signal(false);
  nameError = signal(false);
  
  // Date constraints
  maxDate: string;
  minDate: string;

  // Profile data
  profile: OnboardingProfile = {
    name: '',
    dateOfBirth: '',
    biologicalSex: 'prefer_not_to_say',
    height: 0,
    heightUnit: 'cm',
    weight: 0,
    weightUnit: 'kg',
    medicalConditions: [],
    allergies: [],
    currentMedications: [],
    fitnessLevel: 'moderate',
    goals: [],
    notificationPreferences: {
      dailyReminders: true,
      weeklyReports: true,
      achievements: true,
      medicationReminders: false,
    },
  };

  // Sex options
  sexOptions = [
    { id: 'male', label: 'Male' },
    { id: 'female', label: 'Female' },
    { id: 'other', label: 'Other' },
    { id: 'prefer_not_to_say', label: 'Prefer not to say' },
  ] as const;

  // Confetti celebration - reduced count for performance
  confettiPieces = Array.from({ length: 6 }, (_, i) => i);
  confettiColors = ['#f43f5e', '#34d399', '#fbbf24', '#3b82f6'];

  constructor() {
    // Pre-fill name from auth user if available
    const user = this.authService.user();
    if (user?.name) {
      this.profile.name = user.name;
    }
    
    // Set date constraints
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
    const minYear = today.getFullYear() - 120;
    this.minDate = `${minYear}-01-01`;
  }

  nextStep() {
    if (this.currentStep() < this.steps.length - 1) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep() {
    if (this.currentStep() > 0) {
      this.currentStep.update(s => s - 1);
    }
  }

  // Validate step 1 and proceed
  validateAndNext() {
    if (!this.profile.name.trim()) {
      this.nameError.set(true);
      return;
    }
    this.nameError.set(false);
    this.nextStep();
  }

  toggleGoal(goalId: HealthGoal) {
    const goals = this.profile.goals;
    const index = goals.indexOf(goalId);
    if (index > -1) {
      goals.splice(index, 1);
    } else {
      goals.push(goalId);
    }
  }

  async completeOnboarding() {
    this.saving.set(true);

    try {
      // Save profile to backend
      await firstValueFrom(
        this.http.post(`${environment.apiUrl}/api/v1/profile`, this.profile, {
          withCredentials: true,
        }).pipe(
          catchError(error => {
            console.error('Failed to save profile:', error);
            // Continue to completion screen anyway - we can retry later
            return of(null);
          })
        )
      );

      // Move to completion step
      this.currentStep.set(5);
    } finally {
      this.saving.set(false);
    }
  }

  skipOnboarding() {
    this.router.navigate(['/dashboard']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
