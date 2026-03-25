import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { toDataURL } from 'qrcode';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatGridListModule } from '@angular/material/grid-list';
import { TranslateService } from '@ngx-translate/core';
import { MedicalIdQrDialogComponent } from './medical-id-qr-dialog.component';
import { MedicalIdService } from '../../core/medical-id/medical-id.service';
import { ReferenceDataService } from '../../core/reference-data/reference-data.service';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import { AutocompleteComponent } from '../../shared/components/autocomplete/autocomplete.component';
import { ProfileService } from '../../core/profile/profile.service';
import { AuthService } from '../../core/auth/auth.service';
import { BLOOD_TYPES, RELATIONSHIPS, BloodType, EmergencyContact } from './medical-id.types';

type ViewMode = 'card' | 'edit';

@Component({
  selector: 'app-medical-id',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    AutocompleteComponent,
    BackButtonComponent,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatBadgeModule,
    MatGridListModule,
  ],
  template: `
    <div class="medical-id-page">
      <!-- Dramatic Emergency Header -->
      <header class="emergency-header">
        <div class="header-content">
          <app-back-button [showLabel]="false" />
          <div class="header-title">
            <div class="medical-cross">
              <span class="cross-h"></span>
              <span class="cross-v"></span>
            </div>
            <h1>{{ 'MEDICAL_ID.TITLE' | translate }}</h1>
          </div>
          <button
            class="mode-toggle"
            (click)="toggleMode()"
            [attr.aria-label]="viewMode() === 'card' ? 'Edit' : 'View card'"
          >
            @if (viewMode() === 'card') {
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
              </svg>
            } @else {
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"/>
              </svg>
            }
          </button>
        </div>
      </header>

      <main class="main-content">
        @if (viewMode() === 'card') {
          <!-- EMERGENCY CARD VIEW -->
          <div class="emergency-card" [class.has-data]="medicalIdService.hasMedicalId()">
            <!-- Card Header with Medical Cross -->
            <div class="card-header">
              <div class="alert-stripe"></div>
              <div class="card-identity">
                <div class="avatar-ring">
                  <div class="avatar">
                    {{ initials() }}
                  </div>
                </div>
                <div class="identity-info">
                  <h2 class="name">{{ displayName() }}</h2>
                  @if (medicalIdData()?.dateOfBirth) {
                    <p class="age-dob">
                      {{ medicalIdData()?.age }} years old
                      <span class="separator">•</span>
                      {{ formatDate(medicalIdData()?.dateOfBirth) }}
                    </p>
                  }
                </div>
              </div>
            </div>

            <!-- Critical Info Grid -->
            <div class="critical-section">
              <!-- Blood Type - Most Prominent -->
              <div class="blood-type-display" [class.empty]="!medicalIdData()?.bloodType">
                <span class="label">Blood Type</span>
                <span class="value">{{ medicalIdData()?.bloodType || '—' }}</span>
              </div>

              <!-- Allergies - High Alert -->
              <div class="alert-box allergies" [class.has-items]="(medicalIdData()?.allergies?.length || 0) > 0">
                <div class="alert-header">
                  <svg class="alert-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  <span>Allergies</span>
                </div>
                <div class="alert-content">
                  @if ((medicalIdData()?.allergies?.length || 0) > 0) {
                    @for (allergy of medicalIdData()?.allergies; track allergy) {
                      <span class="tag allergy-tag">{{ allergy }}</span>
                    }
                  } @else {
                    <span class="none-listed">None listed</span>
                  }
                </div>
              </div>

              <!-- Medications -->
              <div class="info-box medications">
                <div class="info-header">
                  <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 3h6v2H9zM12 8v8M8 12h8"/>
                    <rect x="5" y="5" width="14" height="16" rx="2"/>
                  </svg>
                  <span>Medications</span>
                </div>
                <div class="info-content">
                  @if ((medicalIdData()?.medications?.length || 0) > 0) {
                    @for (med of medicalIdData()?.medications; track med) {
                      <span class="tag med-tag">{{ med }}</span>
                    }
                  } @else {
                    <span class="none-listed">None listed</span>
                  }
                </div>
              </div>

              <!-- Conditions -->
              <div class="info-box conditions">
                <div class="info-header">
                  <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 8v4l3 3"/>
                    <circle cx="12" cy="12" r="9"/>
                  </svg>
                  <span>Conditions</span>
                </div>
                <div class="info-content">
                  @if ((medicalIdData()?.medicalConditions?.length || 0) > 0) {
                    @for (condition of medicalIdData()?.medicalConditions; track condition) {
                      <span class="tag condition-tag">{{ condition }}</span>
                    }
                  } @else {
                    <span class="none-listed">None listed</span>
                  }
                </div>
              </div>
            </div>

            <!-- Emergency Contacts -->
            <div class="contacts-section">
              <h3 class="section-title">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                Emergency Contacts
              </h3>

              @if ((medicalIdData()?.emergencyContacts?.length || 0) > 0) {
                <div class="contacts-grid">
                  @for (contact of medicalIdData()?.emergencyContacts; track contact.id) {
                    <a
                      [href]="'tel:' + contact.phone"
                      class="contact-card"
                      [class.primary]="contact.isPrimary"
                    >
                      <div class="contact-info">
                        <span class="contact-name">{{ contact.name }}</span>
                        <span class="contact-relation">{{ contact.relationship }}</span>
                      </div>
                      <div class="contact-action">
                        <span class="phone">{{ contact.phone }}</span>
                        <svg class="call-icon" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                        </svg>
                      </div>
                    </a>
                  }
                </div>
              } @else {
                <p class="no-contacts">No emergency contacts added yet</p>
              }
            </div>

            <!-- QR Code Section -->
            <div class="qr-section">
              <div class="qr-wrapper">
                <button
                  type="button"
                  class="qr-placeholder"
                  (click)="openQrDialog()"
                  aria-label="Open QR Code dialog"
                >
                  <span class="material-symbols-rounded">qr_code</span>
                  <span>Preview QR</span>
                </button>
              </div>
              <p class="qr-hint">Scan to access emergency info</p>
            </div>

            <div class="share-export-actions">
              <button type="button" class="share-btn" (click)="shareMedicalId()">
                {{ 'MEDICAL_ID.SHARE' | translate }}
              </button>
              <button type="button" class="export-btn" (click)="exportMedicalIdPdf()">
                {{ 'MEDICAL_ID.EXPORT_PDF' | translate }}
              </button>
            </div>

            <!-- Offline indicator -->
            <div class="offline-badge">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm-1-6v2h2v-2h-2zm0-8v6h2V8h-2z"/>
              </svg>
              <span>Available offline</span>
            </div>
          </div>
        } @else {
          <!-- EDIT MODE -->
          <div class="edit-form">
            <section class="form-section">
              <h3 class="section-label">Blood Type</h3>
              <div class="blood-type-grid">
                @for (type of bloodTypes; track type) {
                  <button
                    class="blood-type-btn"
                    [class.selected]="editData.bloodType === type"
                    (click)="editData.bloodType = type"
                  >
                    {{ type }}
                  </button>
                }
              </div>
            </section>

            <section class="form-section">
              <h3 class="section-label">Allergies</h3>
              <div class="chip-input-container">
                <app-autocomplete
                  [suggestions]="commonAllergies()"
                  [selectedItems]="editData.allergies"
                  [placeholder]="'Add allergy...'"
                  [allowCustom]="true"
                  (itemsChange)="editData.allergies = $event"
                ></app-autocomplete>
              </div>
            </section>

            <section class="form-section">
              <h3 class="section-label">Medications</h3>
              <div class="chip-input-container">
                <app-autocomplete
                  [suggestions]="commonMedications()"
                  [selectedItems]="editData.medications"
                  [placeholder]="'Add medication...'"
                  [allowCustom]="true"
                  (itemsChange)="editData.medications = $event"
                ></app-autocomplete>
              </div>
            </section>

            <section class="form-section">
              <h3 class="section-label">Medical Conditions</h3>
              <div class="chip-input-container">
                <app-autocomplete
                  [suggestions]="commonConditions()"
                  [selectedItems]="editData.medicalConditions"
                  [placeholder]="'Add condition...'"
                  [allowCustom]="true"
                  (itemsChange)="editData.medicalConditions = $event"
                ></app-autocomplete>
              </div>
            </section>

            <section class="form-section">
              <h3 class="section-label">Emergency Contacts</h3>

              @for (contact of editData.emergencyContacts; track contact.id) {
                <div class="contact-edit-card">
                  <div class="contact-edit-header">
                    <span class="contact-edit-name">{{ contact.name }}</span>
                    <button class="delete-contact" (click)="removeContact(contact.id)">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                  <div class="contact-edit-details">
                    <span class="contact-edit-relation">{{ contact.relationship }}</span>
                    <span class="contact-edit-phone">{{ contact.phone }}</span>
                  </div>
                  <label class="primary-toggle">
                    <input
                      type="checkbox"
                      [checked]="contact.isPrimary"
                      (change)="setPrimaryContact(contact.id)"
                    />
                    <span>Primary contact</span>
                  </label>
                </div>
              }

              <!-- Add new contact form -->
              <div class="add-contact-form">
                <h4>Add Contact</h4>
                <div class="contact-inputs">
                  <input
                    type="text"
                    [(ngModel)]="newContact.name"
                    placeholder="Name"
                    class="contact-input"
                  />
                  <select
                    [(ngModel)]="newContact.relationship"
                    class="contact-select"
                  >
                    <option value="">Relationship</option>
                    @for (rel of relationships; track rel) {
                      <option [value]="rel">{{ rel }}</option>
                    }
                  </select>
                  <div class="phone-row">
                    <select
                      [(ngModel)]="selectedCountryCode"
                      (ngModelChange)="updateCountryCode($event)"
                      class="contact-select country-select"
                      aria-label="Country code"
                    >
                      @for (country of countryOptions; track country.code) {
                        <option [value]="country.dial">{{ country.flag }} {{ country.dial }}</option>
                      }
                    </select>
                    <input
                      type="tel"
                      [(ngModel)]="newContact.phone"
                      placeholder="Phone number"
                      class="contact-input" 
                      inputmode="tel"
                      autocomplete="tel"
                    />
                  </div>
                  <button
                    class="add-contact-btn"
                    (click)="addContact()"
                    [disabled]="!canAddContact()"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    Add Contact
                  </button>
                </div>
              </div>
            </section>

            <!-- Save Button -->
            <button
              class="save-btn"
              (click)="saveChanges()"
              [disabled]="saving()"
            >
              @if (saving()) {
                <span class="spinner"></span>
                Saving...
              } @else {
                Save Medical ID
              }
            </button>
          </div>
        }
      </main>

    </div>
  `,
  styles: [`
    /* =========================================
       EMERGENCY-FIRST AESTHETIC
       Bold reds, stark whites, high contrast
       Designed for quick scanning in emergencies
       ========================================= */

    .medical-id-page {
      min-height: 100vh;
      background: linear-gradient(180deg, #FEF2F2 0%, #FAFAFA 50%);
    }

    /* Emergency Header */
    .emergency-header {
      background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
      padding: 1rem 1.25rem;
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: 0 4px 20px rgba(185, 28, 28, 0.3);
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 600px;
      margin: 0 auto;
    }

    .back-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: rgba(255,255,255,0.15);
      color: white;
      transition: all 0.2s;
    }

    .back-link:hover {
      background: rgba(255,255,255,0.25);
      transform: translateX(-2px);
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .medical-cross {
      position: relative;
      width: 28px;
      height: 28px;
    }

    .cross-h, .cross-v {
      position: absolute;
      background: white;
      border-radius: 2px;
    }

    .cross-h {
      width: 100%;
      height: 8px;
      top: 50%;
      transform: translateY(-50%);
    }

    .cross-v {
      width: 8px;
      height: 100%;
      left: 50%;
      transform: translateX(-50%);
    }

    .header-title h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: white;
      letter-spacing: -0.02em;
    }

    .mode-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: rgba(255,255,255,0.15);
      color: white;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .mode-toggle:hover {
      background: rgba(255,255,255,0.25);
    }

    /* Main Content */
    .main-content {
      max-width: 600px;
      margin: 0 auto;
      padding: 1.5rem 1rem 6rem;
    }

    /* Emergency Card */
    .emergency-card {
      background: white;
      border-radius: 24px;
      overflow: hidden;
      box-shadow:
        0 4px 6px rgba(0,0,0,0.05),
        0 20px 40px rgba(185, 28, 28, 0.1);
      border: 2px solid #FEE2E2;
    }

    .card-header {
      position: relative;
      padding: 1.5rem;
      background: linear-gradient(135deg, #FEF2F2 0%, #FFF 100%);
    }

    .alert-stripe {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: repeating-linear-gradient(
        90deg,
        #DC2626 0px,
        #DC2626 20px,
        #FEE2E2 20px,
        #FEE2E2 40px
      );
    }

    .card-identity {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .avatar-ring {
      padding: 3px;
      border-radius: 50%;
      background: linear-gradient(135deg, #DC2626, #F87171);
    }

    .avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Outfit', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: #DC2626;
      border: 3px solid white;
    }

    .identity-info {
      flex: 1;
    }

    .name {
      font-family: 'Outfit', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1F2937;
      margin: 0;
    }

    .age-dob {
      font-size: 0.875rem;
      color: #6B7280;
      margin: 0.25rem 0 0;
    }

    .separator {
      margin: 0 0.5rem;
      opacity: 0.5;
    }

    /* Critical Section */
    .critical-section {
      padding: 1.25rem;
      display: grid;
      gap: 1rem;
    }

    .blood-type-display {
      background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
      border-radius: 16px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(185, 28, 28, 0.25);
    }

    .blood-type-display.empty {
      background: linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%);
    }

    .blood-type-display .label {
      font-size: 0.875rem;
      font-weight: 600;
      color: rgba(255,255,255,0.9);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .blood-type-display .value {
      font-family: 'Outfit', sans-serif;
      font-size: 2.5rem;
      font-weight: 800;
      color: white;
      letter-spacing: -0.02em;
    }

    /* Alert Box (Allergies) */
    .alert-box {
      background: #FEF2F2;
      border: 2px solid #FECACA;
      border-radius: 16px;
      padding: 1rem;
    }

    .alert-box.has-items {
      border-color: #F87171;
      background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%);
    }

    .alert-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .alert-icon {
      width: 20px;
      height: 20px;
      color: #DC2626;
    }

    .alert-header span {
      font-weight: 700;
      font-size: 0.875rem;
      color: #B91C1C;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .alert-content {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    /* Info Box (Medications, Conditions) */
    .info-box {
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 16px;
      padding: 1rem;
    }

    .info-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .info-icon {
      width: 18px;
      height: 18px;
      color: #6B7280;
    }

    .info-header span {
      font-weight: 600;
      font-size: 0.8rem;
      color: #4B5563;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .info-content {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    /* Tags */
    .tag {
      display: inline-flex;
      padding: 0.375rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8125rem;
      font-weight: 600;
    }

    .allergy-tag {
      background: #FEE2E2;
      color: #B91C1C;
      border: 1px solid #FECACA;
    }

    .med-tag {
      background: #DBEAFE;
      color: #1E40AF;
      border: 1px solid #BFDBFE;
    }

    .condition-tag {
      background: #FEF3C7;
      color: #92400E;
      border: 1px solid #FDE68A;
    }

    .none-listed {
      font-size: 0.875rem;
      color: #9CA3AF;
      font-style: italic;
    }

    /* Contacts Section */
    .contacts-section {
      padding: 1.25rem;
      border-top: 1px solid #F3F4F6;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'Outfit', sans-serif;
      font-size: 1rem;
      font-weight: 700;
      color: #374151;
      margin: 0 0 1rem;
    }

    .section-title svg {
      color: #6B7280;
    }

    .contacts-grid {
      display: grid;
      gap: 0.75rem;
    }

    .contact-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      text-decoration: none;
      transition: all 0.2s;
    }

    .contact-card:hover {
      background: #F3F4F6;
      border-color: #D1D5DB;
    }

    .contact-card.primary {
      background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
      border-color: #93C5FD;
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .contact-name {
      font-weight: 700;
      color: #1F2937;
    }

    .contact-relation {
      font-size: 0.75rem;
      color: #6B7280;
    }

    .contact-action {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .phone {
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
    }

    .call-icon {
      width: 24px;
      height: 24px;
      padding: 4px;
      background: #10B981;
      color: white;
      border-radius: 6px;
    }

    .no-contacts {
      text-align: center;
      color: #9CA3AF;
      font-size: 0.875rem;
      padding: 1rem;
    }

    /* QR Section */
    .qr-section {
      padding: 1.25rem;
      border-top: 1px solid #F3F4F6;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }

    .qr-wrapper {
      width: 80px;
      height: 80px;
    }

    .qr-preview {
      position: relative;
      width: 240px;
      height: 240px;
      border-radius: 1rem;
      overflow: hidden;
      border: 1px solid rgba(15,23,42,0.2);
      box-shadow: 0 8px 30px rgba(0,0,0,0.25);
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .qr-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .qr-close {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 24px;
      height: 24px;
      border: none;
      border-radius: 999px;
      background: rgba(15, 23, 42, 0.85);
      color: white;
      cursor: pointer;
      font-size: 0.8rem;
      display: grid;
      place-items: center;
      line-height: 1;
    }

    .qr-placeholder {
      width: 100%;
      height: 100%;
      display: grid;
      place-items: center;
      border-radius: 1rem;
      border: 1px dashed #94a3b8;
      background: linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(241,245,249,0.8) 100%);
      color: #334155;
      gap: 0.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      border-color: #94a3b8;
    }

    .qr-placeholder:hover {
      transform: translateY(-2px);
      border-color: #64748b;
      background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(226,232,240,0.9) 100%);
    }

    .qr-placeholder .qr-icon {
      width: 1.5rem;
      height: 1.5rem;
      color: #0f172a;
    }

    .qr-placeholder {
      width: 100%;
      height: 100%;
      border: 2px dashed #D1D5DB;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
      cursor: pointer;
      transition: all 0.2s;
      background: #F9FAFB;
      padding: 0;
      font-family: inherit;
    }

    .qr-placeholder:hover {
      border-color: #9CA3AF;
      background: #F3F4F6;
    }

    .qr-icon {
      width: 32px;
      height: 32px;
      color: #6B7280;
    }

    .qr-placeholder span {
      font-size: 0.625rem;
      color: #6B7280;
      font-weight: 600;
    }

    .qr-hint {
      font-size: 0.75rem;
      color: #9CA3AF;
      margin: 0;
    }

    .share-export-actions {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.75rem;
      padding: 1rem 1.25rem 0.25rem;
    }

    .share-btn,
    .export-btn {
      border: none;
      border-radius: 999px;
      padding: 0.625rem 1rem;
      font-weight: 700;
      font-size: 0.875rem;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .share-btn {
      background: #eef2ff;
      color: #3730a3;
    }

    .export-btn {
      background: #dcfce7;
      color: #166534;
    }

    .share-btn:hover,
    .export-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(15, 23, 42, 0.12);
    }

    /* Offline Badge */
    .offline-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      padding: 0.75rem;
      background: #F0FDF4;
      color: #166534;
      font-size: 0.75rem;
      font-weight: 600;
    }

    /* QR Modal */
    .qr-modal {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      padding: 1rem;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .qr-modal-content {
      background: white;
      border-radius: 24px;
      padding: 2rem;
      max-width: 320px;
      width: 100%;
      text-align: center;
      position: relative;
      animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes scaleIn {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .qr-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: #F3F4F6;
      font-size: 1.25rem;
      cursor: pointer;
      color: #6B7280;
      transition: all 0.2s;
    }

    .qr-close:hover {
      background: #E5E7EB;
      color: #1F2937;
    }

    .qr-modal-content h3 {
      font-family: 'Outfit', sans-serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: #1F2937;
      margin: 0 0 1.5rem;
    }

    .qr-large {
      width: 100%;
      max-width: 320px;
      aspect-ratio: 1 / 1;
      margin: 0 auto;
      background: white;
      border: 8px solid #1F2937;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
    }

    .qr-svg {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
    }

    .qr-instructions {
      margin: 1.5rem 0 0;
      font-size: 0.875rem;
      color: #6B7280;
      line-height: 1.5;
    }

    /* =========================================
       EDIT MODE STYLES
       ========================================= */

    .edit-form {
      display: grid;
      gap: 1.5rem;
    }

    .form-section {
      background: white;
      border-radius: 20px;
      padding: 1.25rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }

    .section-label {
      font-family: 'Outfit', sans-serif;
      font-size: 0.875rem;
      font-weight: 700;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0 0 1rem;
    }

    .blood-type-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.5rem;
    }

    .blood-type-btn {
      padding: 0.875rem 0.5rem;
      border: 2px solid #E5E7EB;
      border-radius: 12px;
      background: white;
      font-family: 'Outfit', sans-serif;
      font-size: 1.125rem;
      font-weight: 700;
      color: #4B5563;
      cursor: pointer;
      transition: all 0.2s;
    }

    .blood-type-btn:hover {
      border-color: #D1D5DB;
      background: #F9FAFB;
    }

    .blood-type-btn.selected {
      border-color: #DC2626;
      background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%);
      color: #DC2626;
    }

    .chip-input-container {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      min-height: 32px;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.5rem 0.375rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8125rem;
      font-weight: 600;
    }

    .allergy-chip {
      background: #FEE2E2;
      color: #B91C1C;
    }

    .med-chip {
      background: #DBEAFE;
      color: #1E40AF;
    }

    .chip-remove {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: none;
      background: rgba(0,0,0,0.1);
      color: inherit;
      font-size: 0.875rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .chip-remove:hover {
      background: rgba(0,0,0,0.2);
    }

    .input-row {
      display: flex;
      gap: 0.5rem;
    }

    .chip-input {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 2px solid #E5E7EB;
      border-radius: 12px;
      font-size: 0.9375rem;
      transition: all 0.2s;
    }

    .chip-input:focus {
      outline: none;
      border-color: #DC2626;
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
    }

    .add-btn {
      padding: 0.75rem 1.25rem;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .add-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(185, 28, 28, 0.3);
    }

    .add-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Contact Edit Cards */
    .contact-edit-card {
      padding: 1rem;
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      margin-bottom: 0.75rem;
    }

    .contact-edit-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .contact-edit-name {
      font-weight: 700;
      color: #1F2937;
    }

    .delete-contact {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: #FEE2E2;
      color: #DC2626;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .delete-contact:hover {
      background: #FECACA;
    }

    .contact-edit-details {
      display: flex;
      gap: 1rem;
      font-size: 0.875rem;
      color: #6B7280;
    }

    .primary-toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.75rem;
      font-size: 0.8125rem;
      color: #4B5563;
      cursor: pointer;
    }

    .primary-toggle input {
      width: 16px;
      height: 16px;
      accent-color: #DC2626;
    }

    /* Add Contact Form */
    .add-contact-form {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px dashed #E5E7EB;
    }

    .add-contact-form h4 {
      font-size: 0.875rem;
      font-weight: 600;
      color: #6B7280;
      margin: 0 0 0.75rem;
    }

    .contact-inputs {
      display: grid;
      gap: 0.5rem;
    }

    .contact-input, .contact-select {
      padding: 0.75rem 1rem;
      border: 2px solid #E5E7EB;
      border-radius: 12px;
      font-size: 0.9375rem;
      transition: all 0.2s;
    }

    .contact-input:focus, .contact-select:focus {
      outline: none;
      border-color: #DC2626;
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
    }

    .add-contact-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.875rem;
      border: 2px dashed #D1D5DB;
      border-radius: 12px;
      background: white;
      color: #6B7280;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .add-contact-btn:hover:not(:disabled) {
      border-color: #DC2626;
      color: #DC2626;
      background: #FEF2F2;
    }

    .add-contact-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Save Button */
    .save-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 1rem;
      border: none;
      border-radius: 16px;
      background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
      color: white;
      font-family: 'Outfit', sans-serif;
      font-size: 1.125rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(185, 28, 28, 0.3);
    }

    .save-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(185, 28, 28, 0.4);
    }

    .save-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Dark mode support */
    :host-context(.dark) .medical-id-page {
      background: linear-gradient(180deg, #1C1917 0%, #0C0A09 50%);
    }

    :host-context(.dark) .emergency-card {
      background: #1C1917;
      border-color: #44403C;
    }

    :host-context(.dark) .card-header {
      background: linear-gradient(135deg, #292524 0%, #1C1917 100%);
    }

    :host-context(.dark) .name {
      color: #FAFAF9;
    }

    :host-context(.dark) .info-box {
      background: #292524;
      border-color: #44403C;
    }

    :host-context(.dark) .form-section {
      background: #1C1917;
    }

    :host-context(.dark) .chip-input,
    :host-context(.dark) .contact-input,
    :host-context(.dark) .contact-select,
    :host-context(.dark) .blood-type-btn {
      background: #292524;
      border-color: #44403C;
      color: #FAFAF9;
    }

    :host-context(.dark) .blood-type-btn.selected {
      background: linear-gradient(135deg, #4b1115 0%, #7f1d1d 100%);
      border-color: #f87171;
      color: #fee2e2;
      box-shadow: 0 0 0 2px rgba(248, 113, 113, 0.5);
    }

    :host-context(.dark) .blood-type-display {
      background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
    }
  `]
})
export class MedicalIdComponent implements OnInit {
  readonly medicalIdService = inject(MedicalIdService);
  readonly profileService = inject(ProfileService);
  readonly auth = inject(AuthService);
  private readonly referenceDataService = inject(ReferenceDataService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  // View state
  readonly viewMode = signal<ViewMode>('card');
  readonly saving = signal(false);

  // Constants
  readonly bloodTypes = BLOOD_TYPES;
  readonly relationships = RELATIONSHIPS;
  
  // Reference Data
  readonly commonAllergies = this.referenceDataService.allergies;
  readonly commonMedications = this.referenceDataService.medications;
  readonly commonConditions = this.referenceDataService.conditions;

  readonly qrCodeUrl = signal('');

  private readonly _qrPayload = computed(() => this.medicalIdService.generateQRData());

  constructor() {
    effect(() => {
      const payload = this._qrPayload();
      this.updateQrCode(payload);
    });
  }

  private async updateQrCode(payload: string): Promise<void> {
    if (!payload) {
      this.qrCodeUrl.set('');
      return;
    }

    try {
      const dataUrl = await toDataURL(payload, {
        width: 280,
        margin: 1, // Remove default margin for better styling control
        color: {
          dark: '#0F172A',
          light: '#FFFFFF'
        }
      });
      this.qrCodeUrl.set(dataUrl);
    } catch (error) {
      console.error('QR code generation failed', error);
      this.qrCodeUrl.set('');
    }
  }

  openQrDialog(): void {
    const qrUrl = this.qrCodeUrl();
    if (!qrUrl) {
      this.snackBar.open('Please wait while QR code is generating', 'Close', { duration: 3000 });
      return;
    }
    this.dialog.open(MedicalIdQrDialogComponent, {
      data: { qrCodeUrl: qrUrl },
      panelClass: 'medical-id-qr-dialog',
      width: 'calc(100vw - 32px)',
      maxWidth: '420px',
      autoFocus: false
    });
  }

  // Edit form data
  editData = {
    bloodType: null as BloodType | null,
    allergies: [] as string[],
    medications: [] as string[],
    medicalConditions: [] as string[],
    emergencyContacts: [] as EmergencyContact[]
  };

  newContact: Omit<EmergencyContact, 'id'> = {
    name: '',
    relationship: '',
    phone: '',
    isPrimary: false
  };

  countryOptions = [
    { country: 'United States', code: 'US', dial: '+1', flag: '🇺🇸' },
    { country: 'United Kingdom', code: 'GB', dial: '+44', flag: '🇬🇧' },
    { country: 'Canada', code: 'CA', dial: '+1', flag: '🇨🇦' },
    { country: 'Australia', code: 'AU', dial: '+61', flag: '🇦🇺' },
    { country: 'France', code: 'FR', dial: '+33', flag: '🇫🇷' },
    { country: 'Germany', code: 'DE', dial: '+49', flag: '🇩🇪' },
    { country: 'India', code: 'IN', dial: '+91', flag: '🇮🇳' },
  ];

  selectedCountryCode = this.getPreferredCountryCode();

  getPreferredCountryCode(): string {
    const locale = navigator.language?.split('-')[1] || navigator.language;
    const found = this.countryOptions.find(c => c.code.toLowerCase() === locale?.toLowerCase());
    return found?.dial || '+1';
  }

  get selectedCountry(): { country: string; code: string; dial: string; flag: string } {
    return this.countryOptions.find(c => c.dial === this.selectedCountryCode) || this.countryOptions[0];
  }

  formatPhoneInput(phone: string): string {
    const cleaned = phone.replaceAll(/[^\d+]/g, '');
    if (cleaned.startsWith('+')) return cleaned;
    if (!this.selectedCountryCode.startsWith('+')) return `+${this.selectedCountryCode}${cleaned}`;
    return `${this.selectedCountryCode}${cleaned}`;
  }

  updateCountryCode(code: string): void {
    this.selectedCountryCode = code;
    if (this.newContact.phone.trim()) {
      this.newContact.phone = this.formatPhoneInput(this.newContact.phone);
    }
  }

  isValidPhoneNumber(phone: string): boolean {
    const normalized = this.formatPhoneInput(phone);
    return /^\d{15}$/.test(normalized.replace(/^\+/, '')) || /^\+\d{6,15}$/.test(normalized);
  }

  // Computed
  readonly medicalIdData = computed(() => this.medicalIdService.medicalId());

  readonly displayName = computed(() => {
    const data = this.medicalIdData();
    return data?.name || this.auth.user()?.name || 'User';
  });

  readonly initials = computed(() => {
    const name = this.displayName();
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      const firstInitial = parts[0].charAt(0);
      const lastInitial = parts.at(-1)?.charAt(0) ?? '';
      return (firstInitial + lastInitial).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  });

  async shareMedicalId(): Promise<void> {
    const payload = this.buildEmergencyShareText();
    if (!payload) {
      this.snackBar.open('No medical data available to share yet', 'Close', { duration: 3000 });
      return;
    }

    const confirmed = globalThis.confirm(
      this.translate.instant('MEDICAL_ID.CONFIRM_SHARE'),
    );
    if (!confirmed) {
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'VibeHealth Medical ID',
          text: payload,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(payload);
        this.snackBar.open('Medical ID copied to clipboard', 'Close', { duration: 3000 });
        return;
      }

      this.snackBar.open('Share is not supported on this device', 'Close', { duration: 3000 });
    } catch (error) {
      console.error('Unable to share medical ID', error);
      this.snackBar.open('Unable to share Medical ID right now', 'Close', { duration: 3000 });
    }
  }

