import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MedicationService } from '../../core/medical/medication.service';

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
        <form class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" (submit)="submit($event)">
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
          <button
            type="submit"
            class="rounded-xl bg-emerald-500 text-white font-semibold px-4 py-2 hover:bg-emerald-600 transition"
            [disabled]="medicationService.loading()"
          >
            {{ 'MEDICATION.ADD_BUTTON' | translate }}
          </button>
        </form>
        <div *ngIf="medicationService.error()" class="text-red-600 dark:text-red-300 text-sm">
          {{ medicationService.error() }}
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <h2 class="text-lg font-semibold mb-3">{{ 'MEDICATION.LIST_TITLE' | translate }}</h2>

        <div *ngIf="medicationService.loading()" class="text-sm text-slate-500 dark:text-slate-300">{{ 'MEDICATION.LOADING' | translate }}</div>
        <div *ngIf="!medicationService.loading() && medications().length === 0" class="text-sm text-slate-500 dark:text-slate-300">{{ 'MEDICATION.NO_RESULTS' | translate }}</div>

        <ul class="space-y-2">
          <li *ngFor="let med of medications()" class="rounded-xl border border-slate-200 dark:border-slate-700 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p class="font-semibold text-slate-900 dark:text-white">{{ med.name }}</p>
              <p *ngIf="med.standardName" class="text-xs text-slate-500 dark:text-slate-400">{{ 'MEDICATION.STANDARD_NAME' | translate }}: {{ med.standardName }}</p>
              <p *ngIf="med.notes" class="text-xs text-slate-500 dark:text-slate-400">{{ med.notes }}</p>
            </div>
            <div class="flex gap-2">
              <button class="rounded-lg border border-slate-300 dark:border-slate-700 px-2 py-1 text-xs" (click)="startEdit(med)">{{ 'common.edit' | translate }}</button>
              <button class="rounded-lg border border-red-300 text-red-600 dark:border-red-700 dark:text-red-300 px-2 py-1 text-xs" (click)="removeMedication(med.id)">{{ 'common.delete' | translate }}</button>
            </div>
          </li>
        </ul>
      </div>

      <div *ngIf="isEditing()" class="bg-yellow-50 dark:bg-yellow-900/30 rounded-2xl p-4">
        <h3 class="font-semibold mb-2">{{ 'MEDICATION.EDIT_TITLE' | translate }}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input type="text" [(ngModel)]="editedName" class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2" />
          <input type="text" [(ngModel)]="editedStandardName" class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2" />
          <input type="text" [(ngModel)]="editedNotes" class="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2" />
          <button class="rounded-xl bg-blue-600 text-white px-4 py-2" (click)="submitEdit()">{{ 'MEDICATION.SAVE_BUTTON' | translate }}</button>
          <button class="rounded-xl border border-slate-300 px-4 py-2" (click)="cancelEdit()">{{ 'common.cancel' | translate }}</button>
        </div>
      </div>
    </div>
  `,
})
export class MedicationPageComponent {
  medicationService = inject(MedicationService);

  newName = '';
  newStandardName = '';
  newNotes = '';

  private editingId = signal<string | null>(null);
  editedName = '';
  editedStandardName = '';
  editedNotes = '';

  readonly medications = this.medicationService.medications;
  readonly isEditing = computed(() => Boolean(this.editingId()));

  constructor() {
    void this.medicationService.loadMedications();
  }

  async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.newName.trim()) return;
    const added = await this.medicationService.addMedication(this.newName, this.newStandardName, this.newNotes);
    if (added) {
      this.newName = '';
      this.newStandardName = '';
      this.newNotes = '';
    }
  }

  startEdit(med: { id: string; name: string; standardName?: string | null; notes?: string | null }): void {
    this.editingId.set(med.id);
    this.editedName = med.name;
    this.editedStandardName = med.standardName ?? '';
    this.editedNotes = med.notes ?? '';
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  async submitEdit(): Promise<void> {
    const id = this.editingId();
    if (!id) return;
    const updated = await this.medicationService.updateMedication(id, {
      name: this.editedName,
      standardName: this.editedStandardName,
      notes: this.editedNotes,
    });
    if (updated) {
      this.cancelEdit();
    }
  }

  async removeMedication(id: string): Promise<void> {
    await this.medicationService.deleteMedication(id);
  }
}
