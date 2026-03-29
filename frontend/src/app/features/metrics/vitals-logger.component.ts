import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  afterNextRender,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MetricsService } from '../../core/metrics/metrics.service';
import { RewardsService } from '../../core/rewards/rewards.service';
import { ToastService } from '../../core/toast/toast.service';
import {
  VITAL_UNITS,
  VITAL_ICONS,
  type VitalLog,
  type VitalType,
} from '../../core/metrics/metrics.types';
// import { LucideHeartPulse } from '@lucide/angular';
import { TrendChartComponent, type TrendDataPoint } from '../../shared/components/trend-chart/trend-chart.component';

@Component({
  selector: 'app-vitals-logger',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule, 
    // LucideHeartPulse,
    TrendChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="vitals-shell" aria-label="Vitals logger charts">
      <!-- <header class="vitals-header">
        <div class="title-row">
          <span class="icon" aria-hidden="true">
            <svg lucideHeartPulse [size]="22" [strokeWidth]="2"></svg>
          </span>
          <div>
            <h3>{{ 'METRICS.VITALS.TITLE' | translate }}</h3>
            <p>{{ 'METRICS.CONSISTENCY_KEY' | translate }}</p>
          </div>
        </div>
      </header> -->

      <div class="charts-grid">
        @for (vt of vitalTypes; track vt) {
          <article class="chart-card">
            <div class="card-top">
              <div class="card-title-wrap">
                <span class="type-emoji" aria-hidden="true">{{ icons[vt] }}</span>
                <div class="title-copy">
                  <h4>{{ vitalLabelKeys[vt] | translate }}</h4>
                  @if (getLastReading(vt); as latest) {
                    <p class="reading-meta">
                      {{ 'METRICS.VITALS.LAST_READING' | translate }}:
                      <strong>{{ latest.value }} {{ latest.unit }}</strong>
                    </p>
                  } @else {
                    <p class="reading-meta empty">{{ 'METRICS.VITALS.NO_DATA' | translate }}</p>
                  }
                </div>
              </div>

              <button
                type="button"
                class="add-btn"
                (click)="openAddModal(vt)"
                [attr.aria-label]="'METRICS.VITALS.ADD_BUTTON_ARIA' | translate:{ vital: (vitalLabelKeys[vt] | translate) }"
              >
                <span aria-hidden="true">+</span>
                <span>{{ 'METRICS.VITALS.ADD_READING' | translate }}</span>
              </button>
            </div>

            <app-trend-chart
              [title]="vitalLabelKeys[vt] | translate"
              [subtitle]="'METRICS.LAST_7_DAYS' | translate"
              [data]="chartDataByType()[vt]"
              [unit]="chartUnit(vt)"
            />

            @if (!hasTypeData(vt) && !historyLoading()) {
              <p class="card-empty-hint">{{ 'METRICS.VITALS.ADD_FIRST_READING' | translate }}</p>
            }
          </article>
        }
      </div>

      @if (isModalOpen()) {
        <div
          class="modal-overlay"
          (click)="onOverlayClick($event)"
          (keydown.enter)="onOverlayKeydown($event)"
          (keydown.space)="onOverlayKeydown($event)"
          tabindex="0"
          role="dialog"
          aria-modal="true"
          aria-labelledby="addVitalModalTitle"
        >
          <div class="modal-panel">
            <h4 id="addVitalModalTitle" class="modal-title">
              {{ 'METRICS.VITALS.ADD_MODAL_TITLE' | translate:{ vital: currentModalVitalLabel() } }}
            </h4>

            <div class="form-group">
              <label class="field-label" for="vital-value-input">
                {{ 'METRICS.VITALS.VALUE_LABEL' | translate }}
              </label>
              <div class="input-wrap">
                <input
                  id="vital-value-input"
                  type="number"
                  min="0"
                  [ngModel]="modalValue()"
                  (ngModelChange)="modalValue.set($event)"
                  class="value-input"
                  [placeholder]="'0'"
                />
                <span class="unit-chip">{{ currentModalUnit() }}</span>
              </div>
            </div>

            <div class="form-group">
              <label class="field-label" for="vital-note-input">
                {{ 'METRICS.VITALS.NOTES_LABEL' | translate }}
              </label>
              <textarea
                id="vital-note-input"
                class="notes-input"
                [ngModel]="modalNotes()"
                (ngModelChange)="modalNotes.set($event)"
                rows="3"
                [placeholder]="'METRICS.VITALS.NOTES_PLACEHOLDER' | translate"
              ></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="closeAddModal()" [disabled]="submitting()">
                {{ 'common.cancel' | translate }}
              </button>
              <button type="button" class="btn-primary" (click)="submitVitalFromModal()" [disabled]="!canSubmit()">
                @if (submitting()) {
                  <span class="spinner"></span>
                } @else {
                  {{ 'METRICS.VITALS.LOG_VITAL' | translate }}
                }
              </button>
            </div>
          </div>
        </div>
      }
    </section>
  `,
  styles: [`
    .vitals-shell {
      background: linear-gradient(135deg, #f3e5f5 0%, #e8eaf6 100%);
      border-radius: 1.5rem;
      padding: 1.25rem;
      box-shadow: 0 4px 20px rgba(124, 77, 255, 0.1);
    }

    :host {
      display: block;
      width: 100%;
    }

    :host-context(.dark) .vitals-shell {
      background: linear-gradient(135deg, #1d2042 0%, #222748 100%);
      box-shadow: 0 8px 24px rgba(44, 40, 96, 0.45);
      border: 1px solid rgba(109, 118, 199, 0.32);
    }

    .vitals-header {
      margin-bottom: 1rem;
    }

    .title-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 0.875rem;
      color: white;
      background: linear-gradient(135deg, #7c4dff 0%, #5b21b6 100%);
      box-shadow: 0 6px 14px rgba(124, 77, 255, 0.35);
    }

    .title-row h3 {
      font-family: 'Satoshi', sans-serif;
      font-size: 1.125rem;
      font-weight: 800;
      color: #352169;
      margin: 0;
    }

    .title-row p {
      font-family: 'Satoshi', sans-serif;
      margin: 0.2rem 0 0;
      font-size: 0.8125rem;
      color: #5f6188;
    }

    :host-context(.dark) .title-row h3 {
      color: #dadfff;
    }

    :host-context(.dark) .title-row p {
      color: #b3b8de;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(1, minmax(0, 1fr));
      gap: 1rem;
      width: 100%;
    }

    @media (min-width: 900px) {
      .charts-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    .chart-card {
      background: rgba(255, 255, 255, 0.9);
      border-radius: 1.2rem;
      padding: 0.85rem;
      border: 1px solid rgba(124, 77, 255, 0.15);
      box-shadow: 0 6px 20px rgba(67, 56, 202, 0.08);
    }

    :host-context(.dark) .chart-card {
      background: rgba(20, 24, 47, 0.85);
      border-color: rgba(137, 148, 255, 0.25);
      box-shadow: 0 8px 20px rgba(3, 7, 30, 0.42);
    }

    .card-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .card-title-wrap {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 0;
    }

    .type-emoji {
      font-size: 1.5rem;
      line-height: 1;
      flex-shrink: 0;
    }

    .title-copy h4 {
      margin: 0;
      font-family: 'Satoshi', sans-serif;
      font-size: 0.9rem;
      font-weight: 800;
      color: #22223a;
    }

    :host-context(.dark) .title-copy h4 {
      color: #e8ecff;
    }

    .reading-meta {
      margin: 0.2rem 0 0;
      font-family: 'Satoshi', sans-serif;
      font-size: 0.72rem;
      color: #5f678a;
    }

    .reading-meta strong {
      color: #4736b6;
      font-weight: 800;
    }

    .reading-meta.empty {
      color: #8b90ac;
    }

    :host-context(.dark) .reading-meta {
      color: #b4bbde;
    }

    :host-context(.dark) .reading-meta strong {
      color: #d3c8ff;
    }

    .add-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      border: none;
      border-radius: 9999px;
      padding: 0.35rem 0.7rem;
      font-family: 'Satoshi', sans-serif;
      font-size: 0.72rem;
      font-weight: 700;
      color: white;
      background: linear-gradient(135deg, #7c4dff 0%, #5b21b6 100%);
      cursor: pointer;
      box-shadow: 0 6px 14px rgba(91, 33, 182, 0.32);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      flex-shrink: 0;
    }

    .add-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 18px rgba(91, 33, 182, 0.4);
    }

    .add-btn:focus-visible,
    .btn-primary:focus-visible,
    .btn-secondary:focus-visible,
    .value-input:focus-visible,
    .notes-input:focus-visible {
      outline: 2px solid #a78bfa;
      outline-offset: 2px;
    }

    .card-empty-hint {
      margin: 0.45rem 0 0;
      font-family: 'Satoshi', sans-serif;
      font-size: 0.75rem;
      color: #6d7399;
    }

    :host-context(.dark) .card-empty-hint {
      color: #aab0d4;
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 1100;
      background: rgba(15, 23, 42, 0.56);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      animation: fadeIn 0.2s ease;
    }

    .modal-panel {
      width: min(100%, 28rem);
      background: white;
      border-radius: 1.15rem;
      border: 1px solid #eceaf8;
      padding: 1rem;
      box-shadow: 0 20px 44px rgba(15, 23, 42, 0.24);
      animation: panelIn 0.24s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    :host-context(.dark) .modal-panel {
      background: #1d2445;
      border-color: rgba(129, 140, 248, 0.35);
    }

    .modal-title {
      margin: 0;
      font-family: 'Satoshi', sans-serif;
      font-size: 1rem;
      font-weight: 800;
      color: #1e1b4b;
    }

    :host-context(.dark) .modal-title {
      color: #e9e7ff;
    }

    .form-group {
      margin-top: 0.9rem;
    }

    .field-label {
      display: block;
      margin-bottom: 0.4rem;
      font-family: 'Satoshi', sans-serif;
      font-size: 0.73rem;
      font-weight: 700;
      color: #4b5563;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    :host-context(.dark) .field-label {
      color: #c7cced;
    }

    .input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .value-input,
    .notes-input {
      width: 100%;
      border-radius: 0.85rem;
      border: 2px solid #e8e7f4;
      background: #f9fafb;
      color: #1f2937;
      font-family: 'Satoshi', sans-serif;
      box-sizing: border-box;
      transition: border-color 0.2s ease;
    }

    .value-input {
      padding: 0.7rem 3.2rem 0.7rem 0.8rem;
      font-size: 1rem;
      font-weight: 700;
      -moz-appearance: textfield;
    }

    .value-input::-webkit-outer-spin-button,
    .value-input::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }

    .notes-input {
      resize: vertical;
      min-height: 5rem;
      padding: 0.7rem 0.8rem;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .value-input:focus,
    .notes-input:focus {
      outline: none;
      border-color: #8b5cf6;
    }

    :host-context(.dark) .value-input,
    :host-context(.dark) .notes-input {
      background: #10172f;
      border-color: #323b63;
      color: #edf0ff;
    }

    :host-context(.dark) .value-input:focus,
    :host-context(.dark) .notes-input:focus {
      border-color: #8b5cf6;
    }

    .unit-chip {
      position: absolute;
      right: 0.75rem;
      font-family: 'Satoshi', sans-serif;
      font-size: 0.74rem;
      font-weight: 800;
      color: #5b21b6;
      pointer-events: none;
    }

    :host-context(.dark) .unit-chip {
      color: #cabfff;
    }

    .modal-actions {
      margin-top: 1rem;
      display: flex;
      justify-content: flex-end;
      gap: 0.6rem;
    }

    .btn-secondary,
    .btn-primary {
      border-radius: 0.85rem;
      padding: 0.65rem 0.95rem;
      font-family: 'Satoshi', sans-serif;
      font-size: 0.85rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      min-width: 7rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .btn-secondary {
      color: #374151;
      background: #f3f4f6;
      border: 1px solid #d1d5db;
    }

    .btn-primary {
      color: white;
      background: linear-gradient(135deg, #7c4dff 0%, #5b21b6 100%);
      box-shadow: 0 6px 14px rgba(91, 33, 182, 0.3);
    }

    .btn-secondary:disabled,
    .btn-primary:disabled,
    .add-btn:disabled {
      opacity: 0.55;
      cursor: not-allowed;
      transform: none;
    }

    :host-context(.dark) .btn-secondary {
      color: #e6e7f8;
      background: #273055;
      border-color: #3c4670;
    }

    .spinner {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255, 255, 255, 0.35);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes panelIn {
      from { opacity: 0; transform: translateY(8px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 640px) {
      .add-btn span:last-child {
        display: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .chart-card,
      .add-btn,
      .modal-overlay,
      .modal-panel,
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
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  readonly historyLoading = signal(false);
  readonly weeklyLogs = signal<VitalLog[]>([]);
  readonly isModalOpen = signal(false);
  readonly modalType = signal<VitalType | null>(null);
  readonly modalValue = signal<number | null>(null);
  readonly modalNotes = signal('');
  readonly submitting = signal(false);

  // Expose lookup maps to template
  readonly icons = VITAL_ICONS;
  readonly units = VITAL_UNITS;

  readonly vitalLabelKeys: Record<VitalType, string> = {
    HEART_RATE: 'METRICS.VITALS.HEART_RATE',
    BLOOD_PRESSURE_SYSTOLIC: 'METRICS.VITALS.BLOOD_PRESSURE_SYSTOLIC',
    BLOOD_PRESSURE_DIASTOLIC: 'METRICS.VITALS.BLOOD_PRESSURE_DIASTOLIC',
    SLEEP_HOURS: 'METRICS.VITALS.SLEEP',
    STEPS: 'METRICS.VITALS.STEPS',
    WEIGHT: 'METRICS.VITALS.WEIGHT',
    BODY_TEMPERATURE: 'METRICS.VITALS.TEMPERATURE',
    OXYGEN_SATURATION: 'METRICS.VITALS.OXYGEN',
  };

  private readonly vitalTargets: Partial<Record<VitalType, number>> = {
    HEART_RATE: 75,
    BLOOD_PRESSURE_SYSTOLIC: 120,
    BLOOD_PRESSURE_DIASTOLIC: 80,
    SLEEP_HOURS: 8,
    STEPS: 10000,
    BODY_TEMPERATURE: 37,
    OXYGEN_SATURATION: 95,
  };

  private readonly weekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'short' });

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

  readonly latestByType = computed(() => {
    const today = this.metricsService.vitalsToday();
    return (today?.summary ?? {}) as Partial<Record<VitalType, { value: number; unit: string; loggedAt: string }>>;
  });

  readonly chartDataByType = computed<Record<VitalType, TrendDataPoint[]>>(() => {
    const byTypeAndDay = new Map<string, number>();

    for (const log of this.weeklyLogs()) {
      const key = `${log.type}::${this.toDateKey(new Date(log.loggedAt))}`;
      if (!byTypeAndDay.has(key)) {
        byTypeAndDay.set(key, log.value);
      }
    }

    const days = this.getLast7Days();
    const result = {} as Record<VitalType, TrendDataPoint[]>;

    for (const type of this.vitalTypes) {
      result[type] = days.map((date) => {
        const key = `${type}::${this.toDateKey(date)}`;
        const target = this.vitalTargets[type];
        const point: TrendDataPoint = {
          label: this.weekdayFormatter.format(date),
          value: byTypeAndDay.get(key) ?? 0,
        };

        if (typeof target === 'number') {
          point.target = target;
        }

        return point;
      });
    }

    return result;
  });

  readonly canSubmit = computed(() => {
    const type = this.modalType();
    const value = this.modalValue();
    return type !== null && value !== null && value > 0 && !this.submitting();
  });

  constructor() {
    afterNextRender(() => {
      void this.metricsService.loadVitalsToday();
      void this.loadWeeklyVitals();
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isModalOpen() && !this.submitting()) {
      this.closeAddModal();
    }
  }

  getLastReading(type: VitalType): { value: number; unit: string; loggedAt: string } | null {
    return this.latestByType()[type] ?? null;
  }

  hasTypeData(type: VitalType): boolean {
    return this.chartDataByType()[type].some((point) => point.value > 0);
  }

  chartUnit(type: VitalType): string {
    const unit = this.units[type];
    return unit === '%' ? '%' : ` ${unit}`;
  }

  currentModalUnit(): string {
    const type = this.modalType();
    return type ? this.units[type] : '';
  }

  currentModalVitalLabel(): string {
    const type = this.modalType();
    if (!type) return '';
    return this.translate.instant(this.vitalLabelKeys[type]);
  }

  openAddModal(type: VitalType): void {
    this.modalType.set(type);
    this.modalValue.set(null);
    this.modalNotes.set('');
    this.isModalOpen.set(true);
  }

  closeAddModal(): void {
    this.isModalOpen.set(false);
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay') && !this.submitting()) {
      this.closeAddModal();
    }
  }

  onOverlayKeydown(event: Event): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay') && !this.submitting()) {
      event.preventDefault();
      this.closeAddModal();
    }
  }

  async submitVitalFromModal(): Promise<void> {
    const type = this.modalType();
    const value = this.modalValue();
    if (!type || !value || value <= 0) return;

    this.submitting.set(true);
    const notes = this.modalNotes().trim();
    const success = await this.metricsService.logVital(type, value, VITAL_UNITS[type], notes || undefined);

    if (success) {
      this.rewardsService.awardCarrots(2, 'Vital logged', 'logging');
      await this.loadWeeklyVitals();
      this.closeAddModal();
      this.toast.success(this.translate.instant('METRICS.VITALS.SAVE_SUCCESS'));
    } else {
      this.toast.error(this.translate.instant('METRICS.VITALS.SAVE_ERROR'));
    }

    this.submitting.set(false);
  }

  private async loadWeeklyVitals(): Promise<void> {
    this.historyLoading.set(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      const logs = await this.metricsService.getVitals({ startDate: startDate.toISOString() });
      this.weeklyLogs.set(logs);
    } finally {
      this.historyLoading.set(false);
    }
  }

  private getLast7Days(): Date[] {
    const start = new Date();
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, idx) => {
      const date = new Date(start);
      date.setDate(start.getDate() + idx);
      return date;
    });
  }

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
