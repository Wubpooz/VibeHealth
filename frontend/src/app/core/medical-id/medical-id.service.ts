import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MedicalIdData, EmergencyContact, BloodType } from '../../features/medical-id/medical-id.types';
import { ProfileService } from '../profile/profile.service';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class MedicalIdService {
  private readonly http = inject(HttpClient);
  private readonly profileService = inject(ProfileService);
  private readonly authService = inject(AuthService);
  
  private readonly _medicalId = signal<MedicalIdData | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  
  // Public signals
  readonly medicalId = this._medicalId.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  
  readonly hasMedicalId = computed(() => this._medicalId() !== null);
  
  // Quick-access critical info
  readonly criticalInfo = computed(() => {
    const data = this._medicalId();
    if (!data) return null;
    return {
      bloodType: data.bloodType,
      allergies: data.allergies,
      medications: data.medications,
      primaryContact: data.emergencyContacts.find(c => c.isPrimary) || data.emergencyContacts[0],
    };
  });

  /**
   * Load medical ID from server
   */
  async loadMedicalId(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    
    try {
      const response = await this.http.get<{ medicalId: MedicalIdData | null }>('/api/v1/medical-id', {
        withCredentials: true
      }).toPromise();
      
      if (response?.medicalId) {
        this._medicalId.set({
          ...response.medicalId,
          lastUpdated: new Date(response.medicalId.lastUpdated)
        });
        // Cache for offline access
        this.cacheForOffline(response.medicalId);
      } else {
        // Try to build from profile data
        await this.buildFromProfile();
      }
    } catch (err) {
      console.error('Failed to load medical ID:', err);
      // Try offline cache
      this.loadFromOfflineCache();
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Save medical ID to server
   */
  async saveMedicalId(data: Partial<MedicalIdData>): Promise<boolean> {
    this._loading.set(true);
    this._error.set(null);
    
    try {
      const response = await this.http.post<{ medicalId: MedicalIdData }>('/api/v1/medical-id', data, {
        withCredentials: true
      }).toPromise();
      
      if (response?.medicalId) {
        this._medicalId.set({
          ...response.medicalId,
          lastUpdated: new Date(response.medicalId.lastUpdated)
        });
        this.cacheForOffline(response.medicalId);
        return true;
      }
      return false;
    } catch (err: any) {
      this._error.set(err.message || 'Failed to save medical ID');
      return false;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Update blood type
   */
  async updateBloodType(bloodType: BloodType): Promise<boolean> {
    return this.saveMedicalId({ bloodType });
  }

  /**
   * Add emergency contact
   */
  async addEmergencyContact(contact: Omit<EmergencyContact, 'id'>): Promise<boolean> {
    const current = this._medicalId();
    const newContact: EmergencyContact = {
      ...contact,
      id: crypto.randomUUID(),
    };
    
    const contacts = [...(current?.emergencyContacts || []), newContact];
    return this.saveMedicalId({ emergencyContacts: contacts });
  }

  /**
   * Remove emergency contact
   */
  async removeEmergencyContact(contactId: string): Promise<boolean> {
    const current = this._medicalId();
    if (!current) return false;
    
    const contacts = current.emergencyContacts.filter(c => c.id !== contactId);
    return this.saveMedicalId({ emergencyContacts: contacts });
  }

  /**
   * Generate QR code data URL
   */
  generateQRData(): string {
    const data = this._medicalId();
    if (!data) return '';
    
    // Compact emergency data for QR
    const qrData = {
      n: data.name,
      dob: data.dateOfBirth,
      bt: data.bloodType,
      a: data.allergies.slice(0, 5), // Limit for QR size
      m: data.medications.slice(0, 5),
      ec: data.emergencyContacts.slice(0, 2).map(c => ({
        n: c.name,
        p: c.phone
      }))
    };
    
    return JSON.stringify(qrData);
  }

  /**
   * Build medical ID from existing profile data
   */
  private async buildFromProfile(): Promise<void> {
    const profile = this.profileService.profile();
    if (!profile) return;
    
    // Get user name from auth service
    const user = this.authService.user();
    
    // Calculate age from DOB
    const dob = profile.dateOfBirth ? new Date(profile.dateOfBirth) : null;
    const age = dob ? this.calculateAge(dob) : 0;
    
    const medicalId: MedicalIdData = {
      name: user?.name || '',
      dateOfBirth: profile.dateOfBirth || '',
      age,
      bloodType: null,
      allergies: profile.allergies || [],
      medications: profile.currentMedications || [],
      medicalConditions: profile.medicalConditions || [],
      emergencyContacts: [],
      lastUpdated: new Date(),
    };
    
    this._medicalId.set(medicalId);
  }

  /**
   * Cache for offline access (Service Worker will handle this)
   */
  private cacheForOffline(data: MedicalIdData): void {
    try {
      localStorage.setItem('vibehealth_medical_id_cache', JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to cache medical ID:', e);
    }
  }

  /**
   * Load from offline cache
   */
  private loadFromOfflineCache(): void {
    try {
      const cached = localStorage.getItem('vibehealth_medical_id_cache');
      if (cached) {
        const data = JSON.parse(cached);
        this._medicalId.set({
          ...data,
          lastUpdated: new Date(data.lastUpdated)
        });
      }
    } catch (e) {
      console.warn('Failed to load cached medical ID:', e);
    }
  }

  private calculateAge(dob: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }
}
