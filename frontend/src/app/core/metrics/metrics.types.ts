// Types for metrics tracking

export interface VitalLog {
  id: string;
  userId: string;
  type: VitalType;
  value: number;
  unit: string;
  source: string;
  notes?: string;
  loggedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type VitalType =
  | 'HEART_RATE'
  | 'BLOOD_PRESSURE_SYSTOLIC'
  | 'BLOOD_PRESSURE_DIASTOLIC'
  | 'SLEEP_HOURS'
  | 'STEPS'
  | 'WEIGHT'
  | 'BODY_TEMPERATURE'
  | 'OXYGEN_SATURATION';

export interface HydrationLog {
  id: string;
  userId: string;
  amount: number; // in ml
  unit: string;
  source: string;
  loggedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface HydrationSummary {
  totalMl: number;
  goalMl: number;
  percentage: number;
  glassesCount: number;
  logs: HydrationLog[];
}

export interface VitalsSummary {
  summary: Record<VitalType, { value: number; unit: string; loggedAt: string }>;
  logs: VitalLog[];
}

export type HydrationPreset = 'glass' | 'bottle' | 'large';

export const HYDRATION_PRESETS: Record<HydrationPreset, { amount: number; label: string; emoji: string }> = {
  glass: { amount: 250, label: 'Glass', emoji: '🥛' },
  bottle: { amount: 500, label: 'Bottle', emoji: '🧃' },
  large: { amount: 750, label: 'Large', emoji: '🫗' },
};

export const VITAL_UNITS: Record<VitalType, string> = {
  HEART_RATE: 'bpm',
  BLOOD_PRESSURE_SYSTOLIC: 'mmHg',
  BLOOD_PRESSURE_DIASTOLIC: 'mmHg',
  SLEEP_HOURS: 'hours',
  STEPS: 'steps',
  WEIGHT: 'kg',
  BODY_TEMPERATURE: '°C',
  OXYGEN_SATURATION: '%',
};

export const VITAL_LABELS: Record<VitalType, string> = {
  HEART_RATE: 'Heart Rate',
  BLOOD_PRESSURE_SYSTOLIC: 'Blood Pressure (Systolic)',
  BLOOD_PRESSURE_DIASTOLIC: 'Blood Pressure (Diastolic)',
  SLEEP_HOURS: 'Sleep',
  STEPS: 'Steps',
  WEIGHT: 'Weight',
  BODY_TEMPERATURE: 'Temperature',
  OXYGEN_SATURATION: 'Oxygen Saturation',
};

export const VITAL_ICONS: Record<VitalType, string> = {
  HEART_RATE: '❤️',
  BLOOD_PRESSURE_SYSTOLIC: '🩺',
  BLOOD_PRESSURE_DIASTOLIC: '🩺',
  SLEEP_HOURS: '😴',
  STEPS: '👟',
  WEIGHT: '⚖️',
  BODY_TEMPERATURE: '🌡️',
  OXYGEN_SATURATION: '🫁',
};
