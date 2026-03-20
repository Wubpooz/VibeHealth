// Medical ID Types

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

export interface MedicalIdData {
  // Personal info (derived from profile/user)
  name: string;
  dateOfBirth: string;
  age: number;
  
  // Medical info
  bloodType: BloodType | null;
  allergies: string[];
  medications: string[];
  medicalConditions: string[];
  
  // Emergency contacts
  emergencyContacts: EmergencyContact[];
  
  // Additional notes
  medicalNotes?: string;
  organDonor?: boolean;
  
  // QR data
  qrCode?: string;
  
  // Metadata
  lastUpdated: Date;
}

export type BloodType = 
  | 'A+'  | 'A-'
  | 'B+'  | 'B-'
  | 'AB+' | 'AB-'
  | 'O+'  | 'O-';

export const BLOOD_TYPES: BloodType[] = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];

export const RELATIONSHIPS = [
  'Spouse',
  'Parent',
  'Child',
  'Sibling',
  'Partner',
  'Friend',
  'Doctor',
  'Other'
];
