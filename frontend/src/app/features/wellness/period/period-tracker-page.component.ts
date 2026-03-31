import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  afterNextRender,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '../../../core/theme/theme.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LucideCalendarDays } from '@lucide/angular';
import { PeriodTrackerService } from '../../../core/wellness/period-tracker.service';
import {
  SYMPTOMS_OPTIONS,
  SYMPTOMS_LABELS,
  FLOW_INTENSITY_OPTIONS,
  FLOW_INTENSITY_LABELS,
  type PeriodLog,
  type FlowIntensity,
  type SymptomKey,
} from '../../../core/wellness/period-tracker.types';

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
  imports: [CommonModule, FormsModule, TranslateModule, PageHeaderComponent, LucideCalendarDays],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex flex-col bg-[#fdf8f8] dark:bg-gray-950 transition-colors duration-300">
      <!-- Page Header -->
      <app-page-header
        [title]="'WELLNESS.period.title' | translate"
        [backLabel]="'common.back_to_dashboard' | translate"
        [showBackLabel]="true"
      >
        <span pageHeaderIcon class="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <span class="text-red-500 inline-flex" aria-hidden="true">
            <svg lucideCalendarDays [size]="24" [strokeWidth]="2"></svg>
          </span>
        </span>
      </app-page-header>

      <main class="flex-1 px-4 sm:px-6 lg:px-8 py-8 pb-10">
        <!-- Main Grid: Calendar + Sidebar -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 max-w-7xl mx-auto w-full">
        <!-- Calendar Section (Left - 2 cols on desktop) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Cycle Insights Card -->
          @if (cycleInsights(); as insights) {
            <div class="rounded-3xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-200 dark:border-gray-800 hover:border-red-300 dark:hover:border-red-800 transition-colors">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{{ 'WELLNESS.period.cycleInsights' | translate }}</h2>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <!-- Data Points -->
                <div class="bg-gradient-to-br from-[#fff5f2] to-[#fffaf8] rounded-2xl p-4 text-center">
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">{{ 'WELLNESS.period.dataPoints' | translate }}</p>
                  <p class="text-2xl font-bold text-red-600 dark:text-red-400">{{ insights.dataPoints }}</p>
                </div>

                <!-- Avg Cycle Length -->
                @if (insights.averageCycleLength !== null) {
                  <div class="bg-gradient-to-br from-[#fff5f2] to-[#fffaf8] rounded-2xl p-4 text-center">
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">{{ 'WELLNESS.period.avgCycleLength' | translate }}</p>
                    <p class="text-2xl font-bold text-red-500 dark:text-red-400">{{ insights.averageCycleLength }} {{ 'WELLNESS.period.days' | translate }}</p>
                  </div>
                }

                <!-- Avg Period Duration -->
                @if (insights.averagePeriodDuration !== null) {
                  <div class="bg-gradient-to-br from-[#fff5f2] to-[#fffaf8] rounded-2xl p-4 text-center">
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">{{ 'WELLNESS.period.avgDuration' | translate }}</p>
                    <p class="text-2xl font-bold text-red-500 dark:text-red-400">{{ insights.averagePeriodDuration }} {{ 'WELLNESS.period.days' | translate }}</p>
                  </div>
                }

                <!-- Predicted Next Period -->
                @if (insights.predictedNextPeriodStart !== null) {
                  <div class="bg-gradient-to-br from-[#fff5f2] to-[#fffaf8] rounded-2xl p-4 text-center">
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">{{ 'WELLNESS.period.nextPeriodPredicted' | translate }}</p>
                    <p class="text-sm font-semibold text-red-600 dark:text-red-400">{{ formatDate(insights.predictedNextPeriodStart) }}</p>
                  </div>
                }
              </div>

              <!-- Fertile Window -->
              @if (insights.fertilityWindow !== null) {
                <div class="mt-4 p-4 bg-gradient-to-r from-green-50 dark:from-green-950/30 to-emerald-50 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-2xl">
                  <p class="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">{{ 'WELLNESS.period.fertileWindow' | translate }}</p>
                  <p class="text-sm text-gray-700 dark:text-gray-300">
                    {{ formatDate(insights.fertilityWindow.start) }} - {{ formatDate(insights.fertilityWindow.end) }}
                  </p>
                </div>
              }
            </div>
          }

          @if (periodLogsError()) {
            <div class="text-sm text-red-500 mb-4">{{ periodLogsError() | translate }}</div>
          }

          <!-- Calendar -->
          <div class="rounded-3xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-200 dark:border-gray-800">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ currentMonthYear() }}</h2>
              <div class="flex gap-2 w-full sm:w-auto">
                <button
                  (click)="previousMonth()"
                  class="flex-1 sm:flex-none px-3 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  ← {{ 'WELLNESS.period.previous' | translate }}
                </button>
                <button
                  (click)="nextMonth()"
                  class="flex-1 sm:flex-none px-3 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {{ 'WELLNESS.period.next' | translate }} →
                </button>
              </div>
            </div>

            <!-- Weekday Headers -->
            <div class="grid grid-cols-7 gap-2 mb-4">
              @for (day of weekDays; track day) {
                <div class="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2">{{ day | translate }}</div>
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
                    'bg-gradient-to-br from-red-600 to-red-500 dark:from-red-700 dark:to-red-600 text-white': date.isPeriodDay,
                    'bg-gradient-to-br from-green-200 dark:from-green-900/50 to-emerald-200 dark:to-emerald-900/50 text-gray-900 dark:text-white': date.isFertileDay,
                    'bg-gradient-to-br from-yellow-400 dark:from-yellow-900/50 to-orange-300 dark:to-orange-900/50 text-white': date.isNextPeriodDay,
                    'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700': date.isCurrentMonth && !date.isPeriodDay && !date.isFertileDay && !date.isNextPeriodDay,
                    'text-gray-400 dark:text-gray-600': !date.isCurrentMonth,
                    'ring-2 ring-red-500 dark:ring-red-400 ring-offset-2 dark:ring-offset-gray-900': date.isSelected
                  }"
                >
                  {{ date.day }}
                </button>
              }
            </div>

            <!-- Legend -->
            <div class="mt-6 flex flex-wrap gap-4 text-sm">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-red-600 dark:bg-red-400"></div>
                <span class="text-gray-700 dark:text-gray-300">{{ 'WELLNESS.period.periodDay' | translate }}</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-green-300 dark:bg-green-600"></div>
                <span class="text-gray-700 dark:text-gray-300">{{ 'WELLNESS.period.fertileDay' | translate }}</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-yellow-400 dark:bg-yellow-700"></div>
                <span class="text-gray-700 dark:text-gray-300">{{ 'WELLNESS.period.nextPeriodPredicted' | translate }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar: Log Period (Right - 1 col on desktop) -->
        <div class="lg:col-span-1">
          <div class="rounded-3xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-200 dark:border-gray-800 sticky top-4 space-y-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ 'WELLNESS.period.logPeriod' | translate }}</h3>

            <!-- Selected Date Display -->
            <div class="text-sm text-gray-600 dark:text-gray-400 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
              {{ 'WELLNESS.period.selectedDate' | translate }}: <span class="font-semibold text-red-600 dark:text-red-400">{{ formatDate(selectedDateFormatted()) }}</span>
            </div>

            <!-- Start Date Input -->
            <div>
                <label for="startDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ 'WELLNESS.period.startDate' | translate }}</label>
              <input
                id="startDate"
                type="date"
                [value]="logForm().startDate"
                (input)="updateFormField('startDate', $event)"
                class="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:ring-opacity-20 outline-none transition-all"
              />
            </div>

            <!-- End Date Input -->
            <div>
                <label for="endDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ 'WELLNESS.period.endDate' | translate }} ({{ 'common.optional' | translate }})</label>
              <input
                id="endDate"
                type="date"
                [value]="logForm().endDate"
                (input)="updateFormField('endDate', $event)"
                class="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:ring-opacity-20 outline-none transition-all"
              />
            </div>

            <!-- Flow Intensity -->
            <fieldset>
                <legend class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ 'WELLNESS.period.flowIntensityLabel' | translate }}</legend>
              <div class="flex gap-2">
                @for (intensity of FLOW_INTENSITY_OPTIONS; track intensity) {
                  <button
                    (click)="setFlowIntensity(intensity)"
                    [class.ring-2]="logForm().flowIntensity === intensity"
                    [class.ring-red-500]="logForm().flowIntensity === intensity"
                    [class.dark:ring-red-400]="logForm().flowIntensity === intensity"
                    class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                    [ngClass]="{
                      'bg-gradient-to-r from-red-600 to-red-500 dark:from-red-700 dark:to-red-600 text-white': logForm().flowIntensity === intensity,
                      'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700': logForm().flowIntensity !== intensity
                    }"
                  >
                    {{ FLOW_INTENSITY_LABELS[intensity] | translate }}
                  </button>
                }
              </div>
            </fieldset>

            <!-- Symptoms Chips -->
            <fieldset>
                <legend class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ 'WELLNESS.period.symptomsLabel' | translate }}</legend>
              <div class="flex flex-wrap gap-2">
                @for (symptom of SYMPTOMS_OPTIONS; track symptom) {
                  <button
                    (click)="toggleSymptom(symptom)"
                    [class.ring-2]="logForm().symptoms.includes(symptom)"
                    [class.ring-red-500]="logForm().symptoms.includes(symptom)"
                    [class.dark:ring-red-400]="logForm().symptoms.includes(symptom)"
                    class="px-3 py-1 rounded-full text-xs font-medium transition-all"
                    [ngClass]="{
                      'bg-gradient-to-r from-red-600 to-red-500 dark:from-red-700 dark:to-red-600 text-white': logForm().symptoms.includes(symptom),
                      'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700': !logForm().symptoms.includes(symptom)
                    }"
                  >
                    {{ SYMPTOMS_LABELS[symptom] | translate }}
                  </button>
                }
              </div>
            </fieldset>

            <!-- Notes -->
            <div>
                <label for="notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ 'WELLNESS.period.notes' | translate }} ({{ 'common.optional' | translate }})</label>
              <textarea
                id="notes"
                [value]="logForm().notes"
                (input)="updateFormField('notes', $event)"
                maxlength="500"
                rows="3"
                placeholder="{{ 'WELLNESS.period.notesPlaceholder' | translate }}"
                class="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:ring-opacity-20 outline-none transition-all resize-none"
              ></textarea>
            </div>

            <!-- Submit Button -->
            <button
              (click)="savePeriodLog()"
              [disabled]="isSaving() || !isLogFormValid()"
              class="w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              [ngClass]="{
                'bg-gradient-to-r from-red-600 to-red-500 dark:from-red-700 dark:to-red-600 hover:shadow-lg hover:shadow-red-500/30': isLogFormValid() && !isSaving(),
                'bg-gray-300 dark:bg-gray-700': !isLogFormValid() || isSaving()
              }"
            >
              @if (isSaving()) {
                {{ 'WELLNESS.period.saving' | translate }}...
              } @else {
                {{ 'WELLNESS.period.saveLog' | translate }}
              }
            </button>

            <!-- Clear Button -->
            @if (selectedLog()) {
              <button
                (click)="deletePeriodLog(selectedLog()!.id)"
                [disabled]="isSaving()"
                class="w-full py-2 rounded-xl font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  {{ 'WELLNESS.period.deleteEntry' | translate }}
              </button>
            }
          </div>
        </div>
      </div>

        <!-- Recent Logs -->
        <div class="rounded-3xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-200 dark:border-gray-800 max-w-7xl mx-auto w-full">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{{ 'WELLNESS.period.recentLogs' | translate }}</h2>

        @if (periodLogs().length > 0) {
          <div class="space-y-3">
            @for (log of periodLogs(); track log.id) {
              <button
                (click)="selectLog(log)"
                type="button"
                class="w-full text-left p-4 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer bg-transparent"
                [class.border-red-500]="selectedLog()?.id === log.id"
                [class.dark:border-red-400]="selectedLog()?.id === log.id"
                [class.bg-red-50]="selectedLog()?.id === log.id"
                [class.dark:bg-red-950/30]="selectedLog()?.id === log.id"
              >
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ formatDate(log.startDate) }} - {{ log.endDate ? formatDate(log.endDate) : ('WELLNESS.period.ongoing' | translate) }}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ 'WELLNESS.period.flowIntensityLabel' | translate }}: {{ FLOW_INTENSITY_LABELS[log.flowIntensity] | translate }}</p>
                  </div>
                  <div class="px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 whitespace-nowrap">
                      {{ log.symptoms.length }} {{ 'WELLNESS.period.symptomsLabel' | translate }}
                  </div>
                </div>
                @if (log.symptoms.length > 0) {
                  <div class="flex flex-wrap gap-1">
                    @for (symptom of log.symptoms; track symptom) {
                      <span class="inline-block px-2 py-1 rounded-lg text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {{ SYMPTOMS_LABELS[symptom] | translate }}
                      </span>
                    }
                  </div>
                }
              </button>
            }
          </div>
        } @else {
          <div class="text-center py-8">
            <p class="text-gray-600 dark:text-gray-400 mb-4">{{ 'WELLNESS.period.noLogs' | translate }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-500">{{ 'WELLNESS.period.startLogging' | translate }}</p>
          </div>
        }
        </div>
      </main>
    </div>
  `,
})
export class PeriodTrackerPageComponent {
  private readonly themeService = inject(ThemeService);
  private readonly periodTrackerService = inject(PeriodTrackerService);

  // Exported constants
  readonly FLOW_INTENSITY_OPTIONS = FLOW_INTENSITY_OPTIONS;
  readonly FLOW_INTENSITY_LABELS = FLOW_INTENSITY_LABELS;
  readonly SYMPTOMS_OPTIONS = SYMPTOMS_OPTIONS;
  readonly SYMPTOMS_LABELS = SYMPTOMS_LABELS;

  // Calendar state
  private readonly currentDate = signal(new Date());
  readonly selectedDate = signal<Date | null>(null);
  readonly weekDays = [
    'WELLNESS.period.weekday.sun',
    'WELLNESS.period.weekday.mon',
    'WELLNESS.period.weekday.tue',
    'WELLNESS.period.weekday.wed',
    'WELLNESS.period.weekday.thu',
    'WELLNESS.period.weekday.fri',
    'WELLNESS.period.weekday.sat',
  ];

  // Form state
  readonly logForm = signal({
    startDate: '',
    endDate: '',
    flowIntensity: 'MEDIUM' as FlowIntensity,
    symptoms: [] as SymptomKey[],
    notes: '',
  });

  readonly isSaving = signal(false);
  readonly selectedLog = signal<PeriodLog | null>(null);

  // Service data (readonly)
  readonly periodLogs = this.periodTrackerService.periodLogs;
  readonly cycleInsights = this.periodTrackerService.cycleInsights;
  readonly periodLogsLoading = this.periodTrackerService.periodLogsLoading;
  readonly periodLogsError = this.periodTrackerService.periodLogsError;

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

  /**
   * Update a form field value
   */
  updateFormField(field: 'startDate' | 'endDate' | 'notes', event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.logForm.update((form) => ({
      ...form,
      [field]: target.value,
    }));
  }

  /**
   * Set flow intensity
   */
  setFlowIntensity(intensity: FlowIntensity): void {
    this.logForm.update((form) => ({
      ...form,
      flowIntensity: intensity,
    }));
  }

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
  toggleSymptom(symptom: SymptomKey): void {
    this.logForm.update((form) => {
      const symptoms = form.symptoms.includes(symptom)
        ? form.symptoms.filter((s) => s !== symptom)
        : [...form.symptoms, symptom];
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
