import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  GoalsService,
  GOAL_TYPE_INFO,
  GOAL_FREQ_INFO,
  type GoalType,
  type GoalFreq,
  type Goal,
  type CreateGoalDto,
} from '../../core/metrics/goals.service';
import { RewardsService } from '../../core/rewards/rewards.service';
import { LucideCarrot, LucideTriangleAlert, LucideTrophy } from '@lucide/angular';
import { BunnyMascotComponent } from '../../shared/components/bunny-mascot/bunny-mascot.component';

// ─── Step definitions ─────────────────────────────────────────────────────────

type WizardStep = 1 | 2 | 3;

@Component({
  selector: 'app-goal-wizard',
  imports: [CommonModule, FormsModule, TranslateModule, LucideCarrot, LucideTriangleAlert, LucideTrophy, BunnyMascotComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="wizard-overlay"
      (click)="onOverlayClick($event)"
      (keydown.enter)="onOverlayKeydown($event)"
      (keydown.space)="onOverlayKeydown($event)"
      tabindex="0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizardTitle"
    >
      <div class="wizard-panel">

        <!-- ── Step indicator ─────────────────────────────────────────── -->
        <div class="step-bar">
          @for (s of [1, 2, 3]; track s) {
            <div class="step-dot" [class.active]="step() >= s" [class.current]="step() === s">
              @if (step() > s) {
                <span class="dot-check">✓</span>
              } @else {
                <span>{{ s }}</span>
              }
            </div>
            @if (s < 3) {
              <div class="step-line" [class.filled]="step() > s"></div>
            }
          }
        </div>

        <!-- ─────────────────────────────────────────────────────────────
             STEP 1 — Choose goal type
        ──────────────────────────────────────────────────────────────── -->
        @if (step() === 1) {
          <div class="step-content">
            <h2 id="wizardTitle" class="wizard-title">
              {{ 'GOALS.WIZARD.STEP1_TITLE' | translate }}
            </h2>
            <p class="wizard-subtitle">{{ 'GOALS.WIZARD.STEP1_SUBTITLE' | translate }}</p>

            <div class="type-grid">
              @for (gt of goalTypes; track gt) {
                <button
                  type="button"
                  class="type-card"
                  [class.selected]="selectedType() === gt"
                  (click)="selectType(gt)"
                >
                  <span class="type-emoji">{{ typeInfo[gt].emoji }}</span>
                  <span class="type-name">{{ typeInfo[gt].labelKey | translate }}</span>
                  <span class="type-hint">{{ typeInfo[gt].hintKey | translate }}</span>
                </button>
              }
            </div>
          </div>

          <div class="wizard-footer">
            <button class="btn-ghost" (click)="closed.emit()">
              {{ 'GOALS.WIZARD.CANCEL' | translate }}
            </button>
            <button
              class="btn-primary"
              [disabled]="!selectedType()"
              (click)="goToStep(2)"
            >
              {{ 'GOALS.WIZARD.NEXT' | translate }} →
            </button>
          </div>
        }

        <!-- ─────────────────────────────────────────────────────────────
             STEP 2 — Configure goal
        ──────────────────────────────────────────────────────────────── -->
        @if (step() === 2) {
          <div class="step-content">
            <h2 id="wizardTitle" class="wizard-title">
              {{ 'GOALS.WIZARD.STEP2_TITLE' | translate }}
            </h2>
            <p class="wizard-subtitle">
              {{ typeInfo[selectedType()!].emoji }} {{ typeInfo[selectedType()!].labelKey | translate }}
            </p>

            <!-- Title -->
            <div class="form-group">
              <label class="form-label" for="goalTitle">
                {{ 'GOALS.WIZARD.GOAL_TITLE' | translate }}
              </label>
              <input
                id="goalTitle"
                type="text"
                class="form-input"
                [placeholder]="typeInfo[selectedType()!].labelKey | translate"
                [ngModel]="title()"
                (ngModelChange)="title.set($event)"
                maxlength="80"
              />
            </div>

            <!-- Target value -->
            <div class="form-group">
              <label class="form-label" for="targetValue">
                {{ 'GOALS.WIZARD.TARGET' | translate }}
              </label>
              <div class="input-with-unit">
                <input
                  id="targetValue"
                  type="number"
                  class="form-input"
                  [ngModel]="targetValue()"
                  (ngModelChange)="targetValue.set($event)"
                  min="1"
                />
                <span class="unit-tag">{{ currentUnit() }}</span>
              </div>
              <p class="form-hint">{{ typeInfo[selectedType()!].hintKey | translate }}</p>
            </div>

            <!-- Frequency -->
            <div class="form-group">
              <div class="form-label" id="freqLabel">{{ 'GOALS.WIZARD.FREQUENCY' | translate }}</div>
              <div class="freq-grid" role="group" aria-labelledby="freqLabel">
                @for (f of freqOptions; track f) {
                  <button
                    type="button"
                    class="freq-btn"
                    [class.selected]="frequency() === f"
                    (click)="frequency.set(f)"
                  >
                    <span>{{ freqInfo[f].emoji }}</span>
                    <span>{{ freqInfo[f].labelKey | translate }}</span>
                  </button>
                }
              </div>
            </div>

            <!-- Optional end date -->
            <div class="form-group">
              <label class="form-label" for="endDate">
                {{ 'GOALS.WIZARD.END_DATE' | translate }}
                <span class="optional-tag">{{ 'GOALS.WIZARD.OPTIONAL' | translate }}</span>
              </label>
              <input
                id="endDate"
                type="date"
                class="form-input"
                [ngModel]="endDate()"
                (ngModelChange)="endDate.set($event)"
                [min]="minEndDate"
              />
            </div>
          </div>

          <div class="wizard-footer">
            <button class="btn-ghost" (click)="goToStep(1)">
              ← {{ 'GOALS.WIZARD.BACK' | translate }}
            </button>
            <button
              class="btn-primary"
              [disabled]="!canProceedStep2()"
              (click)="goToStep(3)"
            >
              {{ 'GOALS.WIZARD.NEXT' | translate }} →
            </button>
          </div>
        }

        <!-- ─────────────────────────────────────────────────────────────
             STEP 3 — Confirm + celebrate
        ──────────────────────────────────────────────────────────────── -->
        @if (step() === 3) {
          <div class="step-content">

            @if (!saved()) {
              <!-- Pre-save confirmation -->
              <h2 id="wizardTitle" class="wizard-title">
                {{ 'GOALS.WIZARD.STEP3_TITLE' | translate }}
              </h2>
              <p class="wizard-subtitle">{{ 'GOALS.WIZARD.STEP3_SUBTITLE' | translate }}</p>

              <!-- Summary card -->
              <div class="summary-card">
                <div class="summary-icon">{{ typeInfo[selectedType()!].emoji }}</div>
                <div class="summary-body">
                  <h3 class="summary-name">{{ effectiveTitle() }}</h3>
                  <p class="summary-detail">
                    <strong>{{ targetValue() }} {{ currentUnit() }}</strong>
                    · {{ freqInfo[frequency()].emoji }} {{ freqInfo[frequency()].labelKey | translate }}
                  </p>
                  @if (endDate()) {
                    <p class="summary-date">{{ 'GOALS.WIZARD.UNTIL' | translate }} {{ endDate() | date: 'mediumDate' }}</p>
                  }
                </div>
                <div class="summary-badge">
                  <span class="badge-text">
                    +5
                    <span class="badge-icon" aria-hidden="true">
                      <svg lucideCarrot [size]="14" [strokeWidth]="2"></svg>
                    </span>
                  </span>
                </div>
              </div>

              @if (goalsService.error()) {
                <p class="error-msg">
                  <span class="error-icon" aria-hidden="true">
                    <svg lucideTriangleAlert [size]="14" [strokeWidth]="2"></svg>
                  </span>
                  {{ goalsService.error()! | translate }}
                </p>
              }
            } @else {
              <!-- Post-save celebration -->
              <div class="celebrate-section">
                <div class="mascot-wrapper">
                  <app-bunny-mascot [mood]="'celebrate'" [size]="76" />
                  <div class="confetti-ring"></div>
                </div>
                <h2 class="celebrate-title">{{ 'GOALS.WIZARD.CELEBRATE_TITLE' | translate }}</h2>
                <p class="celebrate-subtitle">{{ 'GOALS.WIZARD.CELEBRATE_SUBTITLE' | translate }}</p>

                <div class="carrot-earned">
                  <span class="carrot-emoji" aria-hidden="true">
                    <svg lucideCarrot [size]="22" [strokeWidth]="2"></svg>
                  </span>
                  <span class="carrot-text">+5 {{ 'GOALS.WIZARD.CARROTS_EARNED' | translate }}</span>
                </div>

                <!-- Saved goal pill -->
                <div class="saved-pill">
                  <span>{{ typeInfo[selectedType()!].emoji }}</span>
                  <span class="pill-name">{{ effectiveTitle() }}</span>
                  <span class="pill-target">{{ targetValue() }} {{ currentUnit() }}</span>
                </div>
              </div>
            }
          </div>

          <div class="wizard-footer">
            @if (!saved()) {
              <button class="btn-ghost" (click)="goToStep(2)" [disabled]="goalsService.saving()">
                ← {{ 'GOALS.WIZARD.BACK' | translate }}
              </button>
              <button
                class="btn-primary"
                [disabled]="goalsService.saving()"
                (click)="saveGoal()"
              >
                @if (goalsService.saving()) {
                  <span class="spinner"></span>
                } @else {
                  <span class="btn-icon" aria-hidden="true"><svg lucideTrophy [size]="16" [strokeWidth]="2"></svg></span>
                  {{ 'GOALS.WIZARD.CREATE_GOAL' | translate }}
                }
              </button>
            } @else {
              <button class="btn-primary full-width" (click)="done()">
                {{ 'GOALS.WIZARD.DONE' | translate }}
              </button>
            }
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    /* ── Overlay ─────────────────────────────────────────────────────── */
    .wizard-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      animation: overlayIn 0.2s ease;
    }

    @keyframes overlayIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    /* ── Panel ───────────────────────────────────────────────────────── */
    .wizard-panel {
      background: white;
      border-radius: 1.75rem;
      padding: 2rem;
      width: 100%;
      max-width: 560px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
      animation: panelIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes panelIn {
      from { opacity: 0; transform: translateY(24px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    :host-context([data-theme="dark"]) .wizard-panel {
      background: #1f2937;
      border: 1px solid #374151;
    }

    /* ── Step bar ────────────────────────────────────────────────────── */
    .step-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      margin-bottom: 2rem;
    }

    .step-dot {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Satoshi', sans-serif;
      font-weight: 700;
      font-size: 0.8125rem;
      background: #f1f3f4;
      color: #9ca3af;
      transition: all 0.3s ease;
      flex-shrink: 0;
    }

    .step-dot.active {
      background: #7c4dff;
      color: white;
    }

    .step-dot.current {
      box-shadow: 0 0 0 4px rgba(124, 77, 255, 0.2);
    }

    .dot-check {
      font-size: 0.75rem;
    }

    .step-line {
      flex: 1;
      height: 2px;
      background: #e5e7eb;
      max-width: 4rem;
      transition: background 0.3s ease;
    }

    .step-line.filled {
      background: #7c4dff;
    }

    :host-context([data-theme="dark"]) .step-dot {
      background: #374151;
      color: #6b7280;
    }

    :host-context([data-theme="dark"]) .step-line {
      background: #374151;
    }

    /* ── Step content ────────────────────────────────────────────────── */
    .step-content {
      min-height: 260px;
    }

    .wizard-title {
      font-family: 'Satoshi', sans-serif;
      font-weight: 800;
      font-size: 1.375rem;
      color: #111827;
      margin: 0 0 0.375rem;
    }

    :host-context([data-theme="dark"]) .wizard-title {
      color: #f9fafb;
    }

    .wizard-subtitle {
      font-family: 'Satoshi', sans-serif;
      font-size: 0.9375rem;
      color: #6b7280;
      margin: 0 0 1.5rem;
    }

    :host-context([data-theme="dark"]) .wizard-subtitle {
      color: #9ca3af;
    }

    /* ── Goal type grid ──────────────────────────────────────────────── */
    .type-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.625rem;
      margin-bottom: 1.5rem;
    }

    .type-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 0.875rem 0.375rem;
      background: #f9fafb;
      border: 2px solid transparent;
      border-radius: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
    }

    .type-card:hover {
      border-color: rgba(124, 77, 255, 0.3);
      background: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .type-card.selected {
      border-color: #7c4dff;
      background: linear-gradient(135deg, #f3e5f5 0%, #ede7f6 100%);
      box-shadow: 0 4px 16px rgba(124, 77, 255, 0.2);
    }

    :host-context([data-theme="dark"]) .type-card {
      background: #374151;
      border-color: transparent;
    }

    :host-context([data-theme="dark"]) .type-card:hover {
      background: #4b5563;
    }

    :host-context([data-theme="dark"]) .type-card.selected {
      background: rgba(124, 77, 255, 0.2);
      border-color: #7c4dff;
    }

    .type-emoji {
      font-size: 1.625rem;
    }

    .type-name {
      font-family: 'Satoshi', sans-serif;
      font-size: 0.625rem;
      font-weight: 700;
      color: #374151;
      line-height: 1.3;
    }

    :host-context([data-theme="dark"]) .type-name {
      color: #e5e7eb;
    }

    .type-hint {
      font-size: 0.5625rem;
      color: #9ca3af;
      line-height: 1.2;
    }

    /* ── Form ────────────────────────────────────────────────────────── */
    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'Satoshi', sans-serif;
      font-size: 0.8125rem;
      font-weight: 700;
      color: #374151;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    :host-context([data-theme="dark"]) .form-label {
      color: #d1d5db;
    }

    .optional-tag {
      font-size: 0.6875rem;
      font-weight: 500;
      color: #9ca3af;
      text-transform: none;
      letter-spacing: 0;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      font-family: 'Satoshi', sans-serif;
      font-size: 1rem;
      font-weight: 500;
      color: #111827;
      background: #f9fafb;
      border: 2px solid #e5e7eb;
      border-radius: 0.875rem;
      outline: none;
      transition: border-color 0.2s ease, background 0.2s ease;
      box-sizing: border-box;
      -moz-appearance: textfield;
    }

    .form-input::-webkit-outer-spin-button,
    .form-input::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }

    .form-input:focus {
      border-color: #7c4dff;
      background: white;
    }

    :host-context([data-theme="dark"]) .form-input {
      background: #374151;
      border-color: #4b5563;
      color: #f9fafb;
    }

    :host-context([data-theme="dark"]) .form-input:focus {
      border-color: #7c4dff;
      background: #4b5563;
    }

    .form-hint {
      font-family: 'Satoshi', sans-serif;
      font-size: 0.75rem;
      color: #9ca3af;
      margin: 0.375rem 0 0;
    }

    .input-with-unit {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-with-unit .form-input {
      padding-right: 5rem;
    }

    .unit-tag {
      position: absolute;
      right: 1rem;
      font-family: 'Satoshi', sans-serif;
      font-size: 0.8125rem;
      font-weight: 700;
      color: #7c4dff;
      pointer-events: none;
    }

    /* ── Frequency grid ──────────────────────────────────────────────── */
    .freq-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
    }

    .freq-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 0.75rem 0.5rem;
      background: #f9fafb;
      border: 2px solid transparent;
      border-radius: 0.875rem;
      cursor: pointer;
      font-family: 'Satoshi', sans-serif;
      font-size: 0.8125rem;
      font-weight: 600;
      color: #374151;
      transition: all 0.2s ease;
    }

    .freq-btn:hover {
      border-color: rgba(124, 77, 255, 0.3);
    }

    .freq-btn.selected {
      border-color: #7c4dff;
      background: linear-gradient(135deg, #f3e5f5 0%, #ede7f6 100%);
      color: #4527a0;
    }

    :host-context([data-theme="dark"]) .freq-btn {
      background: #374151;
      color: #e5e7eb;
    }

    :host-context([data-theme="dark"]) .freq-btn.selected {
      background: rgba(124, 77, 255, 0.2);
      border-color: #7c4dff;
      color: #d8b4fe;
    }

    /* ── Summary card ────────────────────────────────────────────────── */
    .summary-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      background: linear-gradient(135deg, #f3e5f5 0%, #e8eaf6 100%);
      border-radius: 1.25rem;
      border: 2px solid rgba(124, 77, 255, 0.15);
      margin-bottom: 1rem;
    }

    .summary-icon {
      font-size: 2.5rem;
      flex-shrink: 0;
    }

    .summary-body {
      flex: 1;
      min-width: 0;
    }

    .summary-name {
      font-family: 'Satoshi', sans-serif;
      font-weight: 700;
      font-size: 1.0625rem;
      color: #311b92;
      margin: 0 0 0.25rem;
    }

    :host-context([data-theme="dark"]) .summary-name {
      color: #ede9fe;
    }

    .summary-detail {
      font-family: 'Satoshi', sans-serif;
      font-size: 0.875rem;
      color: #5c35b0;
      margin: 0 0 0.25rem;
    }

    .summary-date {
      font-family: 'Satoshi', sans-serif;
      font-size: 0.75rem;
      color: #7c4dff;
      margin: 0;
    }

    .summary-badge {
      flex-shrink: 0;
      background: white;
      border-radius: 0.75rem;
      padding: 0.5rem 0.75rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .badge-text {
      font-family: 'Satoshi', sans-serif;
      font-weight: 700;
      font-size: 0.875rem;
      color: #ff9f43;
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
    }

    .badge-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    /* ── Error ───────────────────────────────────────────────────────── */
    .error-msg {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-family: 'Satoshi', sans-serif;
      font-size: 0.875rem;
      color: #dc2626;
      background: #fef2f2;
      border-radius: 0.75rem;
      padding: 0.75rem 1rem;
      margin-top: 0.5rem;
    }

    .error-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    /* ── Celebration ─────────────────────────────────────────────────── */
    .celebrate-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 1rem 0;
      gap: 0.875rem;
    }

    .mascot-wrapper {
      position: relative;
      width: 7rem;
      height: 7rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .mascot-wrapper app-bunny-mascot {
      display: block;
    }

    .confetti-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 3px dashed rgba(124, 77, 255, 0.4);
      animation: spin 4s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .celebrate-title {
      font-family: 'Satoshi', sans-serif;
      font-weight: 800;
      font-size: 1.5rem;
      color: #111827;
      margin: 0;
    }

    :host-context([data-theme="dark"]) .celebrate-title {
      color: #f9fafb;
    }

    .celebrate-subtitle {
      font-family: 'Satoshi', sans-serif;
      font-size: 0.9375rem;
      color: #6b7280;
      margin: 0;
      max-width: 320px;
    }

    .carrot-earned {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      background: linear-gradient(135deg, #fff5e6 0%, #fef3e2 100%);
      border-radius: 2rem;
      border: 2px solid rgba(255, 159, 67, 0.3);
      animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes popIn {
      from { opacity: 0; transform: scale(0.6); }
      to   { opacity: 1; transform: scale(1); }
    }

    .carrot-emoji {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .carrot-text {
      font-family: 'Satoshi', sans-serif;
      font-weight: 700;
      font-size: 1rem;
      color: #c2660c;
    }

    .saved-pill {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.75rem 1.25rem;
      background: linear-gradient(135deg, #f3e5f5 0%, #ede7f6 100%);
      border-radius: 1rem;
      border: 1px solid rgba(124, 77, 255, 0.2);
    }

    .pill-name {
      font-family: 'Satoshi', sans-serif;
      font-weight: 700;
      font-size: 0.9375rem;
      color: #311b92;
    }

    :host-context([data-theme="dark"]) .pill-name {
      color: #ede9fe;
    }

    .pill-target {
      font-family: 'Satoshi', sans-serif;
      font-size: 0.8125rem;
      color: #7c4dff;
      font-weight: 600;
    }

    /* ── Footer ──────────────────────────────────────────────────────── */
    .wizard-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1.75rem;
      padding-top: 1.25rem;
      border-top: 1px solid #f1f3f4;
      gap: 0.75rem;
    }

    :host-context([data-theme="dark"]) .wizard-footer {
      border-color: #374151;
    }

    .btn-ghost {
      padding: 0.75rem 1.25rem;
      font-family: 'Satoshi', sans-serif;
      font-weight: 600;
      font-size: 0.9375rem;
      color: #6b7280;
      background: transparent;
      border: 2px solid #e5e7eb;
      border-radius: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .btn-ghost:hover:not(:disabled) {
      border-color: #d1d5db;
      color: #374151;
      background: #f9fafb;
    }

    .btn-ghost:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    :host-context([data-theme="dark"]) .btn-ghost {
      border-color: #4b5563;
      color: #9ca3af;
    }

    :host-context([data-theme="dark"]) .btn-ghost:hover:not(:disabled) {
      background: #374151;
      color: #e5e7eb;
    }

    .btn-primary {
      flex: 1;
      padding: 0.875rem 1.5rem;
      font-family: 'Satoshi', sans-serif;
      font-weight: 700;
      font-size: 0.9375rem;
      color: white;
      background: linear-gradient(135deg, #7c4dff 0%, #651fff 100%);
      border: none;
      border-radius: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 14px rgba(124, 77, 255, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(124, 77, 255, 0.45);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .btn-primary.full-width {
      width: 100%;
    }

    .btn-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    /* ── Spinner ─────────────────────────────────────────────────────── */
    .spinner {
      display: inline-block;
      width: 1.125rem;
      height: 1.125rem;
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-top-color: white;
      border-radius: 50%;
      animation: spinAnim 0.6s linear infinite;
    }

    @keyframes spinAnim {
      to { transform: rotate(360deg); }
    }

    /* ── Reduced motion ──────────────────────────────────────────────── */
    @media (prefers-reduced-motion: reduce) {
      .wizard-overlay,
      .wizard-panel,
      .confetti-ring,
      .carrot-earned,
      .spinner,
      .type-card,
      .btn-primary,
      .btn-ghost {
        animation: none;
        transition: none;
      }
    }

    /* ── Small screens ───────────────────────────────────────────────── */
    @media (max-width: 480px) {
      .wizard-panel {
        padding: 1.5rem 1.25rem;
        border-radius: 1.25rem;
      }

      .type-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 0.375rem;
      }

      .type-card {
        padding: 0.625rem 0.25rem;
      }

      .type-emoji {
        font-size: 1.25rem;
      }
    }
  `],
})
export class GoalWizardComponent {
  readonly goalsService = inject(GoalsService);
  private readonly rewardsService = inject(RewardsService);
  private readonly translate = inject(TranslateService);

  // ── Outputs ───────────────────────────────────────────────────────────────
  /** Emits the newly created goal on success */
  readonly goalCreated = output<Goal>();
  /** Emits when the user cancels */
  readonly closed = output<void>();

  // ── Wizard state ──────────────────────────────────────────────────────────
  readonly step = signal<WizardStep>(1);
  readonly saved = signal(false);

  // Step 1
  readonly selectedType = signal<GoalType | null>(null);

  // Step 2
  readonly title = signal('');
  readonly targetValue = signal<number>(0);
  readonly frequency = signal<GoalFreq>('DAILY');
  readonly endDate = signal('');

  // ── Static data ───────────────────────────────────────────────────────────
  readonly typeInfo = GOAL_TYPE_INFO;
  readonly freqInfo = GOAL_FREQ_INFO;

  readonly goalTypes: GoalType[] = [
    'STEPS',
    'HYDRATION',
    'CALORIES_IN',
    'CALORIES_OUT',
    'SLEEP',
    'ACTIVITY_MINUTES',
    'WEIGHT',
    'CUSTOM',
  ];

  readonly freqOptions: GoalFreq[] = ['DAILY', 'WEEKLY', 'MONTHLY'];

  readonly minEndDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // ── Computed ──────────────────────────────────────────────────────────────

  readonly currentUnit = computed(() => {
    const type = this.selectedType();
    return type ? GOAL_TYPE_INFO[type].defaultUnit : '';
  });

  readonly effectiveTitle = computed(() => {
    const t = this.title().trim();
    const type = this.selectedType();
    return t || (type ? this.translate.instant(GOAL_TYPE_INFO[type].labelKey) : '');
  });

  readonly canProceedStep2 = computed(
    () => this.targetValue() > 0,
  );

  // ── Step navigation ───────────────────────────────────────────────────────

  selectType(type: GoalType): void {
    this.selectedType.set(type);
    // Pre-fill sensible defaults for step 2
    this.targetValue.set(GOAL_TYPE_INFO[type].defaultTarget);
    this.title.set('');
  }

  goToStep(s: WizardStep): void {
    this.step.set(s);
  }

  onOverlayClick(event: MouseEvent): void {
    // Only cancel if clicking the bare overlay (not the panel)
    if ((event.target as HTMLElement).classList.contains('wizard-overlay')) {
      this.closed.emit();
    }
  }

  onOverlayKeydown(event: Event): void {
    if ((event.target as HTMLElement).classList.contains('wizard-overlay')) {
      event.preventDefault();
      this.closed.emit();
    }
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  async saveGoal(): Promise<void> {
    const type = this.selectedType();
    if (!type) return;

    const dto: CreateGoalDto = {
      type,
      title: this.effectiveTitle(),
      targetValue: this.targetValue(),
      targetUnit: GOAL_TYPE_INFO[type].defaultUnit,
      frequency: this.frequency(),
      ...(this.endDate() ? { endDate: this.endDate() } : {}),
    };

    const goal = await this.goalsService.createGoal(dto);

    if (goal) {
      // Award 5 carrots for creating a SMART goal
      this.rewardsService.awardCarrots(
        5,
        this.translate.instant('GOALS.REWARDS.CREATED', { title: this.effectiveTitle() }),
        'milestone'
      );
      this.saved.set(true);
      this.goalCreated.emit(goal);
    }
  }

  done(): void {
    this.closed.emit(); // parent closes the wizard
  }
}
