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
import { ProfileService, type Profile } from '../../core/profile/profile.service';
import { MedicalIdService } from '../../core/medical-id/medical-id.service';
import {
  VITAL_UNITS,
  VITAL_ICONS,
  type VitalLog,
  type VitalType,
} from '../../core/metrics/metrics.types';
import type { MedicalIdData } from '../medical-id/medical-id.types';
import { TrendChartComponent, type TrendDataPoint } from '../../shared/components/trend-chart/trend-chart.component';

type TimespanDays = 7 | 14 | 30;

interface VitalStats {
  avg: number;
  min: number;
  max: number;
  count: number;
}

interface PersonalizedRange {
  low: number;
  high: number;
  factors: string[];
  references: string[];
}

interface VitalInsightContext {
  age: number | null;
  fitnessLevel: string | null;
  conditions: string[];
  medications: string[];
}

interface ConditionFlags {
  hypertension: boolean;
  heart: boolean;
  respiratory: boolean;
  diabetes: boolean;
  thyroid: boolean;
}

interface MedicationFlags {
  betaBlocker: boolean;
  bloodPressureMedication: boolean;
  stimulant: boolean;
  sleepAid: boolean;
}

@Component({
  selector: 'app-vitals-logger',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    TrendChartComponent,
  ],
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

      <div class="timespan-toolbar" role="group" [attr.aria-label]="'METRICS.VITALS.TIMESPAN_LABEL' | translate">
        <span class="timespan-label">{{ 'METRICS.VITALS.TIMESPAN_LABEL' | translate }}</span>
        <div class="timespan-options">
          @for (days of timespanOptions; track days) {
            <button
              type="button"
              class="timespan-btn"
              [class.active]="selectedTimespan() === days"
              (click)="setTimespan(days)"
              [attr.aria-label]="'METRICS.VITALS.TIMESPAN_ARIA' | translate:{ days: days }"
            >
              {{ 'METRICS.VITALS.TIMESPAN_DAYS' | translate:{ days: days } }}
            </button>
          }
        </div>
      </div>

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

                  <div class="range-row">
                    <span class="normal-pill">
                      {{ 'METRICS.VITALS.NORMAL_RANGE' | translate }}:
                      <strong>{{ formatRange(vt) }}</strong>
                    </span>
                    <div
                      class="info-tip-wrap"
                      (mouseenter)="showTooltip(vt)"
                      (mouseleave)="hideTooltip(vt)"
                    >
                      <button
                        type="button"
                        class="info-tip-btn"
                        [attr.aria-label]="'METRICS.VITALS.OPEN_CONTEXT' | translate"
                        [attr.aria-expanded]="activeTooltipType() === vt"
                        [attr.aria-describedby]="activeTooltipType() === vt ? infoTooltipId(vt) : null"
                        (focus)="showTooltip(vt)"
                        (blur)="hideTooltip(vt)"
                        (click)="toggleTooltip(vt, $event)"
                      >
                        ⓘ
                      </button>

                      @if (activeTooltipType() === vt) {
                        <span
                          class="info-tooltip"
                          role="tooltip"
                          [id]="infoTooltipId(vt)"
                        >
                          {{ tooltipText(vt) }}
                        </span>
                      }
                    </div>
                  </div>
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
              [subtitle]="'METRICS.VITALS.LAST_X_DAYS' | translate:{ days: selectedTimespan() }"
              [data]="chartDataByType()[vt]"
              [unit]="chartUnit(vt)"
            />

            @if (getStats(vt); as stats) {
              <div class="stats-row">
                <span class="stat-chip">
                  {{ 'METRICS.VITALS.AVG' | translate }}
                  <strong>{{ formatVitalValue(vt, stats.avg) }}{{ chartUnit(vt) }}</strong>
                </span>
                <span class="stat-chip">
                  {{ 'METRICS.VITALS.MIN' | translate }}
                  <strong>{{ formatVitalValue(vt, stats.min) }}{{ chartUnit(vt) }}</strong>
                </span>
                <span class="stat-chip">
                  {{ 'METRICS.VITALS.MAX' | translate }}
                  <strong>{{ formatVitalValue(vt, stats.max) }}{{ chartUnit(vt) }}</strong>
                </span>
              </div>
            }

            <details class="insight-details">
              <summary>{{ 'METRICS.VITALS.HELPER_TITLE' | translate }}</summary>
              <p class="insight-copy">{{ 'METRICS.VITALS.HELPER_SUBTITLE' | translate }}</p>
              <p class="insight-disclaimer">{{ 'METRICS.VITALS.HELPER_DISCLAIMER' | translate }}</p>

              <div class="insight-block">
                <h5>{{ 'METRICS.VITALS.FACTORS_TITLE' | translate }}</h5>
                @if (getInsight(vt).factors.length > 0) {
                  <ul>
                    @for (factorKey of getInsight(vt).factors; track factorKey) {
                      <li>{{ factorKey | translate }}</li>
                    }
                  </ul>
                } @else {
                  <p class="insight-empty">{{ 'METRICS.VITALS.NO_FACTORS' | translate }}</p>
                }
              </div>

              <div class="insight-block refs">
                <h5>{{ 'METRICS.VITALS.REFERENCES_TITLE' | translate }}</h5>
                @if (getInsight(vt).references.length > 0) {
                  <ul>
                    @for (refKey of getInsight(vt).references; track refKey) {
                      <li>{{ refKey | translate }}</li>
                    }
                  </ul>
                } @else {
                  <p class="insight-empty">{{ 'METRICS.VITALS.NO_REFERENCES' | translate }}</p>
                }
              </div>
            </details>

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

    .timespan-toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.65rem;
      margin-bottom: 0.9rem;
    }

    .timespan-label {
      font-family: 'Satoshi', sans-serif;
      font-size: 0.72rem;
      font-weight: 800;
      color: #4c3e83;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    :host-context(.dark) .timespan-label {
      color: #b7bfe7;
    }

    .timespan-options {
      display: inline-flex;
      gap: 0.35rem;
      background: rgba(255, 255, 255, 0.72);
      border: 1px solid rgba(124, 77, 255, 0.2);
      border-radius: 9999px;
      padding: 0.2rem;
    }

    :host-context(.dark) .timespan-options {
      background: rgba(16, 23, 47, 0.8);
      border-color: rgba(129, 140, 248, 0.38);
    }

    .timespan-btn {
      border: none;
      border-radius: 9999px;
      padding: 0.35rem 0.62rem;
      font-family: 'Satoshi', sans-serif;
      font-size: 0.74rem;
      font-weight: 700;
      color: #5b4e8c;
      background: transparent;
      cursor: pointer;
      transition: background-color 0.2s ease, color 0.2s ease;
    }

    .timespan-btn:hover {
      background: rgba(124, 77, 255, 0.14);
    }

    .timespan-btn.active {
      color: white;
      background: linear-gradient(135deg, #7c4dff 0%, #5b21b6 100%);
      box-shadow: 0 6px 14px rgba(91, 33, 182, 0.25);
    }

    :host-context(.dark) .timespan-btn {
      color: #d9deff;
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

    .range-row {
      margin-top: 0.35rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
    }

    .normal-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      border-radius: 9999px;
      border: 1px solid rgba(124, 77, 255, 0.25);
      background: rgba(124, 77, 255, 0.08);
      padding: 0.2rem 0.5rem;
      font-family: 'Satoshi', sans-serif;
      font-size: 0.65rem;
      font-weight: 700;
      color: #4d3ea3;
    }

    .normal-pill strong {
      color: #3f2f99;
    }

    :host-context(.dark) .normal-pill {
      color: #d5ceff;
      border-color: rgba(165, 180, 252, 0.42);
      background: rgba(129, 140, 248, 0.2);
    }

    .info-tip-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
      min-width: 1.6rem;
      padding-bottom: 2rem;
    }

    .info-tip-wrap:hover .info-tooltip,
    .info-tip-wrap:focus-within .info-tooltip {
      opacity: 1;
      visibility: visible;
    }

    .info-tooltip {
      pointer-events: auto;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.15s ease, visibility 0.15s ease;
    }

    .info-tip-btn {
      border: 1px solid rgba(124, 77, 255, 0.3);
      background: rgba(255, 255, 255, 0.9);
      color: #5b21b6;
      width: 1.3rem;
      height: 1.3rem;
      border-radius: 9999px;
      font-size: 0.68rem;
      font-weight: 800;
      line-height: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: help;
      padding: 0;
      flex-shrink: 0;
    }

    .info-tip-btn:focus-visible {
      outline: 2px solid #a78bfa;
      outline-offset: 2px;
    }

    .info-tooltip {
      position: absolute;
      top: calc(100% + 0.35rem);
      right: 0;
      z-index: 12;
      width: min(16rem, calc(100vw - 2rem));
      border-radius: 0.7rem;
      border: 1px solid rgba(124, 77, 255, 0.28);
      background: #ffffff;
      padding: 0.5rem 0.6rem;
      font-family: 'Satoshi', sans-serif;
      font-size: 0.68rem;
      font-weight: 600;
      line-height: 1.35;
      color: #4338ca;
      box-shadow: 0 10px 20px rgba(67, 56, 202, 0.15);
    }

    :host-context(.dark) .info-tip-btn {
      color: #d9d3ff;
      border-color: rgba(167, 139, 250, 0.5);
      background: rgba(15, 23, 42, 0.75);
    }

    :host-context(.dark) .info-tooltip {
      color: #ddd6fe;
      border-color: rgba(167, 139, 250, 0.55);
      background: #1f2a4a;
      box-shadow: 0 12px 24px rgba(2, 6, 23, 0.5);
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

    .stats-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-top: 0.6rem;
    }

    .stat-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      border-radius: 9999px;
      padding: 0.2rem 0.58rem;
      font-family: 'Satoshi', sans-serif;
      font-size: 0.68rem;
      font-weight: 700;
      color: #4b5563;
      background: #f8fafc;
      border: 1px solid #e5e7eb;
    }

    .stat-chip strong {
      color: #4338ca;
      font-weight: 800;
    }

    :host-context(.dark) .stat-chip {
      color: #d8dcf6;
      background: #1f2a4a;
      border-color: #3c4670;
    }

    .insight-details {
      margin-top: 0.6rem;
      border: 1px solid rgba(129, 140, 248, 0.2);
      border-radius: 0.9rem;
      padding: 0.55rem 0.65rem;
      background: rgba(238, 242, 255, 0.35);
    }

    .insight-details summary {
      cursor: pointer;
      font-family: 'Satoshi', sans-serif;
      font-size: 0.72rem;
      font-weight: 800;
      color: #4338ca;
      list-style: none;
    }

    .insight-details summary::-webkit-details-marker {
      display: none;
    }

    .insight-copy,
    .insight-disclaimer,
    .insight-empty,
    .insight-block li {
      margin: 0.25rem 0 0;
      font-family: 'Satoshi', sans-serif;
      font-size: 0.7rem;
      color: #4b5563;
      line-height: 1.35;
    }

    .insight-disclaimer {
      color: #6b7280;
      font-style: italic;
    }

    .insight-block {
      margin-top: 0.45rem;
    }

    .insight-block h5 {
      margin: 0;
      font-family: 'Satoshi', sans-serif;
      font-size: 0.68rem;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      color: #6d28d9;
    }

    .insight-block ul {
      margin: 0.25rem 0 0;
      padding-left: 1rem;
    }

    .insight-block.refs li {
      color: #5b21b6;
    }

    :host-context(.dark) .insight-details {
      background: rgba(16, 23, 47, 0.75);
      border-color: rgba(129, 140, 248, 0.4);
    }

    :host-context(.dark) .insight-details summary {
      color: #c4b5fd;
    }

    :host-context(.dark) .insight-copy,
    :host-context(.dark) .insight-disclaimer,
    :host-context(.dark) .insight-empty,
    :host-context(.dark) .insight-block li {
      color: #d1d5f3;
    }

    :host-context(.dark) .insight-block h5 {
      color: #c4b5fd;
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
  private readonly profileService = inject(ProfileService);
  private readonly medicalIdService = inject(MedicalIdService);

  readonly historyLoading = signal(false);
  readonly rangeLogs = signal<VitalLog[]>([]);
  readonly isModalOpen = signal(false);
  readonly modalType = signal<VitalType | null>(null);
  readonly modalValue = signal<number | null>(null);
  readonly modalNotes = signal('');
  readonly submitting = signal(false);
  readonly selectedTimespan = signal<TimespanDays>(7);
  readonly activeTooltipType = signal<VitalType | null>(null);

  readonly timespanOptions: TimespanDays[] = [7, 14, 30];

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

  private readonly baseRanges: Record<VitalType, { low: number; high: number; references: string[] }> = {
    HEART_RATE: {
      low: 60,
      high: 100,
      references: ['METRICS.VITALS.REFERENCES.AHA_HEART_RATE'],
    },
    BLOOD_PRESSURE_SYSTOLIC: {
      low: 90,
      high: 120,
      references: ['METRICS.VITALS.REFERENCES.AHA_BLOOD_PRESSURE'],
    },
    BLOOD_PRESSURE_DIASTOLIC: {
      low: 60,
      high: 80,
      references: ['METRICS.VITALS.REFERENCES.AHA_BLOOD_PRESSURE'],
    },
    SLEEP_HOURS: {
      low: 7,
      high: 9,
      references: ['METRICS.VITALS.REFERENCES.CDC_SLEEP'],
    },
    STEPS: {
      low: 7000,
      high: 10000,
      references: ['METRICS.VITALS.REFERENCES.STEPS_GUIDANCE'],
    },
    WEIGHT: {
      low: 50,
      high: 90,
      references: ['METRICS.VITALS.REFERENCES.BMI_CONTEXT'],
    },
    BODY_TEMPERATURE: {
      low: 36.1,
      high: 37.5,
      references: ['METRICS.VITALS.REFERENCES.TEMPERATURE'],
    },
    OXYGEN_SATURATION: {
      low: 95,
      high: 100,
      references: ['METRICS.VITALS.REFERENCES.OXYGEN'],
    },
  };

  private readonly weekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
  private readonly shortDateFormatter = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
  private readonly decimalsByType: Partial<Record<VitalType, number>> = {
    SLEEP_HOURS: 1,
    WEIGHT: 1,
    BODY_TEMPERATURE: 1,
  };

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

    for (const log of this.rangeLogs()) {
      const key = `${log.type}::${this.toDateKey(new Date(log.loggedAt))}`;
      if (!byTypeAndDay.has(key)) {
        byTypeAndDay.set(key, log.value);
      }
    }

    const timespan = this.selectedTimespan();
    const days = this.getRecentDays(timespan);
    const result = {} as Record<VitalType, TrendDataPoint[]>;

    for (const type of this.vitalTypes) {
      result[type] = days.map((date) => {
        const key = `${type}::${this.toDateKey(date)}`;
        return {
          label: this.formatDateLabel(date, timespan),
          value: byTypeAndDay.get(key) ?? 0,
        };
      });
    }

    return result;
  });

  readonly statsByType = computed<Partial<Record<VitalType, VitalStats>>>(() => {
    const result: Partial<Record<VitalType, VitalStats>> = {};

    for (const type of this.vitalTypes) {
      const values = this.rangeLogs()
        .filter((log) => log.type === type && Number.isFinite(log.value))
        .map((log) => log.value);

      if (values.length === 0) continue;

      const sum = values.reduce((acc, value) => acc + value, 0);
      result[type] = {
        avg: sum / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length,
      };
    }

    return result;
  });

  readonly insightByType = computed<Record<VitalType, PersonalizedRange>>(() => {
    const profile = this.profileService.profile();
    const medicalId = this.medicalIdService.medicalId();
    const context = this.buildInsightContext(profile, medicalId);

    const result = {} as Record<VitalType, PersonalizedRange>;
    for (const type of this.vitalTypes) {
      result[type] = this.buildPersonalizedRange(type, context, profile);
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
      void Promise.all([
        this.metricsService.loadVitalsToday(),
        this.loadRangeVitals(),
        this.profileService.loadProfile(),
        this.medicalIdService.loadMedicalId(),
      ]);
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.activeTooltipType() !== null) {
      this.activeTooltipType.set(null);
    }

    if (this.isModalOpen() && !this.submitting()) {
      this.closeAddModal();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.closest('.info-tip-wrap')) {
      return;
    }

    if (this.activeTooltipType() !== null) {
      this.activeTooltipType.set(null);
    }
  }

  getLastReading(type: VitalType): { value: number; unit: string; loggedAt: string } | null {
    return this.latestByType()[type] ?? null;
  }

  hasTypeData(type: VitalType): boolean {
    return this.chartDataByType()[type].some((point) => point.value > 0);
  }

  getStats(type: VitalType): VitalStats | null {
    return this.statsByType()[type] ?? null;
  }

  getInsight(type: VitalType): PersonalizedRange {
    return this.insightByType()[type];
  }

  formatVitalValue(type: VitalType, value: number): string {
    const decimals = this.decimalsByType[type] ?? 0;
    return Number(value).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  formatRange(type: VitalType): string {
    const insight = this.insightByType()[type];
    return `${this.formatVitalValue(type, insight.low)}–${this.formatVitalValue(type, insight.high)}${this.chartUnit(type)}`;
  }

  tooltipText(type: VitalType): string {
    return this.translate.instant('METRICS.VITALS.TOOLTIP_TEXT', {
      range: this.formatRange(type),
    });
  }

  showTooltip(type: VitalType): void {
    this.activeTooltipType.set(type);
  }

  hideTooltip(type: VitalType): void {
    if (this.activeTooltipType() === type) {
      this.activeTooltipType.set(null);
    }
  }

  toggleTooltip(type: VitalType, event: Event): void {
    event.stopPropagation();
    this.activeTooltipType.update((current) => (current === type ? null : type));
  }

  infoTooltipId(type: VitalType): string {
    return `vital-info-tooltip-${type.toLowerCase()}`;
  }

  setTimespan(days: TimespanDays): void {
    if (this.selectedTimespan() === days || this.historyLoading()) return;
    this.selectedTimespan.set(days);
    void this.loadRangeVitals();
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
      await this.loadRangeVitals();
      this.closeAddModal();
      this.toast.success(this.translate.instant('METRICS.VITALS.SAVE_SUCCESS'));
    } else {
      this.toast.error(this.translate.instant('METRICS.VITALS.SAVE_ERROR'));
    }

    this.submitting.set(false);
  }

  private async loadRangeVitals(): Promise<void> {
    this.historyLoading.set(true);
    try {
      const days = this.selectedTimespan();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (days - 1));
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      const logs = await this.metricsService.getVitals({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      this.rangeLogs.set(logs);
    } finally {
      this.historyLoading.set(false);
    }
  }

  private getRecentDays(days: number): Date[] {
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    return Array.from({ length: days }, (_, idx) => {
      const date = new Date(start);
      date.setDate(start.getDate() + idx);
      return date;
    });
  }

  private formatDateLabel(date: Date, timespan: TimespanDays): string {
    if (timespan <= 7) {
      return this.weekdayFormatter.format(date);
    }

    return this.shortDateFormatter.format(date);
  }

  private buildInsightContext(profile: Profile | null, medicalId: MedicalIdData | null): VitalInsightContext {
    const age = this.resolveAge(profile?.dateOfBirth ?? null, medicalId?.age ?? null);
    const conditions = [
      ...(profile?.medicalConditions ?? []),
      ...(medicalId?.medicalConditions ?? []),
    ].map((entry) => entry.trim().toLowerCase()).filter(Boolean);

    const medications = [
      ...(profile?.currentMedications ?? []),
      ...(medicalId?.medications ?? []),
    ].map((entry) => entry.trim().toLowerCase()).filter(Boolean);

    return {
      age,
      fitnessLevel: profile?.fitnessLevel?.toLowerCase() ?? null,
      conditions,
      medications,
    };
  }

  private buildPersonalizedRange(
    type: VitalType,
    context: VitalInsightContext,
    profile: Profile | null,
  ): PersonalizedRange {
    const base = this.baseRanges[type];
    const range = { low: base.low, high: base.high };
    const factors: string[] = [];
    const references = [...base.references];

    this.applyAgeAdjustments(type, context.age, range, factors);
    this.applyFitnessAdjustments(type, context.fitnessLevel, range, factors);

    const conditionFlags = this.getConditionFlags(context.conditions);
    this.applyConditionAdjustments(type, conditionFlags, range, factors);

    const medicationFlags = this.getMedicationFlags(context.medications);
    this.applyMedicationAdjustments(type, medicationFlags, range, factors);

    if (type === 'WEIGHT') {
      const personalizedWeightRange = this.getWeightRangeFromProfile(profile);
      if (personalizedWeightRange) {
        range.low = personalizedWeightRange.low;
        range.high = personalizedWeightRange.high;
        factors.push('METRICS.VITALS.FACTORS.BMI_FROM_HEIGHT');
      }
    }

    this.normalizeRange(type, range);

    if (factors.length > 0) {
      references.push('METRICS.VITALS.REFERENCES.CLINICIAN');
    }

    return {
      low: range.low,
      high: range.high,
      factors: [...new Set(factors)],
      references: [...new Set(references)],
    };
  }

  private applyAgeAdjustments(
    type: VitalType,
    age: number | null,
    range: { low: number; high: number },
    factors: string[],
  ): void {
    if (age === null || age < 65) return;

    switch (type) {
      case 'HEART_RATE':
        range.high += 5;
        break;
      case 'BLOOD_PRESSURE_SYSTOLIC':
        range.high += 10;
        break;
      case 'BLOOD_PRESSURE_DIASTOLIC':
        range.high += 5;
        break;
      case 'STEPS':
        range.low = Math.max(4000, range.low - 2000);
        range.high = Math.max(6500, range.high - 1500);
        break;
      case 'SLEEP_HOURS':
        range.low = Math.max(6.5, range.low - 0.5);
        range.high = Math.max(7.5, range.high - 0.5);
        break;
      default:
        return;
    }

    factors.push('METRICS.VITALS.FACTORS.AGE_65_PLUS');
  }

  private applyFitnessAdjustments(
    type: VitalType,
    fitnessLevel: string | null,
    range: { low: number; high: number },
    factors: string[],
  ): void {
    if (fitnessLevel === 'active' || fitnessLevel === 'very_active') {
      switch (type) {
        case 'HEART_RATE':
          range.low = Math.max(45, range.low - 10);
          range.high = Math.min(90, range.high);
          break;
        case 'STEPS':
          range.low += 1500;
          range.high += 2000;
          break;
        default:
          return;
      }
      factors.push('METRICS.VITALS.FACTORS.FITNESS_ACTIVE');
      return;
    }

    if (fitnessLevel === 'sedentary' || fitnessLevel === 'light') {
      switch (type) {
        case 'HEART_RATE':
          range.high += 5;
          break;
        case 'STEPS':
          range.low = Math.max(4000, range.low - 1500);
          range.high = Math.max(6500, range.high - 1000);
          break;
        default:
          return;
      }
      factors.push('METRICS.VITALS.FACTORS.FITNESS_LOW');
    }
  }

  private getConditionFlags(conditions: string[]): ConditionFlags {
    return {
      hypertension: this.hasAnyKeyword(conditions, ['hypertension', 'high blood pressure', 'tension', 'pression']),
      heart: this.hasAnyKeyword(conditions, ['heart', 'cardiac', 'arrhythm', 'coronary', 'insuffisance cardiaque']),
      respiratory: this.hasAnyKeyword(conditions, ['asthma', 'asthme', 'copd', 'respir', 'pulmon', 'bpco']),
      diabetes: this.hasAnyKeyword(conditions, ['diabetes', 'diabète']),
      thyroid: this.hasAnyKeyword(conditions, ['thyroid', 'thyro']),
    };
  }

  private applyConditionAdjustments(
    type: VitalType,
    flags: ConditionFlags,
    range: { low: number; high: number },
    factors: string[],
  ): void {
    if (flags.hypertension && this.applyBloodPressureCap(type, range, 130, 80)) {
      factors.push('METRICS.VITALS.FACTORS.CONDITION_HYPERTENSION');
    }

    if (flags.heart) {
      let changed = false;
      if (type === 'HEART_RATE') {
        range.low = Math.max(50, range.low);
        range.high = Math.min(range.high, 95);
        changed = true;
      }

      changed = this.applyBloodPressureCap(type, range, 130, 80) || changed;
      if (changed) {
        factors.push('METRICS.VITALS.FACTORS.CONDITION_HEART');
      }
    }

    if (flags.respiratory && type === 'OXYGEN_SATURATION') {
      range.low = Math.min(range.low, 92);
      factors.push('METRICS.VITALS.FACTORS.CONDITION_RESPIRATORY');
    }

    if (flags.diabetes && this.applyBloodPressureCap(type, range, 130, 80)) {
      factors.push('METRICS.VITALS.FACTORS.CONDITION_DIABETES');
    }

    if (flags.thyroid && type === 'HEART_RATE') {
      range.low = Math.max(50, range.low - 3);
      range.high += 5;
      factors.push('METRICS.VITALS.FACTORS.CONDITION_THYROID');
    }
  }

  private getMedicationFlags(medications: string[]): MedicationFlags {
    return {
      betaBlocker: this.hasAnyKeyword(medications, [
        'beta blocker',
        'metoprolol',
        'atenolol',
        'bisoprolol',
        'carvedilol',
        'propranolol',
      ]),
      bloodPressureMedication: this.hasAnyKeyword(medications, [
        'lisinopril',
        'amlodipine',
        'losartan',
        'valsartan',
        'enalapril',
        'ramipril',
        'hydrochlorothiazide',
      ]),
      stimulant: this.hasAnyKeyword(medications, [
        'albuterol',
        'salbutamol',
        'methylphenidate',
        'amphetamine',
        'pseudoephedrine',
      ]),
      sleepAid: this.hasAnyKeyword(medications, ['melatonin', 'zolpidem', 'eszopiclone', 'trazodone']),
    };
  }

  private applyMedicationAdjustments(
    type: VitalType,
    flags: MedicationFlags,
    range: { low: number; high: number },
    factors: string[],
  ): void {
    if (flags.betaBlocker && type === 'HEART_RATE') {
      range.low = Math.max(45, range.low - 10);
      range.high = Math.min(range.high, 85);
      factors.push('METRICS.VITALS.FACTORS.MED_BETA_BLOCKER');
    }

    if (flags.bloodPressureMedication && this.applyBloodPressureCap(type, range, 130, 80)) {
      factors.push('METRICS.VITALS.FACTORS.MED_BP_MEDICATION');
    }

    if (flags.stimulant) {
      let changed = false;
      if (type === 'HEART_RATE') {
        range.high += 10;
        changed = true;
      }
      if (type === 'BLOOD_PRESSURE_SYSTOLIC') {
        range.high += 5;
        changed = true;
      }
      if (changed) {
        factors.push('METRICS.VITALS.FACTORS.MED_STIMULANT');
      }
    }

    if (flags.sleepAid && type === 'SLEEP_HOURS') {
      range.high += 0.5;
      factors.push('METRICS.VITALS.FACTORS.MED_SLEEP_AID');
    }
  }

  private applyBloodPressureCap(
    type: VitalType,
    range: { low: number; high: number },
    systolicCap: number,
    diastolicCap: number,
  ): boolean {
    if (type === 'BLOOD_PRESSURE_SYSTOLIC') {
      range.high = Math.min(range.high, systolicCap);
      return true;
    }

    if (type === 'BLOOD_PRESSURE_DIASTOLIC') {
      range.high = Math.min(range.high, diastolicCap);
      return true;
    }

    return false;
  }

  private normalizeRange(type: VitalType, range: { low: number; high: number }): void {
    if (type === 'OXYGEN_SATURATION') {
      range.low = Math.max(80, Math.min(range.low, 99));
      range.high = Math.min(100, Math.max(range.high, range.low + 1));
    }

    if (range.high <= range.low) {
      const minSpan = this.getMinimumSpan(type);
      range.high = range.low + minSpan;
    }
  }

  private getMinimumSpan(type: VitalType): number {
    if (type === 'STEPS') return 500;
    if (type === 'WEIGHT') return 3;
    return 1;
  }

  private resolveAge(dateOfBirth: string | null, fallbackAge: number | null): number | null {
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      if (!Number.isNaN(dob.getTime())) {
        const now = new Date();
        let age = now.getFullYear() - dob.getFullYear();
        const monthDiff = now.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
          age -= 1;
        }
        return Math.max(0, age);
      }
    }

    if (typeof fallbackAge === 'number' && Number.isFinite(fallbackAge) && fallbackAge >= 0) {
      return Math.floor(fallbackAge);
    }

    return null;
  }

  private hasAnyKeyword(values: string[], keywords: readonly string[]): boolean {
    return values.some((value) => keywords.some((keyword) => value.includes(keyword)));
  }

  private getWeightRangeFromProfile(profile: Profile | null): { low: number; high: number } | null {
    const heightCm = profile?.height;
    if (!heightCm || heightCm <= 0) return null;

    const heightM = heightCm / 100;
    const minWeight = 18.5 * heightM * heightM;
    const maxWeight = 24.9 * heightM * heightM;
    return {
      low: Math.round(minWeight * 10) / 10,
      high: Math.round(maxWeight * 10) / 10,
    };
  }

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
