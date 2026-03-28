import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MedicationService, Medication, MedicationReminder } from '../../core/medical/medication.service';

@Component({
  selector: 'app-medication-page',
  imports: [CommonModule, FormsModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] px-4 sm:px-6 lg:px-10 py-8 pb-24 space-y-5">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {{ 'MEDICATION.TITLE' | translate }}
          </h1>
          <p class="text-sm text-slate-500 dark:text-slate-300 mt-1">
            {{ 'MEDICATION.SUBTITLE' | translate }}
          </p>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 shadow-sm">
        <form class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3" (submit)="submit($event)">
          <input
            type="text"
            name="name"
            placeholder="{{ 'MEDICATION.INPUT_NAME' | translate }}"
            [(ngModel)]="newName"
            class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm w-full"
            required
          />
          <input
            type="text"
            name="standardName"
            placeholder="{{ 'MEDICATION.INPUT_STANDARD_NAME' | translate }}"
            [(ngModel)]="newStandardName"
            class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm w-full"
          />
          <input
            type="text"
            name="notes"
            placeholder="{{ 'MEDICATION.INPUT_NOTES' | translate }}"
            [(ngModel)]="newNotes"
            class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm w-full"
          />
          <input
            type="number"
            name="duration"
            placeholder="{{ 'MEDICATION.INPUT_DURATION' | translate }}"
            [(ngModel)]="newDuration"
            class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm w-full"
            min="1"
            max="365"
          />
          <button
            type="submit"
            class="rounded-xl bg-emerald-500 text-white font-semibold px-4 py-2 hover:bg-emerald-600 transition"
            [disabled]="medicationService.loading()"
          >
            {{ 'MEDICATION.ADD_BUTTON' | translate }}
          </button>
        </form>
        @if (medicationService.error()) {
          <div class="text-red-600 dark:text-red-300 text-sm">
            {{ medicationService.error() }}
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
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input type="text" [(ngModel)]="editedName" class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2" placeholder="{{ 'MEDICATION.INPUT_NAME' | translate }}" />
            <input type="text" [(ngModel)]="editedStandardName" class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2" placeholder="{{ 'MEDICATION.INPUT_STANDARD_NAME' | translate }}" />
            <input type="text" [(ngModel)]="editedNotes" class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2" placeholder="{{ 'MEDICATION.INPUT_NOTES' | translate }}" />
            <input type="number" [(ngModel)]="editedDuration" class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2" placeholder="{{ 'MEDICATION.INPUT_DURATION' | translate }}" min="1" max="365" />
            <button class="rounded-xl bg-blue-600 text-white px-4 py-2" (click)="submitEdit()">{{ 'MEDICATION.SAVE_BUTTON' | translate }}</button>
            <button class="rounded-xl border border-slate-300 px-4 py-2" (click)="cancelEdit()">{{ 'common.cancel' | translate }}</button>
          </div>
        </div>
      }

      <!-- Add Reminder Form -->
      @if (isAddingReminder() && !isEditingReminder()) {
        <div class="bg-green-50 dark:bg-green-900/30 rounded-2xl p-4">
          <h3 class="font-semibold mb-2">{{ 'MEDICATION.ADD_REMINDER_TITLE' | translate }}</h3>
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input type="time" [(ngModel)]="reminderTime" class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2" />
            <input type="text" [(ngModel)]="reminderDosage" class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2" placeholder="{{ 'MEDICATION.INPUT_DOSAGE' | translate }}" />
            <select [(ngModel)]="reminderRecurrence" class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2">
              <option value="DAILY">{{ 'MEDICATION.RECURRENCE_DAILY' | translate }}</option>
              <option value="WEEKLY">{{ 'MEDICATION.RECURRENCE_WEEKLY' | translate }}</option>
              <option value="MONTHLY">{{ 'MEDICATION.RECURRENCE_MONTHLY' | translate }}</option>
              <option value="ONE_TIME">{{ 'MEDICATION.RECURRENCE_ONE_TIME' | translate }}</option>
            </select>
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
            <input type="time" [(ngModel)]="reminderTime" class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2" />
            <input type="text" [(ngModel)]="reminderDosage" class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2" placeholder="{{ 'MEDICATION.INPUT_DOSAGE' | translate }}" />
            <select [(ngModel)]="reminderRecurrence" class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2">
              <option value="DAILY">{{ 'MEDICATION.RECURRENCE_DAILY' | translate }}</option>
              <option value="WEEKLY">{{ 'MEDICATION.RECURRENCE_WEEKLY' | translate }}</option>
              <option value="MONTHLY">{{ 'MEDICATION.RECURRENCE_MONTHLY' | translate }}</option>
              <option value="ONE_TIME">{{ 'MEDICATION.RECURRENCE_ONE_TIME' | translate }}</option>
            </select>
            <button class="rounded-xl bg-purple-600 text-white px-4 py-2" (click)="submitEditReminder()">{{ 'MEDICATION.SAVE_REMINDER_BUTTON' | translate }}</button>
            <button class="rounded-xl border border-slate-300 px-4 py-2 col-span-3" (click)="cancelEditReminder()">{{ 'common.cancel' | translate }}</button>
          </div>
        </div>
      }
    </div>
  `,
})
export class MedicationPageComponent {
  medicationService = inject(MedicationService);

  newName = '';
  newStandardName = '';
  newNotes = '';
  newDuration = '';

  private editingId = signal<string | null>(null);
  editedName = '';
  editedStandardName = '';
  editedNotes = '';
  editedDuration = '';

  // Reminder form
  private addingReminderFor = signal<string | null>(null);
  private editingReminderId = signal<string | null>(null);
  reminderTime = '';
  reminderDosage = '';
  reminderRecurrence: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ONE_TIME' = 'DAILY';

  readonly medications = this.medicationService.medications;
  readonly isEditing = computed(() => Boolean(this.editingId()));
  readonly isAddingReminder = computed(() => Boolean(this.addingReminderFor()));
  readonly isEditingReminder = computed(() => Boolean(this.editingReminderId()));

  readonly upcomingReminders = computed(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);

    const reminders: { medication: Medication; reminder: MedicationReminder; nextTime: string }[] = [];

    for (const med of this.medications()) {
      for (const reminder of med.reminders) {
        if (reminder.timeOfDay >= currentTime) {
          reminders.push({
            medication: med,
            reminder,
            nextTime: `${today}T${reminder.timeOfDay}:00`,
          });
        }
      }
    }

    return reminders.sort((a, b) => a.nextTime.localeCompare(b.nextTime)).slice(0, 5);
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

    return alerts.sort((a, b) => a.daysLeft - b.daysLeft);
  });

  constructor() {
    void this.medicationService.loadMedications();
  }

  async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.newName.trim()) return;
    const duration = this.newDuration ? parseInt(this.newDuration) : undefined;
    const added = await this.medicationService.addMedication(this.newName, this.newStandardName, this.newNotes, duration);
    if (added) {
      this.newName = '';
      this.newStandardName = '';
      this.newNotes = '';
      this.newDuration = '';
    }
  }

  startEdit(med: Medication): void {
    this.editingId.set(med.id);
    this.editedName = med.name;
    this.editedStandardName = med.standardName ?? '';
    this.editedNotes = med.notes ?? '';
    this.editedDuration = med.duration?.toString() ?? '';
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  async submitEdit(): Promise<void> {
    const id = this.editingId();
    if (!id) return;
    const duration = this.editedDuration ? parseInt(this.editedDuration) : undefined;
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

  startAddReminder(medicationId: string): void {
    this.addingReminderFor.set(medicationId);
    this.editingReminderId.set(null); // Clear any previous edit state
    this.reminderTime = '';
    this.reminderDosage = '';
    this.reminderRecurrence = 'DAILY';
  }

  cancelAddReminder(): void {
    this.addingReminderFor.set(null);
  }

  async submitAddReminder(): Promise<void> {
    const medicationId = this.addingReminderFor();
    if (!medicationId || !this.reminderTime || !this.reminderDosage) return;

    const added = await this.medicationService.addReminder(
      medicationId,
      this.reminderTime,
      this.reminderDosage,
      this.reminderRecurrence
    );
    if (added) {
      this.cancelAddReminder();
    }
  }

  startEditReminder(medicationId: string, reminder: MedicationReminder): void {
    this.editingReminderId.set(reminder.id);
    this.addingReminderFor.set(medicationId);
    this.reminderTime = reminder.timeOfDay;
    this.reminderDosage = reminder.dosage;
    this.reminderRecurrence = reminder.recurrence;
  }

  cancelEditReminder(): void {
    this.editingReminderId.set(null);
    this.addingReminderFor.set(null);
  }

  async submitEditReminder(): Promise<void> {
    const medicationId = this.addingReminderFor();
    const reminderId = this.editingReminderId();
    if (!medicationId || !reminderId || !this.reminderTime || !this.reminderDosage) return;

    const updated = await this.medicationService.updateReminder(
      medicationId,
      reminderId,
      this.reminderTime,
      this.reminderDosage,
      this.reminderRecurrence
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
