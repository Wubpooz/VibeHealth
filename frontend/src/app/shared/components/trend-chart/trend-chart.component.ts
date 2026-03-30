import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { animate } from 'motion/mini';

export interface TrendDataPoint {
  label: string; // e.g., "Mon", "Tue", etc.
  value: number; // Actual value
  target?: number; // Optional goal/target line
}

@Component({
  selector: 'app-trend-chart',
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="trend-chart">
      <!-- Chart Header -->
      <div class="chart-header">
        <h3 class="chart-title">{{ title() }}</h3>
        @if (subtitle()) {
          <p class="chart-subtitle">{{ subtitle() }}</p>
        }
      </div>

      <!-- Chart Canvas -->
      <div class="chart-container">
        <!-- Y-axis labels -->
        <div class="y-axis">
          @for (tick of yAxisTicks(); track tick) {
            <span class="y-tick">{{ formatTick(tick) }}{{ unit() }}</span>
          }
        </div>

        <!-- Bars -->
        <div class="bars-container" [class.dense]="data().length > 14">
          <div class="grid-lines">
            @for (tick of yAxisTicks(); track tick) {
              <span class="grid-line" [style.bottom.%]="(tick / maxValue()) * 100"></span>
            }
          </div>
          @for (point of data(); track point.label; let i = $index) {
            <div class="bar-wrapper">
              <!-- Target line (if provided) -->
              @if (point.target !== undefined) {
                <div 
                  class="target-line"
                  [style.bottom.%]="getTargetPercent(point.target)"
                ></div>
              }
              
              <!-- Bar -->
              <div 
                #bar
                class="bar"
                [class.above-target]="point.target !== undefined && point.value >= point.target"
                [class.below-target]="point.target !== undefined && point.value < point.target"
                [style.height.%]="getValuePercent(point.value)"
                [style.animation-delay.s]="i * 0.05"
              >
                <div class="bar-value">{{ point.value }}{{ unit() }}</div>
              </div>
              
              <!-- X-axis label -->
              <span class="x-label" [class.suppressed]="!shouldShowXLabel(i, data().length)">
                {{ shouldShowXLabel(i, data().length) ? (point.label | translate) : '' }}
              </span>
            </div>
          }
        </div>
      </div>

      <!-- Legend (if target exists) -->
      @if (hasTargets()) {
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-dot above"></span>
            <span class="legend-text">{{ 'METRICS.CHARTS.GOAL_MET' | translate }}</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot below"></span>
            <span class="legend-text">{{ 'METRICS.CHARTS.BELOW_GOAL' | translate }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .trend-chart {
      width: 100%;
      padding: 1.5rem;
      background: white;
      border-radius: 1.5rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }

    :host-context(.dark) .trend-chart {
      background: #1f2937;
    }

    .chart-header {
      margin-bottom: 1.5rem;
    }

    .chart-title {
      font-family: 'Satoshi', sans-serif;
      font-weight: 600;
      font-size: 1.25rem;
      color: #1f2937;
      margin: 0 0 0.25rem 0;
    }

    :host-context(.dark) .chart-title {
      color: #f3f4f6;
    }

    .chart-subtitle {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0;
    }

    :host-context(.dark) .chart-subtitle {
      color: #9ca3af;
    }

    .chart-container {
      display: flex;
      gap: 1rem;
      height: 200px;
      position: relative;
      max-width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      padding-bottom: 0.5rem;
    }

    .y-axis {
      display: flex;
      flex-direction: column-reverse;
      justify-content: space-between;
      min-width: 3rem;
      padding: 0.5rem 0;
    }

    .y-tick {
      font-size: 0.75rem;
      color: #9ca3af;
      text-align: right;
    }

    :host-context(.dark) .y-tick {
      color: #6b7280;
    }

    .bars-container {
      position: relative;
      flex: 1;
      display: flex;
      align-items: flex-end;
      gap: 0.5rem;
      padding: 0.5rem 0;
      border-left: 1px solid #e5e7eb;
      border-bottom: 1px solid #e5e7eb;
      padding-left: 0.5rem;
      min-width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
    }

    .bars-container.dense {
      gap: 0.2rem;
      min-width: max(100%, 30rem);
    }

    .bars-container.dense .bar-wrapper {
      flex: 0 0 1rem;
      min-width: 1rem;
    }

    .bars-container:not(.dense) .bar-wrapper {
      flex: 1;
      min-width: 0;
    }

    .grid-lines {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
    }

    .grid-line {
      position: absolute;
      left: 0;
      right: 0;
      height: 1px;
      background: rgba(156, 163, 175, 0.3);
      transform: translateY(0.5px);
    }

    :host-context(.dark) .grid-line {
      background: rgba(113, 128, 150, 0.35);
    }

    :host-context(.dark) .bars-container {
      border-color: #374151;
    }

    .bar-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      height: 100%;
      min-width: 0;
    }

    .target-line {
      position: absolute;
      left: 0;
      right: 0;
      height: 2px;
      background: #f59e0b;
      border-radius: 2px;
      z-index: 1;
      opacity: 0.6;
    }

    :host-context(.dark) .target-line {
      background: #fbbf24;
    }

    :host-context(.dark) .bar {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
    }

    :host-context(.dark) .bar:hover {
      box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
    }

    .bar {
      width: 100%;
      min-height: 4px;
      background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
      border-radius: 0.5rem 0.5rem 0 0;
      position: relative;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      cursor: pointer;
      animation: barGrow 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      transform-origin: bottom;
    }

    @keyframes barGrow {
      from {
        transform: scaleY(0);
        opacity: 0;
      }
      to {
        transform: scaleY(1);
        opacity: 1;
      }
    }

    .bar:hover {
      transform: scaleY(1.05);
      box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
    }

    .bar.below-target {
      background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
    }

    .bar.below-target:hover {
      box-shadow: 0 4px 20px rgba(245, 158, 11, 0.3);
    }

    .bar-value {
      position: absolute;
      top: -1.5rem;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.75rem;
      font-weight: 600;
      color: #10b981;
      white-space: nowrap;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    :host-context(.dark) .bar-value {
      color: #34d399;
    }

    :host-context(.dark) .bar.below-target .bar-value {
      color: #fbbf24;
    }

    .bar.below-target .bar-value {
      color: #f59e0b;
    }

    :host-context([data-theme="dark"]) .bar.below-target .bar-value {
      color: #fbbf24;
    }

    .bar:hover .bar-value {
      opacity: 1;
    }

    .x-label {
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 0.5rem;
      text-align: center;
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .x-label.suppressed {
      color: transparent;
      user-select: none;
    }

    :host-context([data-theme="dark"]) .x-label {
      color: #9ca3af;
    }

    .chart-legend {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    :host-context([data-theme="dark"]) .chart-legend {
      border-color: #374151;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .legend-dot {
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 0.25rem;
    }

    .legend-dot.above {
      background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
    }

    .legend-dot.below {
      background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
    }

    .legend-text {
      font-size: 0.875rem;
      color: #6b7280;
    }

    :host-context(.dark) .legend-text {
      color: #9ca3af;
    }
  `],
})
export class TrendChartComponent implements AfterViewInit {
  @ViewChildren('bar') bars!: QueryList<ElementRef<HTMLElement>>;

  // Inputs
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly data = input.required<TrendDataPoint[]>();
  readonly unit = input<string>('');

  // Computed values
  private getNiceNumber(value: number): number {
    if (value <= 0) return 1;
    const log = Math.floor(Math.log10(value));
    const base = Math.pow(10, log);
    const normalized = value / base;

    let niceNormalized: number;
    if (normalized <= 1) niceNormalized = 1;
    else if (normalized <= 2) niceNormalized = 2;
    else if (normalized <= 5) niceNormalized = 5;
    else niceNormalized = 10;

    return niceNormalized * base;
  }

  readonly maxValue = computed(() => {
    const dataPoints = this.data();
    if (dataPoints.length === 0) return 100;

    const values = dataPoints.map(d => d.value);
    const targets = dataPoints
      .filter(d => d.target !== undefined)
      .map(d => d.target!);

    const allValues = [...values, ...targets];
    const max = Math.max(...allValues, 1);

    const rounded = this.getNiceNumber(max);
    const step = rounded / 4;

    return step > 0 ? step * 4 : 4;
  });

  readonly hasTargets = computed(() => {
    return this.data().some(d => d.target !== undefined);
  });

  readonly yAxisTicks = computed(() => {
    const max = this.maxValue();
    const step = max / 4;

    return [0, step, step * 2, step * 3, max];
  });

  formatTick(value: number): string {
    const rounded = Number.isInteger(value) ? value : Number(value.toFixed(1));
    return rounded.toLocaleString();
  }

  private valueToPercent(value: number): number {
    const max = this.maxValue();
    if (max <= 0) return 0;
    return Math.min(100, Math.max(0, (value / max) * 100));
  }

  getValuePercent(value: number): number {
    return this.valueToPercent(value);
  }

  getTargetPercent(value: number): number {
    return this.valueToPercent(value);
  }

  shouldShowXLabel(index: number, total: number): boolean {
    if (total <= 10) return true;
    if (total <= 20) return index % 2 === 0 || index === total - 1;
    return index % 3 === 0 || index === total - 1;
  }

  ngAfterViewInit(): void {
    // Animate bars on load
    this.bars.forEach((bar, index) => {
      animate(
        bar.nativeElement,
        { opacity: [0, 1], transform: ['scaleY(0)', 'scaleY(1)'] },
        { 
          duration: 0.6, 
          delay: index * 0.05,
          ease: [0.4, 0, 0.2, 1]
        }
      );
    });
  }
}
