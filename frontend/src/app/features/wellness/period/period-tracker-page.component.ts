import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  afterNextRender,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PeriodTrackerService } from '../../core/wellness/period-tracker.service';
import {
  SYMPTOMS_OPTIONS,
  SYMPTOMS_LABELS,
  FLOW_INTENSITY_OPTIONS,
  FLOW_INTENSITY_LABELS,
  type PeriodLog,
  type CycleInsights,
} from '../../core/wellness/period-tracker.types';

/**
 * PeriodTrackerPageComponent
 *
 * Calendar-based period tracking with:
 * - Custom calendar showing period days and predictions
 * - Sidebar/panel for logging period data
 * - Cycle insights card (next period prediction, fertile window)
 * - Symptom tracking with chips
 */
@Component({
  selector: 'app-period-tracker-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-[#fffaf8] to-white p-4 md:p-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-[#ff6b6b] to-[#ffa07a] bg-clip-text text-transparent mb-2">
          {{ 'wellness.period.title' | translate }}
        </h1>
        <p class="text-gray-600">{{ 'wellness.period.subtitle' | translate }}</p>
      </div>

      <!-- Main Grid: Calendar + Sidebar -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Calendar Section (Left - 2 cols on desktop) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Cycle Insights Card -->
          @if (cycleInsights(); as insights) {
            <div class="rounded-3xl bg-white p-6 shadow-sm border border-[rgba(255,107,107,0.1)] hover:border-[rgba(255,107,107,0.2)] transition-colors">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ 'wellness.period.cycleInsights' | translate }}</h2>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <!-- Data Points -->
                <div class="bg-gradient-to-br from-[#fff5f2] to-[#fffaf8] rounded-2xl p-4 text-center">
                  <p class="text-sm text-gray-600 mb-1">{{ 'wellness.period.dataPoints' | translate }}</p>
                  <p class="text-2xl font-bold text-[#ff6b6b]">{{ insights.dataPoints }}</p>
                </div>

                <!-- Avg Cycle Length -->
                @if (insights.averageCycleLength !== null) {
                  <div class="bg-gradient-to-br from-[#fff5f2] to-[#fffaf8] rounded-2xl p-4 text-center">
                    <p class="text-sm text-gray-600 mb-1">{{ 'wellness.period.avgCycleLength' | translate }}</p>
                    <p class="text-2xl font-bold text-[#ff8787]">{{ insights.averageCycleLength }} {{ 'wellness.period.days' | translate }}</p>
                  </div>
                }

                <!-- Avg Period Duration -->
                @if (insights.averagePeriodDuration !== null) {
                  <div class="bg-gradient-to-br from-[#fff5f2] to-[#fffaf8] rounded-2xl p-4 text-center">
                    <p class="text-sm text-gray-600 mb-1">{{ 'wellness.period.avgDuration' | translate }}</p>
                    <p class="text-2xl font-bold text-[#ff8787]">{{ insights.averagePeriodDuration }} {{ 'wellness.period.days' | translate }}</p>
                  </div>
                }

                <!-- Predicted Next Period -->
                @if (insights.predictedNextPeriodStart !== null) {
                  <div class="bg-gradient-to-br from-[#fff5f2] to-[#fffaf8] rounded-2xl p-4 text-center">
                    <p class="text-sm text-gray-600 mb-1">{{ 'wellness.period.nextPeriod' | translate }}</p>
                    <p class="text-sm font-semibold text-[#ff6b6b]">{{ formatDate(insights.predictedNextPeriodStart) }}</p>
                  </div>
                }
              </div>

              <!-- Fertile Window -->
              @if (insights.fertilityWindow !== null) {
                <div class="mt-4 p-4 bg-gradient-to-r from-[#d4f5e9] to-[#c5b4e3] bg-opacity-30 rounded-2xl">
                  <p class="text-sm font-semibold text-gray-700 mb-1">{{ 'wellness.period.fertileWindow' | translate }}</p>
                  <p class="text-sm text-gray-700">
                    {{ formatDate(insights.fertilityWindow.start) }} - {{ formatDate(insights.fertilityWindow.end) }}
                  </p>
                </div>
              }
            </div>
          }

          <!-- Calendar -->
          <div class="rounded-3xl bg-white p-6 shadow-sm border border-[rgba(255,107,107,0.1)]">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-lg font-semibold text-gray-900">{{ currentMonthYear() }}</h2>
              <div class="flex gap-2">
                <button
                  (click)="previousMonth()"
                  class="px-3 py-2 rounded-xl text-gray-600 hover:bg-[#fff5f2] transition-colors"
                >
                  ← {{ 'wellness.period.prev' | translate }}
                </button>
                <button
                  (click)="nextMonth()"
                  class="px-3 py-2 rounded-xl text-gray-600 hover:bg-[#fff5f2] transition-colors"
                >
                  {{ 'wellness.period.next' | translate }} →
                </button>
              </div>
            </div>

            <!-- Weekday Headers -->
            <div class="grid grid-cols-7 gap-2 mb-4">
              @for (day of weekDays; track day) {
                <div class="text-center text-sm font-semibold text-gray-600 py-2">{{ day }}</div>
              }
            </div>

            <!-- Calendar Grid -->
            <div class="grid grid-cols-7 gap-2">
              @for (date of calendarDates(); track date.dateString) {
                <button
                  (click)="selectDate(date)"
                  [disabled]="!date.isCurrentMonth"
                  [class.opacity-40]="!date.isCurrentMonth"
                  [class.cursor-pointer]="date.isCurrentMonth"
                  [class.cursor-default]="!date.isCurrentMonth"
                  [attr.aria-label]="'Period tracker date: ' + date.dateString"
                  class="aspect-square p-1 rounded-xl text-sm font-medium transition-all duration-200"
                  [ngClass]="{
                    'bg-gradient-to-br from-[#ff6b6b] to-[#ff8787] text-white': date.isPeriodDay,
                    'bg-gradient-to-br from-[#d4f5e9] to-[#b8e6d4] text-gray-900': date.isFertileDay,
                    'bg-gradient-to-br from-[#ffcc80] to-[#ffa07a] text-white': date.isNextPeriodDay,
                    'bg-[#fff5f2] text-gray-900 hover:bg-[#ffcccc] hover:bg-opacity-30': date.isCurrentMonth && !date.isPeriodDay && !date.isFertileDay && !date.isNextPeriodDay,
                    'text-gray-400': !date.isCurrentMonth,
                    'ring-2 ring-[#ff6b6b] ring-offset-2 ring-offset-white': date.isSelected
                  }"
                >
                  {{ date.day }}
                </button>
              }
            </div>

            <!-- Legend -->
            <div class="mt-6 flex flex-wrap gap-4 text-sm">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-[#ff6b6b]"></div>
                <span class="text-gray-700">{{ 'wellness.period.periodDay' | translate }}</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-[#d4f5e9]"></div>
                <span class="text-gray-700">{{ 'wellness.period.fertileDay' | translate }}</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-[#ffcc80]"></div>
                <span class="text-gray-700">{{ 'wellness.period.nextPeriodPredicted' | translate }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar: Log Period (Right - 1 col on desktop) -->
        <div class="lg:col-span-1">
          <div class="rounded-3xl bg-white p-6 shadow-sm border border-[rgba(255,107,107,0.1)] sticky top-4 space-y-4">
            <h3 class="text-lg font-semibold text-gray-900">{{ 'wellness.period.logPeriod' | translate }}</h3>

            <!-- Selected Date Display -->
            <div class="text-sm text-gray-600 p-3 bg-[#fff5f2] rounded-xl">
              {{ 'wellness.period.selected' | translate }}: <span class="font-semibold text-[#ff6b6b]">{{ formatDate(selectedDateFormatted()) }}</span>
            </div>

            <!-- Start Date Input -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ 'wellness.period.startDate' | translate }}</label>
              <input
                type="date"
                [(ngModel)]="logForm.startDate"
                class="w-full px-4 py-2 rounded-xl border border-[rgba(255,107,107,0.2)] focus:border-[#ff6b6b] focus:ring-2 focus:ring-[#ff6b6b] focus:ring-opacity-20 outline-none transition-all"
              />
            </div>

            <!-- End Date Input -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ 'wellness.period.endDate' | translate }} ({{ 'wellness.period.optional' | translate }})</label>
              <input
                type="date"
                [(ngModel)]="logForm.endDate"
                class="w-full px-4 py-2 rounded-xl border border-[rgba(255,107,107,0.2)] focus:border-[#ff6b6b] focus:ring-2 focus:ring-[#ff6b6b] focus:ring-opacity-20 outline-none transition-all"
              />
            </div>

            <!-- Flow Intensity -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ 'wellness.period.flowIntensity' | translate }}</label>
              <div class="flex gap-2">
                @for (intensity of FLOW_INTENSITY_OPTIONS; track intensity) {
                  <button
                    (click)="logForm.flowIntensity = intensity"
                    [class.ring-2]="logForm.flowIntensity === intensity"
                    [class.ring-[#ff6b6b]]="logForm.flowIntensity === intensity"
                    class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                    [ngClass]="{
                      'bg-gradient-to-r from-[#ff6b6b] to-[#ff8787] text-white': logForm.flowIntensity === intensity,
                      'bg-[#fff5f2] text-gray-700 hover:bg-[#ffcccc] hover:bg-opacity-20': logForm.flowIntensity !== intensity
                    }"
                  >
                    {{ FLOW_INTENSITY_LABELS[intensity] }}
                  </button>
                }
              </div>
            </div>

            <!-- Symptoms Chips -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ 'wellness.period.symptoms' | translate }}</label>
              <div class="flex flex-wrap gap-2">
                @for (symptom of SYMPTOMS_OPTIONS; track symptom) {
                  <button
                    (click)="toggleSymptom(symptom)"
                    [class.ring-2]="logForm.symptoms.includes(symptom)"
                    [class.ring-[#ff6b6b]]="logForm.symptoms.includes(symptom)"
                    class="px-3 py-1 rounded-full text-xs font-medium transition-all"
                    [ngClass]="{
                      'bg-gradient-to-r from-[#ff6b6b] to-[#ff8787] text-white': logForm.symptoms.includes(symptom),
                      'bg-[#fff5f2] text-gray-700 hover:bg-[#ffcccc] hover:bg-opacity-30': !logForm.symptoms.includes(symptom)
                    }"
                  >
                    {{ SYMPTOMS_LABELS[symptom] }}
                  </button>
                }
              </div>
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ 'wellness.period.notes' | translate }} ({{ 'wellness.period.optional' | translate }})</label>
              <textarea
                [(ngModel)]="logForm.notes"
                maxlength="500"
                rows="3"
                placeholder="Any additional notes..."
                class="w-full px-4 py-2 rounded-xl border border-[rgba(255,107,107,0.2)] focus:border-[#ff6b6b] focus:ring-2 focus:ring-[#ff6b6b] focus:ring-opacity-20 outline-none transition-all resize-none"
              ></textarea>
            </div>

            <!-- Submit Button -->
            <button
              (click)="savePeriodLog()"
              [disabled]="isSaving() || !isLogFormValid()"
              class="w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              [ngClass]="{
                'bg-gradient-to-r from-[#ff6b6b] to-[#ffa07a] hover:shadow-lg hover:shadow-[rgba(255,107,107,0.3)]': isLogFormValid() && !isSaving(),
                'bg-gray-300': !isLogFormValid() || isSaving()
              }"
            >
              @if (isSaving()) {
                {{ 'wellness.period.saving' | translate }}...
              } @else {
                {{ 'wellness.period.savePeriod' | translate }}
              }
            </button>

            <!-- Clear Button -->
            @if (selectedLog()) {
              <button
                (click)="deletePeriodLog(selectedLog()!.id)"
                [disabled]="isSaving()"
                class="w-full py-2 rounded-xl font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ 'wellness.period.deleteEntry' | translate }}
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Recent Logs -->
      <div class="rounded-3xl bg-white p-6 shadow-sm border border-[rgba(255,107,107,0.1)]">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ 'wellness.period.recentLogs' | translate }}</h2>

        @if (periodLogs().length > 0) {
          <div class="space-y-3">
            @for (log of periodLogs(); track log.id) {
              <div
                (click)="selectLog(log)"
                class="p-4 rounded-2xl border border-[rgba(255,107,107,0.1)] hover:border-[#ff6b6b] hover:bg-[#fff5f2] transition-all cursor-pointer"
                [class.border-[#ff6b6b]]="selectedLog()?.id === log.id"
                [class.bg-[#fff5f2]]="selectedLog()?.id === log.id"
              >
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <p class="font-semibold text-gray-900">{{ formatDate(log.startDate) }} - {{ log.endDate ? formatDate(log.endDate) : 'Ongoing' }}</p>
                    <p class="text-sm text-gray-600">{{ 'wellness.period.intensity' | translate }}: {{ FLOW_INTENSITY_LABELS[log.flowIntensity] }}</p>
                  </div>
                  <div class="px-3 py-1 rounded-full text-xs font-medium bg-[#fff5f2] text-[#ff6b6b]">
                    {{ log.symptoms.length }} {{ 'wellness.period.symptoms' | translate }}
                  </div>
                </div>
                @if (log.symptoms.length > 0) {
                  <div class="flex flex-wrap gap-1">
                    @for (symptom of log.symptoms; track symptom) {
                      <span class="inline-block px-2 py-1 rounded-lg text-xs bg-[#fff5f2] text-gray-700">
                        {{ SYMPTOMS_LABELS[symptom] }}
                      </span>
                    }
                  </div>
                }
              </div>
            }
          </div>
        } @else {
          <div class="text-center py-8">
            <p class="text-gray-600 mb-4">{{ 'wellness.period.noLogs' | translate }}</p>
            <p class="text-sm text-gray-500">{{ 'wellness.period.startLogging' | translate }}</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class PeriodTrackerPageComponent {
  private readonly periodTrackerService = inject(PeriodTrackerService);
  private readonly destroyRef = inject(DestroyRef);

  // Exported constants
  readonly FLOW_INTENSITY_OPTIONS = FLOW_INTENSITY_OPTIONS;
  readonly FLOW_INTENSITY_LABELS = FLOW_INTENSITY_LABELS;
  readonly SYMPTOMS_OPTIONS = SYMPTOMS_OPTIONS;
  readonly SYMPTOMS_LABELS = SYMPTOMS_LABELS;

  // Calendar state
  private readonly currentDate = signal(new Date());
  readonly selectedDate = signal<Date | null>(null);
  readonly weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Form state
  readonly logForm = signal({
    startDate: '',
    endDate: '',
    flowIntensity: 'MEDIUM' as const,
    symptoms: [] as string[],
    notes: '',
  });

  readonly isSaving = signal(false);
  readonly selectedLog = signal<PeriodLog | null>(null);

  // Service data (readonly)
  readonly periodLogs = this.periodTrackerService.periodLogs;
  readonly cycleInsights = this.periodTrackerService.cycleInsights;
  readonly periodLogsLoading = this.periodTrackerService.periodLogsLoading;

  // Computed values
  readonly currentMonthYear = computed(() => {
    const date = this.currentDate();
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
  });

  readonly selectedDateFormatted = computed(() => {
    const date = this.selectedDate();
    return date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  });

  readonly calendarDates = computed(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const dates = [];
    const periodLogs = this.periodLogs();
    const cycleInsights = this.cycleInsights();

    // Get period days set
    const periodDaySet = new Set<string>();
    periodLogs.forEach((log) => {
      const start = new Date(log.startDate);
      const end = log.endDate ? new Date(log.endDate) : start;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        periodDaySet.add(d.toISOString().split('T')[0]);
      }
    });

    // Get fertile window set
    const fertileDaySet = new Set<string>();
    if (cycleInsights?.fertilityWindow) {
      const start = new Date(cycleInsights.fertilityWindow.start);
      const end = new Date(cycleInsights.fertilityWindow.end);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        fertileDaySet.add(d.toISOString().split('T')[0]);
      }
    }

    // Get next period day
    const nextPeriodDay = cycleInsights?.predictedNextPeriodStart
      ? cycleInsights.predictedNextPeriodStart
      : null;

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -i);
      dates.unshift({
        day: prevDate.getDate(),
        dateString: prevDate.toISOString().split('T')[0],
        isCurrentMonth: false,
        isPeriodDay: false,
        isFertileDay: false,
        isNextPeriodDay: false,
        isSelected: false,
      });
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = new Date(year, month, i).toISOString().split('T')[0];
      const isPeriodDay = periodDaySet.has(dateStr);
      const isFertileDay = fertileDaySet.has(dateStr) && !isPeriodDay;
      const isNextPeriodDay = nextPeriodDay === dateStr && !isPeriodDay && !isFertileDay;
      const isSelected = this.selectedDate()?.toISOString().split('T')[0] === dateStr;

      dates.push({
        day: i,
        dateString: dateStr,
        isCurrentMonth: true,
        isPeriodDay,
        isFertileDay,
        isNextPeriodDay,
        isSelected,
      });
    }

    // Add empty cells for days after month ends
    const totalCells = Math.ceil(dates.length / 7) * 7;
    for (let i = 0; i < totalCells - dates.length; i++) {
      dates.push({
        day: i + 1,
        dateString: '',
        isCurrentMonth: false,
        isPeriodDay: false,
        isFertileDay: false,
        isNextPeriodDay: false,
        isSelected: false,
      });
    }

    return dates;
  });

  readonly isLogFormValid = computed(() => {
    return this.logForm().startDate.length > 0;
  });

  constructor() {
    afterNextRender(() => {
      this.initializeData();
      // Set today's date as default
      const today = new Date();
      this.selectedDate.set(today);
      this.logForm.update((form) => ({
        ...form,
        startDate: today.toISOString().split('T')[0],
      }));
    });
  }

  /**
   * Initialize data on component load
   */
  private initializeData(): void {
    this.periodTrackerService.fetchPeriodLogs(12, 0);
    this.periodTrackerService.fetchCycleInsights();
  }

  /**
   * Select a date on the calendar
   */
  selectDate(date: { dateString: string; isCurrentMonth: boolean; isPeriodDay: boolean }): void {
    if (!date.isCurrentMonth) return;

    const newDate = new Date(date.dateString);
    this.selectedDate.set(newDate);

    // Pre-fill form with this date
    this.logForm.update((form) => ({
      ...form,
      startDate: date.dateString,
      endDate: '',
    }));

    // Check if there's an existing log for this date
    const existingLog = this.periodLogs().find((log) => log.startDate === date.dateString);
    if (existingLog) {
      this.selectLog(existingLog);
    } else {
      this.selectedLog.set(null);
    }
  }

  /**
   * Select a log to view/edit
   */
  selectLog(log: PeriodLog): void {
    this.selectedLog.set(log);
    this.logForm.set({
      startDate: log.startDate,
      endDate: log.endDate || '',
      flowIntensity: log.flowIntensity,
      symptoms: [...log.symptoms],
      notes: log.notes || '',
    });

    const logDate = new Date(log.startDate);
    this.selectedDate.set(logDate);

    // Scroll to form (mobile-friendly)
    setTimeout(() => {
      const sidebar = document.querySelector('[sticky.top-4]');
      sidebar?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  /**
   * Toggle symptom in form
   */
  toggleSymptom(symptom: string): void {
    this.logForm.update((form) => {
      const symptoms = [...form.symptoms];
      const index = symptoms.indexOf(symptom);
      if (index >= 0) {
        symptoms.splice(index, 1);
      } else {
        symptoms.push(symptom);
      }
      return { ...form, symptoms };
    });
  }

  /**
   * Save period log
   */
  async savePeriodLog(): Promise<void> {
    if (!this.isLogFormValid()) return;

    this.isSaving.set(true);

    try {
      const form = this.logForm();
      const result = await this.periodTrackerService.savePeriodLog({
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        flowIntensity: form.flowIntensity,
        symptoms: form.symptoms,
        notes: form.notes || undefined,
      });

      if (result) {
        // Reset form on success
        this.resetForm();
        // Re-fetch to update calendar
        await this.periodTrackerService.fetchPeriodLogs(12, 0);
      }
    } finally {
      this.isSaving.set(false);
    }
  }

  /**
   * Delete period log
   */
  async deletePeriodLog(id: string): Promise<void> {
    if (!confirm('Are you sure you want to delete this period log?')) return;

    this.isSaving.set(true);

    try {
      const success = await this.periodTrackerService.deletePeriodLog(id);
      if (success) {
        this.resetForm();
        await this.periodTrackerService.fetchPeriodLogs(12, 0);
      }
    } finally {
      this.isSaving.set(false);
    }
  }

  /**
   * Navigate to previous month
   */
  previousMonth(): void {
    this.currentDate.update((date) => {
      const newDate = new Date(date);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  }

  /**
   * Navigate to next month
   */
  nextMonth(): void {
    this.currentDate.update((date) => {
      const newDate = new Date(date);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  }

  /**
   * Format date for display (YYYY-MM-DD to readable format)
   */
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  }

  /**
   * Reset form to initial state
   */
  private resetForm(): void {
    const today = new Date();
    this.logForm.set({
      startDate: today.toISOString().split('T')[0],
      endDate: '',
      flowIntensity: 'MEDIUM',
      symptoms: [],
      notes: '',
    });
    this.selectedLog.set(null);
  }
}