  exportMedicalIdPdf(): void {
    const printableHtml = this.buildPrintableMedicalIdHtml();
    if (!printableHtml) {
      this.snackBar.open('No medical data available to export yet', 'Close', { duration: 3000 });
      return;
    }

    const printWindow = window.open('', 'MedicalIDExport', 'noopener,noreferrer,width=900,height=700');
    if (!printWindow) {
      this.snackBar.open('Please allow popups to export your Medical ID', 'Close', { duration: 3000 });
      return;
    }

    printWindow.document.open();
    printWindow.document.write(printableHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  ngOnInit(): void {
    void (async () => {
      await this.profileService.loadProfile();
      await this.medicalIdService.loadMedicalId();
      this.syncEditData();
    })();
  }

  toggleMode() {
    if (this.viewMode() === 'card') {
      this.syncEditData();
      this.viewMode.set('edit');
    } else {
      this.viewMode.set('card');
    }
  }

  syncEditData() {
    const data = this.medicalIdData();
    if (data) {
      this.editData = {
        bloodType: data.bloodType,
        allergies: [...data.allergies],
        medications: [...data.medications],
        medicalConditions: [...(data.medicalConditions || [])],
        emergencyContacts: [...data.emergencyContacts]
      };
    }
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // Contact management
  canAddContact(): boolean {
    return !!(
      this.newContact.name.trim() &&
      this.newContact.relationship &&
      this.newContact.phone.trim() &&
      this.isValidPhoneNumber(this.newContact.phone)
    );
  }

  addContact() {
    if (!this.canAddContact()) return;

    const normalizedPhone = this.formatPhoneInput(this.newContact.phone.trim());

    const contact: EmergencyContact = {
      id: crypto.randomUUID(),
      name: this.newContact.name.trim(),
      relationship: this.newContact.relationship,
      phone: normalizedPhone,
      isPrimary: this.editData.emergencyContacts.length === 0
    };

    this.editData.emergencyContacts.push(contact);

    // Reset form
    this.newContact = { name: '', relationship: '', phone: '', isPrimary: false };
  }

  removeContact(id: string) {
    this.editData.emergencyContacts = this.editData.emergencyContacts.filter(c => c.id !== id);
  }

  setPrimaryContact(id: string) {
    this.editData.emergencyContacts = this.editData.emergencyContacts.map(c => ({
      ...c,
      isPrimary: c.id === id
    }));
  }

  async saveChanges() {
    this.saving.set(true);

    try {
      const success = await this.medicalIdService.saveMedicalId({
        bloodType: this.editData.bloodType,
        allergies: this.editData.allergies,
        medications: this.editData.medications,
        medicalConditions: this.editData.medicalConditions,
        emergencyContacts: this.editData.emergencyContacts
      });

      if (success) {
        this.viewMode.set('card');
      }
    } finally {
      this.saving.set(false);
    }
  }

  private buildEmergencyShareText(): string {
    const data = this.medicalIdData();
    if (!data) return '';

    const contact = data.emergencyContacts[0];
    const allergies = data.allergies.length > 0 ? data.allergies.join(', ') : 'None listed';
    const medications = data.medications.length > 0 ? data.medications.join(', ') : 'None listed';
    const conditions = data.medicalConditions.length > 0 ? data.medicalConditions.join(', ') : 'None listed';

    return [
      `Medical ID — ${this.displayName()}`,
      `Blood type: ${data.bloodType || 'Unknown'}`,
      `Allergies: ${allergies}`,
      `Medications: ${medications}`,
      `Conditions: ${conditions}`,
      contact ? `Emergency contact: ${contact.name} (${contact.relationship}) ${contact.phone}` : 'Emergency contact: None listed',
    ].join('\n');
  }

  private buildPrintableMedicalIdHtml(): string {
    const data = this.medicalIdData();
    if (!data) return '';

    const list = (items: string[]) => (items.length ? this.escapeHtml(items.join(', ')) : 'None listed');
    const contacts = data.emergencyContacts.length
      ? data.emergencyContacts
          .map((contact) => `<li>${this.escapeHtml(contact.name)} — ${this.escapeHtml(contact.relationship)} — ${this.escapeHtml(contact.phone)}</li>`)
          .join('')
      : '<li>None listed</li>';

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Medical ID - ${this.escapeHtml(this.displayName())}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
      h1 { margin: 0 0 12px; color: #b91c1c; }
      .meta { margin: 0 0 18px; color: #374151; }
      .card { border: 2px solid #fecaca; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
      .label { font-weight: 700; display: block; margin-bottom: 6px; }
      ul { margin: 0; padding-left: 18px; }
      @media print { body { padding: 0; } }
    </style>
  </head>
  <body>
    <h1>VibeHealth Medical ID</h1>
    <p class="meta">${this.escapeHtml(this.displayName())}</p>
    <section class="card"><span class="label">Blood Type</span>${this.escapeHtml(data.bloodType || 'Unknown')}</section>
    <section class="card"><span class="label">Allergies</span>${list(data.allergies)}</section>
    <section class="card"><span class="label">Medications</span>${list(data.medications)}</section>
    <section class="card"><span class="label">Conditions</span>${list(data.medicalConditions)}</section>
    <section class="card"><span class="label">Emergency Contacts</span><ul>${contacts}</ul></section>
  </body>
</html>`;
  }

  private escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (char) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };
      return entities[char] ?? char;
    });
  }
}
