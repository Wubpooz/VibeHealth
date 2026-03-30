import { Component, ChangeDetectionStrategy, inject, signal, computed, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MedicationService, Medication, MedicationReminder, MedicationRecurrence, OpenFdaDrugIntel } from '../../core/medical/medication.service';
import { ToastService } from '../../core/toast/toast.service';
import { AutocompleteComponent } from '../../shared/components/autocomplete/autocomplete.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LucidePill } from '@lucide/angular';
import { ReferenceDataService } from '../../core/reference-data/reference-data.service';

@Component({
  selector: 'app-medication-page',
  imports: [CommonModule, FormsModule, TranslateModule, AutocompleteComponent, PageHeaderComponent, LucidePill],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a]">
      <app-page-header
        [title]="'MEDICATION.TITLE' | translate"
        [subtitle]="'MEDICATION.SUBTITLE' | translate"
        [backLabel]="'common.back_to_dashboard' | translate"
        [showBackLabel]="true"
      >
        <span pageHeaderIcon class="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 text-primary-500 flex items-center justify-center" aria-hidden="true">
          <svg lucidePill [size]="20" [strokeWidth]="2"></svg>
        </span>
      </app-page-header>

      <div class="px-4 sm:px-6 lg:px-10 py-8 pb-24 space-y-5">

      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 shadow-sm">
        <form class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3" (submit)="submit($event)">
          <div class="sm:col-span-2 space-y-1">
            <div class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {{ 'MEDICATION.INPUT_NAME' | translate }}
            </div>
            <app-autocomplete
              [suggestions]="medicationSuggestions()"
              [selectedItems]="newNameSelection"
              [placeholder]="'MEDICATION.INPUT_NAME' | translate"
              [allowCustom]="true"
              [multiple]="false"
              (itemsChange)="onNewNameSelectionChange($event)"
            />
          </div>

          <div class="sm:col-span-2 space-y-1">
            <div class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {{ 'MEDICATION.INPUT_STANDARD_NAME' | translate }}
            </div>
            <app-autocomplete
              [suggestions]="medicationSuggestions()"
              [selectedItems]="newStandardNameSelection"
              [placeholder]="'MEDICATION.INPUT_STANDARD_NAME' | translate"
              [allowCustom]="true"
              [multiple]="false"
              (itemsChange)="onNewStandardNameSelectionChange($event)"
            />
          </div>

          <input
            type="text"
            name="notes"
            placeholder="{{ 'MEDICATION.INPUT_NOTES' | translate }}"
            [(ngModel)]="newNotes"
            class="sm:col-span-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm w-full"
          />

          <div class="sm:col-span-2 lg:col-span-3 space-y-2">
            <div class="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              <span>{{ 'MEDICATION.INPUT_DURATION' | translate }}</span>
              <span class="relative inline-flex items-center group">
                <button
                  type="button"
                  class="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold"
                  [attr.aria-label]="'MEDICATION.TOOLTIP_DURATION' | translate"
                >
                  ?
                </button>
                <span
                  role="tooltip"
                  class="pointer-events-none absolute left-0 top-full mt-2 w-56 rounded-lg bg-slate-900 text-white text-[11px] leading-relaxed px-2.5 py-2 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition"
                >
                  {{ 'MEDICATION.TOOLTIP_DURATION' | translate }}
                </span>
              </span>
            </div>
            <input
              type="number"
              name="duration"
              placeholder="{{ 'MEDICATION.INPUT_DURATION' | translate }}"
              [(ngModel)]="newDuration"
              class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm w-full"
              min="1"
              max="365"
            />
            <div class="flex flex-wrap gap-2">
              @for (days of durationQuickPicks; track days) {
                <button
                  type="button"
                  class="px-2.5 py-1 text-xs rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition"
                  (click)="setNewDuration(days)"
                >
                  {{ days }} {{ 'MEDICATION.DAYS' | translate }}
                </button>
              }
            </div>
          </div>

          <button
            type="submit"
            class="sm:col-span-2 lg:col-span-3 rounded-xl bg-emerald-500 text-white font-semibold px-4 py-2 hover:bg-emerald-600 transition"
            [disabled]="medicationService.loading() || !newName.trim()"
          >
            {{ 'MEDICATION.ADD_BUTTON' | translate }}
          </button>
        </form>

        @if (quickMedicationSuggestions().length > 0) {
          <div class="flex flex-wrap gap-2">
            @for (suggestion of quickMedicationSuggestions(); track suggestion) {
              <button
                type="button"
                class="px-3 py-1.5 text-xs rounded-full border border-rose-200 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/35 transition"
                (click)="prefillMedication(suggestion)"
              >
                {{ suggestion }}
              </button>
            }
          </div>
        }

        @if (medicationService.error()) {
          <div class="text-red-600 dark:text-red-300 text-sm">
            {{ medicationService.error() }}
          </div>
        }
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-sm">
        <h2 class="text-lg font-semibold">{{ 'MEDICATION.INTEL_TITLE' | translate }}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- TODO make use of autocomplete to help input medicine name with a separator between my current medications and the list of all the medications in the dropdown -->
          <input
            type="text"
            [(ngModel)]="drugSearchTerm"
            placeholder="{{ 'MEDICATION.INTEL_INPUT' | translate }}"
            class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm w-full"
          />
          <button
            class="rounded-xl bg-indigo-500 text-white font-semibold px-4 py-2 hover:bg-indigo-600 transition"
            (click)="searchDrugInfo()"
            [disabled]="drugIntelLoading()"
          >
            {{ 'MEDICATION.INTEL_LOOKUP' | translate }}
          </button>
        </div>

        @if (drugIntelError()) {
          <div class="text-red-600 dark:text-red-300 text-sm">{{ drugIntelError() }}</div>
        }

        @if (drugIntelLoading()) {
          <div class="text-sm text-slate-500 dark:text-slate-300">{{ 'MEDICATION.INTEL_LOADING' | translate }}</div>
        }

        @if (drugIntel(); as intel) {
          <div class="mt-2 space-y-2">
            <p class="text-sm font-semibold">{{ 'MEDICATION.INTEL_DRUG' | translate }}: {{ intel.officialName || intel.name }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ 'MEDICATION.INTEL_SOURCE' | translate }}</p>

            @if (intel.warnings.length > 0) {
              <div class="bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                <p class="text-xs font-semibold">{{ 'MEDICATION.INTEL_WARNINGS' | translate }}</p>
                <ul class="list-disc list-inside text-xs space-y-1">
                  @for (warning of intel.warnings; track warning) {
                    <li>{{ warning }}</li>
                  }
                </ul>
              </div>
            }

            @if (intel.sideEffects.length > 0) {
              <div class="bg-red-50 dark:bg-red-900/20 p-2 rounded">
                <p class="text-xs font-semibold">{{ 'MEDICATION.INTEL_SIDE_EFFECTS' | translate }}</p>
                <ul class="list-disc list-inside text-xs space-y-1">
                  @for (effect of intel.sideEffects; track effect) {
                    <li>{{ effect }}</li>
                  }
                </ul>
              </div>
            }

            @if (intel.interactions.length > 0) {
              <div class="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                <p class="text-xs font-semibold">{{ 'MEDICATION.INTEL_INTERACTIONS' | translate }}</p>
                <ul class="list-disc list-inside text-xs space-y-1">
                  @for (interaction of intel.interactions; track interaction) {
                    <li>{{ interaction }}</li>
                  }
                </ul>
              </div>
            }

            @if (intel.dosage.length > 0) {
              <div class="bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded">
                <p class="text-xs font-semibold">{{ 'MEDICATION.INTEL_DOSAGE' | translate }}</p>
                <ul class="list-disc list-inside text-xs space-y-1">
                  @for (dose of intel.dosage; track dose) {
                    <li>{{ dose }}</li>
                  }
                </ul>
              </div>
            }
          </div>
        }
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <h2 class="text-lg font-semibold mb-3">{{ 'MEDICATION.LIST_TITLE' | translate }}</h2>

        @if (medicationService.loading()) {
          <div class="text-sm text-slate-500 dark:text-slate-300">{{ 'MEDICATION.LOADING' | translate }}</div>
        }
        @if (!medicationService.loading() && medications().length === 0) {
          <div class="text-sm text-slate-500 dark:text-slate-300">{{ 'MEDICATION.NO_RESULTS' | translate }}</div>
        }

        <ul class="space-y-2">
          @for (med of medications(); track med.id) {
            <li class="rounded-xl border border-slate-200 dark:border-slate-700 p-3 flex flex-col gap-3">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p class="font-semibold text-slate-900 dark:text-white">{{ med.name }}</p>
                  @if (med.standardName) {
                    <p class="text-xs text-slate-500 dark:text-slate-400">{{ 'MEDICATION.STANDARD_NAME' | translate }}: {{ med.standardName }}</p>
                  }
                  @if (med.notes) {
                    <p class="text-xs text-slate-500 dark:text-slate-400">{{ med.notes }}</p>
                  }
                  @if (med.duration) {
                    <p class="text-xs text-slate-500 dark:text-slate-400">{{ 'MEDICATION.DURATION' | translate }}: {{ med.duration }} {{ 'MEDICATION.DAYS' | translate }}</p>
                  }
                </div>
                <div class="flex gap-2">
                  <button class="rounded-lg border border-slate-300 dark:border-slate-700 px-2 py-1 text-xs" (click)="startEdit(med)">{{ 'common.edit' | translate }}</button>
                  <button class="rounded-lg border border-blue-300 text-blue-600 dark:border-blue-700 dark:text-blue-300 px-2 py-1 text-xs" (click)="startAddReminder(med.id)">{{ 'MEDICATION.ADD_REMINDER' | translate }}</button>
                  <button class="rounded-lg border border-red-300 text-red-600 dark:border-red-700 dark:text-red-300 px-2 py-1 text-xs" (click)="removeMedication(med.id)">{{ 'common.delete' | translate }}</button>
                </div>
              </div>

              <!-- Reminders for this medication -->
              @if (med.reminders.length > 0) {
                <div class="border-t border-slate-200 dark:border-slate-700 pt-3">
                  <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{{ 'MEDICATION.REMINDERS' | translate }}</h4>
                  <div class="space-y-1">
                    @for (reminder of med.reminders; track reminder.id) {
                      <div class="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-lg p-2">
                        <div class="flex items-center gap-3">
                          <span class="text-sm font-mono">{{ reminder.timeOfDay }}</span>
                          <span class="text-sm">{{ reminder.dosage }}</span>
                          <span class="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">{{ 'MEDICATION.RECURRENCE_' + reminder.recurrence | translate }}</span>
                          @if (reminder.recurrence === 'WEEKLY' && reminder.dayOfWeek) {
                            <span class="text-xs text-slate-500 dark:text-slate-300">{{ 'MEDICATION.WEEKDAY_' + ['','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'][reminder.dayOfWeek] | translate }}</span>
                          }
                          @if (reminder.recurrence === 'MONTHLY' && reminder.dayOfMonth) {
                            <span class="text-xs text-slate-500 dark:text-slate-300">{{ reminder.dayOfMonth }}{{ getOrdinalSuffix(reminder.dayOfMonth) }}</span>
                          }
                          @if (reminder.recurrence === 'ONE_TIME' && reminder.date) {
                            <span class="text-xs text-slate-500 dark:text-slate-300">{{ reminder.date | date:'shortDate' }}</span>
                          }
                        </div>
                        <div class="flex gap-1">
                          <button class="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded" (click)="startEditReminder(med.id, reminder)">{{ 'common.edit' | translate }}</button>
                          <button class="text-xs px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded" (click)="removeReminder(med.id, reminder.id)">{{ 'common.delete' | translate }}</button>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            </li>
          }
        </ul>
      </div>

      <!-- Upcoming Reminders -->
      @if (upcomingReminders().length > 0) {
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <h2 class="text-lg font-semibold mb-3">{{ 'MEDICATION.UPCOMING_REMINDERS' | translate }}</h2>
          <div class="space-y-2">
            @for (item of upcomingReminders(); track item.reminder.id) {
              <div class="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <div>
                  <p class="font-semibold">{{ item.medication.name }}</p>
                  <p class="text-sm text-slate-600 dark:text-slate-400">{{ item.reminder.dosage }} at {{ item.reminder.timeOfDay }}</p>
                </div>
                <span class="text-sm font-mono text-blue-600 dark:text-blue-400">{{ item.reminder.timeOfDay }}</span>
              </div>
            }
          </div>
        </div>
      }

      <!-- Refill Alerts -->
      @if (refillAlerts().length > 0) {
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <h2 class="text-lg font-semibold mb-3">{{ 'MEDICATION.REFILL_ALERTS' | translate }}</h2>
          <div class="space-y-2">
            @for (alert of refillAlerts(); track alert.medication.id) {
              <div class="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                <div>
                  <p class="font-semibold">{{ alert.medication.name }}</p>
                  <p class="text-sm text-slate-600 dark:text-slate-400">{{ alert.daysLeft }} {{ 'MEDICATION.DAYS_LEFT' | translate }}</p>
                </div>
                <span class="text-sm font-semibold text-amber-600 dark:text-amber-400">{{ alert.daysLeft }}d</span>
              </div>
            }
          </div>
        </div>
      }

      <!-- Edit Medication Form -->
      @if (isEditing()) {
        <div class="bg-yellow-50 dark:bg-yellow-900/30 rounded-2xl p-4">
          <h3 class="font-semibold mb-2">{{ 'MEDICATION.EDIT_TITLE' | translate }}</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div class="sm:col-span-2">
              <app-autocomplete
                [suggestions]="medicationSuggestions()"
                [selectedItems]="editedNameSelection"
                [placeholder]="'MEDICATION.INPUT_NAME' | translate"
                [allowCustom]="true"
                [multiple]="false"
                (itemsChange)="onEditedNameSelectionChange($event)"
              />
            </div>
            <div class="sm:col-span-2">
              <app-autocomplete
                [suggestions]="medicationSuggestions()"
                [selectedItems]="editedStandardNameSelection"
                [placeholder]="'MEDICATION.INPUT_STANDARD_NAME' | translate"
                [allowCustom]="true"
                [multiple]="false"
                (itemsChange)="onEditedStandardNameSelectionChange($event)"
              />
            </div>
            <input type="text" [(ngModel)]="editedNotes" class="sm:col-span-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2" placeholder="{{ 'MEDICATION.INPUT_NOTES' | translate }}" />
            <div class="sm:col-span-2 lg:col-span-3 space-y-2">
              <div class="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                <span>{{ 'MEDICATION.INPUT_DURATION' | translate }}</span>
                <span class="relative inline-flex items-center group">
                  <button
                    type="button"
                    class="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold"
                    [attr.aria-label]="'MEDICATION.TOOLTIP_DURATION' | translate"
                  >
                    ?
                  </button>
                  <span
                    role="tooltip"
                    class="pointer-events-none absolute left-0 top-full mt-2 w-56 rounded-lg bg-slate-900 text-white text-[11px] leading-relaxed px-2.5 py-2 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition"
                  >
                    {{ 'MEDICATION.TOOLTIP_DURATION' | translate }}
                  </span>
                </span>
              </div>
              <input type="number" [(ngModel)]="editedDuration" class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 w-full" placeholder="{{ 'MEDICATION.INPUT_DURATION' | translate }}" min="1" max="365" />
              <div class="flex flex-wrap gap-2">
                @for (days of durationQuickPicks; track days) {
                  <button
                    type="button"
                    class="px-2.5 py-1 text-xs rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
                    (click)="setEditedDuration(days)"
                  >
                    {{ days }} {{ 'MEDICATION.DAYS' | translate }}
                  </button>
                }
              </div>
            </div>
            <button class="sm:col-span-2 lg:col-span-3 rounded-xl bg-blue-600 text-white px-4 py-2" (click)="submitEdit()">{{ 'MEDICATION.SAVE_BUTTON' | translate }}</button>
            <button class="sm:col-span-2 lg:col-span-3 rounded-xl border border-slate-300 px-4 py-2" (click)="cancelEdit()">{{ 'common.cancel' | translate }}</button>
          </div>
        </div>
      }

      <!-- Add Reminder Form -->
      @if (isAddingReminder() && !isEditingReminder()) {
        <div class="bg-green-50 dark:bg-green-900/30 rounded-2xl p-4">
          <h3 class="font-semibold mb-2">{{ 'MEDICATION.ADD_REMINDER_TITLE' | translate }}</h3>
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div class="sm:col-span-4 space-y-2">
              <div class="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                <span>{{ 'MEDICATION.FREQUENCY_LABEL' | translate }}</span>
                <span class="relative inline-flex items-center group">
                  <button
                    type="button"
                    class="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold"
                    [attr.aria-label]="'MEDICATION.TOOLTIP_FREQUENCY' | translate"
                  >
                    ?
                  </button>
                  <span
                    role="tooltip"
                    class="pointer-events-none absolute left-0 top-full mt-2 w-64 rounded-lg bg-slate-900 text-white text-[11px] leading-relaxed px-2.5 py-2 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition"
                  >
                    {{ 'MEDICATION.TOOLTIP_FREQUENCY' | translate }}
                  </span>
                </span>
              </div>
              <div class="flex flex-wrap gap-2">
                @for (preset of reminderFrequencyPresets; track preset) {
                  <button
                    type="button"
                    class="px-3 py-1.5 text-xs rounded-full border transition"
                    [class.border-green-500]="reminderRecurrence === preset"
                    [class.bg-green-100]="reminderRecurrence === preset"
                    [class.dark:bg-green-900/40]="reminderRecurrence === preset"
                    [class.text-green-700]="reminderRecurrence === preset"
                    [class.dark:text-green-200]="reminderRecurrence === preset"
                    [class.border-slate-300]="reminderRecurrence !== preset"
                    [class.dark:border-slate-700]="reminderRecurrence !== preset"
                    [class.text-slate-600]="reminderRecurrence !== preset"
                    [class.dark:text-slate-300]="reminderRecurrence !== preset"
                    (click)="onReminderRecurrenceChange(preset)"
                  >
                    {{ 'MEDICATION.RECURRENCE_' + preset | translate }}
                  </button>
                }
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                {{ 'MEDICATION.FREQUENCY_HELP' | translate }}
              </p>
            </div>
            <input type="time" [(ngModel)]="reminderTime" class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2" />
            <input type="text" [(ngModel)]="reminderDosage" class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2" placeholder="{{ 'MEDICATION.INPUT_DOSAGE' | translate }}" />
            <select [(ngModel)]="reminderRecurrence" (ngModelChange)="onReminderRecurrenceChange($event)" class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2">
              <option value="DAILY">{{ 'MEDICATION.RECURRENCE_DAILY' | translate }}</option>
              <option value="WEEKLY">{{ 'MEDICATION.RECURRENCE_WEEKLY' | translate }}</option>
              <option value="MONTHLY">{{ 'MEDICATION.RECURRENCE_MONTHLY' | translate }}</option>
              <option value="ONE_TIME">{{ 'MEDICATION.RECURRENCE_ONE_TIME' | translate }}</option>
            </select>

            @if (reminderRecurrence === 'WEEKLY') {
              <select [(ngModel)]="reminderDayOfWeek" class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2">
                <option [value]="1">{{ 'MEDICATION.WEEKDAY_MONDAY' | translate }}</option>
                <option [value]="2">{{ 'MEDICATION.WEEKDAY_TUESDAY' | translate }}</option>
                <option [value]="3">{{ 'MEDICATION.WEEKDAY_WEDNESDAY' | translate }}</option>
                <option [value]="4">{{ 'MEDICATION.WEEKDAY_THURSDAY' | translate }}</option>
                <option [value]="5">{{ 'MEDICATION.WEEKDAY_FRIDAY' | translate }}</option>
                <option [value]="6">{{ 'MEDICATION.WEEKDAY_SATURDAY' | translate }}</option>
                <option [value]="7">{{ 'MEDICATION.WEEKDAY_SUNDAY' | translate }}</option>
              </select>
            }

            @if (reminderRecurrence === 'MONTHLY') {
              <input type="number" min="1" max="31" [(ngModel)]="reminderDayOfMonth" placeholder="{{ 'MEDICATION.INPUT_DAY_OF_MONTH' | translate }}" class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2" />
            }

            @if (reminderRecurrence === 'ONE_TIME') {
              <input type="date" [(ngModel)]="reminderDate" class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2" />
            }

            <button class="rounded-xl bg-green-600 text-white px-4 py-2" (click)="submitAddReminder()">{{ 'MEDICATION.ADD_REMINDER_BUTTON' | translate }}</button>
            <button class="rounded-xl border border-slate-300 px-4 py-2 col-span-3" (click)="cancelAddReminder()">{{ 'common.cancel' | translate }}</button>
          </div>
        </div>
      }

      <!-- Edit Reminder Form -->
      @if (isEditingReminder()) {
        <div class="bg-purple-50 dark:bg-purple-900/30 rounded-2xl p-4">
          <h3 class="font-semibold mb-2">{{ 'MEDICATION.EDIT_REMINDER_TITLE' | translate }}</h3>
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div class="sm:col-span-4 space-y-2">
              <div class="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                <span>{{ 'MEDICATION.FREQUENCY_LABEL' | translate }}</span>
                <span class="relative inline-flex items-center group">
                  <button
                    type="button"
                    class="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold"
                    [attr.aria-label]="'MEDICATION.TOOLTIP_FREQUENCY' | translate"
                  >
                    ?
                  </button>
                  <span
                    role="tooltip"
                    class="pointer-events-none absolute left-0 top-full mt-2 w-64 rounded-lg bg-slate-900 text-white text-[11px] leading-relaxed px-2.5 py-2 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition"
                  >
                    {{ 'MEDICATION.TOOLTIP_FREQUENCY' | translate }}
                  </span>
                </span>
              </div>
              <div class="flex flex-wrap gap-2">
                @for (preset of reminderFrequencyPresets; track preset) {
                  <button
                    type="button"
                    class="px-3 py-1.5 text-xs rounded-full border transition"
                    [class.border-purple-500]="reminderRecurrence === preset"
                    [class.bg-purple-100]="reminderRecurrence === preset"
                    [class.dark:bg-purple-900/40]="reminderRecurrence === preset"
                    [class.text-purple-700]="reminderRecurrence === preset"
                    [class.dark:text-purple-200]="reminderRecurrence === preset"
                    [class.border-slate-300]="reminderRecurrence !== preset"
                    [class.dark:border-slate-700]="reminderRecurrence !== preset"
                    [class.text-slate-600]="reminderRecurrence !== preset"
                    [class.dark:text-slate-300]="reminderRecurrence !== preset"
                    (click)="onReminderRecurrenceChange(preset)"
                  >
                    {{ 'MEDICATION.RECURRENCE_' + preset | translate }}
                  </button>
                }
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                {{ 'MEDICATION.FREQUENCY_HELP' | translate }}
              </p>
            </div>
            <input type="time" [(ngModel)]="reminderTime" class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2" />
            <input type="text" [(ngModel)]="reminderDosage" class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2" placeholder="{{ 'MEDICATION.INPUT_DOSAGE' | translate }}" />
            <select [(ngModel)]="reminderRecurrence" (ngModelChange)="onReminderRecurrenceChange($event)" class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2">
              <option value="DAILY">{{ 'MEDICATION.RECURRENCE_DAILY' | translate }}</option>
              <option value="WEEKLY">{{ 'MEDICATION.RECURRENCE_WEEKLY' | translate }}</option>
              <option value="MONTHLY">{{ 'MEDICATION.RECURRENCE_MONTHLY' | translate }}</option>
              <option value="ONE_TIME">{{ 'MEDICATION.RECURRENCE_ONE_TIME' | translate }}</option>
            </select>

            @if (reminderRecurrence === 'WEEKLY') {
              <select [(ngModel)]="reminderDayOfWeek" class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2">
                <option [value]="1">{{ 'MEDICATION.WEEKDAY_MONDAY' | translate }}</option>
                <option [value]="2">{{ 'MEDICATION.WEEKDAY_TUESDAY' | translate }}</option>
                <option [value]="3">{{ 'MEDICATION.WEEKDAY_WEDNESDAY' | translate }}</option>
                <option [value]="4">{{ 'MEDICATION.WEEKDAY_THURSDAY' | translate }}</option>
                <option [value]="5">{{ 'MEDICATION.WEEKDAY_FRIDAY' | translate }}</option>
                <option [value]="6">{{ 'MEDICATION.WEEKDAY_SATURDAY' | translate }}</option>
                <option [value]="7">{{ 'MEDICATION.WEEKDAY_SUNDAY' | translate }}</option>
              </select>
            }

            @if (reminderRecurrence === 'MONTHLY') {
              <input type="number" min="1" max="31" [(ngModel)]="reminderDayOfMonth" placeholder="{{ 'MEDICATION.INPUT_DAY_OF_MONTH' | translate }}" class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2" />
            }

            @if (reminderRecurrence === 'ONE_TIME') {
              <input type="date" [(ngModel)]="reminderDate" class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2" />
            }

            <button class="rounded-xl bg-purple-600 text-white px-4 py-2" (click)="submitEditReminder()">{{ 'MEDICATION.SAVE_REMINDER_BUTTON' | translate }}</button>
            <button class="rounded-xl border border-slate-300 px-4 py-2 col-span-3" (click)="cancelEditReminder()">{{ 'common.cancel' | translate }}</button>
          </div>
        </div>
      }
      </div>
    </div>
  `,
})
export class MedicationPageComponent {
  medicationService = inject(MedicationService);
  private readonly referenceData = inject(ReferenceDataService);
  private readonly toast = inject(ToastService);

  newName = '';
  newStandardName = '';
  newNotes = '';
  newDuration = '';

  drugSearchTerm = '';
  drugIntel = signal<OpenFdaDrugIntel | null>(null);
  drugIntelLoading = signal(false);
  drugIntelError = signal<string | null>(null);
  newNameSelection: string[] = [];
  newStandardNameSelection: string[] = [];

  private readonly editingId = signal<string | null>(null);
  editedName = '';
  editedStandardName = '';
  editedNotes = '';
  editedDuration = '';
  editedNameSelection: string[] = [];
  editedStandardNameSelection: string[] = [];

  // Reminder form
  private readonly addingReminderFor = signal<string | null>(null);
  private readonly editingReminderId = signal<string | null>(null);
  reminderTime = '';
  reminderDosage = '';
  reminderRecurrence: MedicationRecurrence = 'DAILY';
  reminderDayOfWeek?: number;
  reminderDayOfMonth?: number;
  reminderDate?: string;

  readonly medications = this.medicationService.medications;
  readonly medicationSuggestions = computed(() => this.referenceData.medications());
  readonly quickMedicationSuggestions = computed(() => this.medicationSuggestions().slice(0, 10));
  readonly durationQuickPicks = [7, 14, 30, 60, 90] as const;
  readonly reminderFrequencyPresets = ['DAILY', 'WEEKLY', 'MONTHLY', 'ONE_TIME'] as const;
  readonly isEditing = computed(() => Boolean(this.editingId()));
  readonly isAddingReminder = computed(() => Boolean(this.addingReminderFor()));
  readonly isEditingReminder = computed(() => Boolean(this.editingReminderId()));

  readonly upcomingReminders = computed(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const reminders: { medication: Medication; reminder: MedicationReminder; nextTime: string }[] = [];

    for (const med of this.medications()) {
      for (const reminder of med.reminders) {
        const time = new Date(reminder.nextDueAt!).getTime() - now.getTime(); // time until next due time
        const soon = time > 0 && time < 1000 * 60 * 60 * 24; // within the next day

        if (soon) {
          reminders.push({
            medication: med,
            reminder,
            nextTime: `${today}T${reminder.timeOfDay}:00`,
          });
        }
      }
    }

    const sortedReminders = [...reminders].sort((a, b) => a.nextTime.localeCompare(b.nextTime));
    return sortedReminders.slice(0, 5);
  });

  readonly refillAlerts = computed(() => {
    const alerts: { medication: Medication; daysLeft: number }[] = [];
    const now = new Date();

    for (const med of this.medications()) {
      if (med.duration) {
        const created = new Date(med.createdAt);
        const daysSinceStart = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        const daysLeft = med.duration - daysSinceStart;

        if (daysLeft <= 7 && daysLeft > 0) {
          alerts.push({ medication: med, daysLeft });
        }
      }
    }

    const sortedAlerts = [...alerts].sort((a, b) => a.daysLeft - b.daysLeft);
    return sortedAlerts;
  });

  constructor() {
    afterNextRender(() => {
      void this.medicationService.loadMedications();
    });
  }

  getOrdinalSuffix(day: number): string {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }

  async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.newName.trim()) return;
    const duration = this.newDuration ? Number.parseInt(this.newDuration, 10) : undefined;
    const added = await this.medicationService.addMedication(this.newName, this.newStandardName, this.newNotes, duration);
    if (added) {
      this.newName = '';
      this.newStandardName = '';
      this.newNotes = '';
      this.newDuration = '';
      this.newNameSelection = [];
      this.newStandardNameSelection = [];
      this.toast.success('Medication added successfully.', 'Saved');
    } else {
      this.toast.error(this.medicationService.error() || 'Failed to add medication.', 'Error');
    }
  }

  onNewNameSelectionChange(items: string[]): void {
    this.newNameSelection = items.slice(0, 1);
    this.newName = this.newNameSelection[0] ?? '';
  }

  onNewStandardNameSelectionChange(items: string[]): void {
    this.newStandardNameSelection = items.slice(0, 1);
    this.newStandardName = this.newStandardNameSelection[0] ?? '';
  }

  setNewDuration(days: number): void {
    this.newDuration = String(days);
  }

  prefillMedication(name: string): void {
    // Reuse the same update path as autocomplete selection changes.
    this.onNewNameSelectionChange([name]);
    this.newName = name;
  }

  async searchDrugInfo(): Promise<void> {
    if (!this.drugSearchTerm.trim()) {
      this.drugIntel.set(null);
      this.drugIntelError.set('Please provide a drug name to search');
      return;
    }

    this.drugIntelLoading.set(true);
    this.drugIntelError.set(null);

    try {
      const intel = await this.medicationService.fetchDrugIntel(this.drugSearchTerm);
      if (intel) {
        this.drugIntel.set(intel);
      } else {
        this.drugIntelError.set('No drug info found.');
        this.drugIntel.set(null);
      }
    } catch (error) {
      console.error('Drug info lookup failed', error);
      this.drugIntelError.set('Unable to fetch drug details');
      this.drugIntel.set(null);
    } finally {
      this.drugIntelLoading.set(false);
    }
  }

  startEdit(med: Medication): void {
    this.editingId.set(med.id);
    this.editedName = med.name;
    this.editedStandardName = med.standardName ?? '';
    this.editedNotes = med.notes ?? '';
    this.editedDuration = med.duration?.toString() ?? '';
    this.editedNameSelection = med.name ? [med.name] : [];
    this.editedStandardNameSelection = med.standardName ? [med.standardName] : [];
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.editedNameSelection = [];
    this.editedStandardNameSelection = [];
  }

  onEditedNameSelectionChange(items: string[]): void {
    this.editedNameSelection = items.slice(0, 1);
    this.editedName = this.editedNameSelection[0] ?? '';
  }

  onEditedStandardNameSelectionChange(items: string[]): void {
    this.editedStandardNameSelection = items.slice(0, 1);
    this.editedStandardName = this.editedStandardNameSelection[0] ?? '';
  }

  setEditedDuration(days: number): void {
    this.editedDuration = String(days);
  }

  async submitEdit(): Promise<void> {
    const id = this.editingId();
    if (!id) return;
    const duration = this.editedDuration ? Number.parseInt(this.editedDuration, 10) : undefined;
    const updated = await this.medicationService.updateMedication(id, {
      name: this.editedName,
      standardName: this.editedStandardName,
      notes: this.editedNotes,
      duration,
    });
    if (updated) {
      this.cancelEdit();
    }
  }

  onReminderRecurrenceChange(recurrence: MedicationRecurrence): void {
    this.reminderRecurrence = recurrence;
    switch (recurrence) {
      case 'WEEKLY':
        this.reminderDayOfWeek = this.reminderDayOfWeek ?? 1;
        this.reminderDayOfMonth = undefined;
        this.reminderDate = undefined;
        break;
      case 'MONTHLY':
        this.reminderDayOfWeek = undefined;
        this.reminderDayOfMonth = this.reminderDayOfMonth ?? 1;
        this.reminderDate = undefined;
        break;
      case 'ONE_TIME':
        this.reminderDayOfWeek = undefined;
        this.reminderDayOfMonth = undefined;
        this.reminderDate = this.reminderDate ?? new Date().toISOString().split('T')[0];
        break;
      default:
        this.reminderDayOfWeek = undefined;
        this.reminderDayOfMonth = undefined;
        this.reminderDate = undefined;
    }
  }

  startAddReminder(medicationId: string): void {
    this.addingReminderFor.set(medicationId);
    this.editingReminderId.set(null); // Clear any previous edit state
    this.reminderTime = '';
    this.reminderDosage = '';
    this.reminderRecurrence = 'DAILY';
    this.reminderDayOfWeek = undefined;
    this.reminderDayOfMonth = undefined;
    this.reminderDate = undefined;
  }

  cancelAddReminder(): void {
    this.addingReminderFor.set(null);
    this.reminderDayOfWeek = undefined;
    this.reminderDayOfMonth = undefined;
    this.reminderDate = undefined;
  }

  async submitAddReminder(): Promise<void> {
    const medicationId = this.addingReminderFor();
    if (!medicationId || !this.reminderTime || !this.reminderDosage) return;

    const added = await this.medicationService.addReminder(
      medicationId,
      this.reminderTime,
      this.reminderDosage,
      this.reminderRecurrence,
      this.reminderDayOfWeek,
      this.reminderDayOfMonth,
      this.reminderDate
    );
    if (added) {
      this.cancelAddReminder();
      this.toast.success('Reminder added successfully.', 'Saved');
    } else {
      this.toast.error(this.medicationService.error() || 'Failed to add reminder.', 'Error');
    }
  }

  startEditReminder(medicationId: string, reminder: MedicationReminder): void {
    this.editingReminderId.set(reminder.id);
    this.addingReminderFor.set(medicationId);
    this.reminderTime = reminder.timeOfDay;
    this.reminderDosage = reminder.dosage;
    this.reminderRecurrence = reminder.recurrence;
    this.reminderDayOfWeek = reminder.dayOfWeek;
    this.reminderDayOfMonth = reminder.dayOfMonth;
    this.reminderDate = reminder.date?.split('T')[0];
    this.onReminderRecurrenceChange(reminder.recurrence);
  }

  cancelEditReminder(): void {
    this.editingReminderId.set(null);
    this.addingReminderFor.set(null);
    this.reminderDayOfWeek = undefined;
    this.reminderDayOfMonth = undefined;
    this.reminderDate = undefined;
  }

  async submitEditReminder(): Promise<void> {
    const medicationId = this.addingReminderFor();
    const reminderId = this.editingReminderId();
    if (!medicationId || !reminderId || !this.reminderTime || !this.reminderDosage) return;

    const updated = await this.medicationService.updateReminder(
      medicationId,
      reminderId,
      {
        timeOfDay: this.reminderTime,
        dosage: this.reminderDosage,
        recurrence: this.reminderRecurrence,
        dayOfWeek: this.reminderDayOfWeek,
        dayOfMonth: this.reminderDayOfMonth,
        date: this.reminderDate,
      }
    );
    if (updated) {
      this.cancelEditReminder();
    }
  }

  async removeReminder(medicationId: string, reminderId: string): Promise<void> {
    await this.medicationService.deleteReminder(medicationId, reminderId);
  }

  async removeMedication(id: string): Promise<void> {
    await this.medicationService.deleteMedication(id);
  }
}
