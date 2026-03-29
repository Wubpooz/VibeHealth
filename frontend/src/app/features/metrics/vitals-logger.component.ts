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
import { TranslateModule } from '@ngx-translate/core';
import { MetricsService } from '../../core/metrics/metrics.service';
import { RewardsService } from '../../core/rewards/rewards.service';
import {
  VITAL_UNITS,
  VITAL_LABELS,
  VITAL_ICONS,
  type VitalType,
} from '../../core/metrics/metrics.types';
import { LucideHeartPulse } from '@lucide/angular';

@Component({
  selector: 'app-vitals-logger',
  imports: [CommonModule, FormsModule, TranslateModule, LucideHeartPulse],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="vitals-card">
      <!-- Header -->
      <div class="header">
        <div class="title-row">
          <span class="icon" aria-hidden="true">
            <svg lucideHeartPulse [size]="24" [strokeWidth]="2"></svg>
          </span>
          <h3>{{ 'METRICS.VITALS.TITLE' | translate }}</h3>
        </div>
        @if (lastReading()) {
          <span class="last-reading">
            {{ 'METRICS.VITALS.LAST_READING' | translate }}:
            <strong>{{ lastReading()!.value }} {{ lastReading()!.unit }}</strong>
          </span>
        }
      </div>

      <!-- Vital Type Grid -->
      <div class="type-grid">
        @for (vt of vitalTypes; track vt) {
          <button
            type="button"
            class="type-btn"
            [class.selected]="selectedType() === vt"
            (click)="selectType(vt)"
          >
            <span class="type-emoji">{{ icons[vt] }}</span>
            <span class="type-label">{{ labels[vt] }}</span>
            <span class="type-unit">{{ units[vt] }}</span>
          </button>
        }
      </div>

      <!-- Value Input (shown when type selected) -->
      @if (selectedType()) {
        <div class="input-row">
          <div class="input-wrapper">
            <input
              type="number"
              class="value-input"
              [placeholder]="'0'"
              [ngModel]="inputValue()"
              (ngModelChange)="inputValue.set($event)"
              min="0"
              [attr.aria-label]="labels[selectedType()!]"
            />
            <span class="unit-badge">{{ units[selectedType()!] }}</span>
          </div>
          <button
            class="submit-btn"
            [disabled]="!canSubmit()"
            (click)="logVital()"
          >
            @if (logging()) {
              <span class="spinner"></span>
            } @else {
              {{ 'METRICS.VITALS.LOG_VITAL' | translate }}
            }
          </button>
        </div>
      }

      <!-- Success flash -->
      @if (justLogged()) {
        <div class="success-flash">
          +2 carrots — {{ 'METRICS.VITALS.LAST_READING' | translate }} saved!
        </div>
      }
    </div>
  `,
  styles: [`
    .vitals-card {
      background: linear-gradient(135deg, #f3e5f5 0%, #e8eaf6 100%);
      border-radius: 1.5rem;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(124, 77, 255, 0.1);
    }

    :host-context(.dark) .vitals-card {
      background: linear-gradient(135deg, #1e1f3b 0%, #23263f 100%);
      box-shadow: 0 4px 20px rgba(78, 77, 157, 0.45);
      border: 1px solid rgba(102, 113, 198, 0.35);
    }

    :host-context(.dark) .title-row h3 {
      color: #c5c7ff;
    }

    :host-context(.dark) .last-reading {
      color: #ebe9ff;
      background: rgba(124, 77, 255, 0.22);
    }

    :host-context(.dark) .type-btn {
      background: #242846;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
      border-color: rgba(97, 96, 166, 0.3);
    }

    :host-context(.dark) .type-btn:hover:not(.selected) {
      border-color: rgba(178, 143, 255, 0.45);
    }

    :host-context(.dark) .type-btn.selected {
      border-color: #8578ff;
      background: linear-gradient(135deg, #272c5a 0%, #1b1d3d 100%);
      box-shadow: 0 4px 12px rgba(124, 77, 255, 0.35);
    }

    :host-context(.dark) .value-input {
      background: #1a1c33;
      color: #eef0ff;
      border: 2px solid #373d6c;
    }

    :host-context(.dark) .value-input:focus {
      border-color: #8578ff;
    }

    :host-context(.dark) .unit-badge {
      color: #b2b6ff;
    }

    :host-context(.dark) .submit-btn {
      box-shadow: 0 4px 12px rgba(124, 77, 255, 0.45);
    }

    :host-context(.dark) .success-flash {
      background: rgba(46, 125, 50, 0.25);
      color: #d7f4d5;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 0.5rem;
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
    }

    .title-row h3 {
      font-family: 'Satoshi', sans-serif;
      font-weight: 700;
      font-size: 1.125rem;
      color: #4527a0;
      margin: 0;
    }

    .last-reading {
      font-family: 'Satoshi', sans-serif;
      font-size: 0.75rem;
      color: #7c4dff;
      background: rgba(124, 77, 255, 0.1);
      padding: 0.25rem 0.75rem;
      border-radius: 2rem;
    }

    .last-reading strong {
      font-weight: 700;
    }

    .type-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .type-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.2rem;
      padding: 0.625rem 0.25rem;
      background: white;
      border: 2px solid transparent;
      border-radius: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
    }

    .type-btn:hover:not(.selected) {
      border-color: rgba(124, 77, 255, 0.3);
      transform: translateY(-1px);
    }

    .type-btn.selected {
      border-color: #7c4dff;
      background: linear-gradient(135deg, #f3e5f5 0%, #ede7f6 100%);
      box-shadow: 0 4px 12px rgba(124, 77, 255, 0.2);
    }

    .type-emoji {
      font-size: 1.375rem;
    }

    .type-label {
      font-family: 'Satoshi', sans-serif;
      font-size: 0.5625rem;
      font-weight: 600;
      color: #37474f;
      text-align: center;
      line-height: 1.2;
    }

    .type-unit {
      font-size: 0.5rem;
      color: #90a4ae;
    }

    .input-row {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      animation: slideDown 0.25s ease;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .input-wrapper {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
    }

    .value-input {
      width: 100%;
      padding: 0.75rem 3.5rem 0.75rem 1rem;
      font-family: 'Satoshi', sans-serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: #311b92;
      background: white;
      border: 2px solid #ede7f6;
      border-radius: 0.875rem;
      outline: none;
      transition: border-color 0.2s ease;
      -moz-appearance: textfield;
    }

    .value-input::-webkit-outer-spin-button,
    .value-input::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }

    .value-input:focus {
      border-color: #7c4dff;
    }

    .unit-badge {
      position: absolute;
      right: 0.75rem;
      font-family: 'Satoshi', sans-serif;
      font-size: 0.75rem;
      font-weight: 600;
      color: #7c4dff;
    }

    .submit-btn {
      flex-shrink: 0;
      padding: 0.75rem 1.25rem;
      background: linear-gradient(135deg, #7c4dff 0%, #651fff 100%);
      color: white;
      font-family: 'Satoshi', sans-serif;
      font-weight: 700;
      font-size: 0.875rem;
      border: none;
      border-radius: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(124, 77, 255, 0.3);
      min-width: 4.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(124, 77, 255, 0.4);
    }

    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .spinner {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .success-flash {
      margin-top: 0.75rem;
      padding: 0.625rem 1rem;
      background: rgba(46, 125, 50, 0.1);
      border-radius: 0.75rem;
      font-family: 'Satoshi', sans-serif;
      font-size: 0.8125rem;
      font-weight: 600;
      color: #2e7d32;
      animation: fadeInUp 0.3s ease, fadeOut 0.4s ease 1.6s forwards;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeOut {
      to { opacity: 0; }
    }

    @media (max-width: 480px) {
      .type-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 0.375rem;
      }

      .type-btn {
        padding: 0.5rem 0.125rem;
      }

      .type-emoji {
        font-size: 1.125rem;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .type-btn,
      .submit-btn,
      .input-row,
      .success-flash,
      .spinner {
        animation: none;
        transition: none;
      }
    }
  `],
})
export class VitalsLoggerComponent {
  private readonly metricsService = inject(MetricsService);
  private readonly rewardsService = inject(RewardsService);

  readonly selectedType = signal<VitalType | null>(null);
  readonly inputValue = signal<number | null>(null);
  readonly logging = signal(false);
  readonly justLogged = signal(false);

  // Expose lookup maps to template
  readonly icons = VITAL_ICONS;
  readonly labels = VITAL_LABELS;
  readonly units = VITAL_UNITS;

  readonly vitalTypes: VitalType[] = [
    'HEART_RATE',
    'STEPS',
    'SLEEP_HOURS',
    'WEIGHT',
    'BLOOD_PRESSURE_SYSTOLIC',
    'BLOOD_PRESSURE_DIASTOLIC',
    'BODY_TEMPERATURE',
    'OXYGEN_SATURATION',
  ];

  readonly lastReading = computed(() => {
    const today = this.metricsService.vitalsToday();
    const type = this.selectedType();
    if (!type || !today?.summary) return null;
    return (today.summary as Record<string, { value: number; unit: string; loggedAt: string } | undefined>)[type] ?? null;
  });

  readonly canSubmit = computed(
    () =>
      this.selectedType() !== null &&
      this.inputValue() !== null &&
      this.inputValue()! > 0 &&
      !this.logging(),
  );

  constructor() {
    afterNextRender(() => {
      this.metricsService.loadVitalsToday();
    });
  }

  selectType(type: VitalType): void {
    this.selectedType.set(type);
    this.inputValue.set(null);
  }

  async logVital(): Promise<void> {
    const type = this.selectedType();
    const value = this.inputValue();
    if (!type || !value || value <= 0) return;

    this.logging.set(true);
    const success = await this.metricsService.logVital(type, value, VITAL_UNITS[type]);

    if (success) {
      this.rewardsService.awardCarrots(2, 'Vital logged', 'logging');
      this.justLogged.set(true);
      this.inputValue.set(null);
      setTimeout(() => this.justLogged.set(false), 2200);
    }

    this.logging.set(false);
  }
}
