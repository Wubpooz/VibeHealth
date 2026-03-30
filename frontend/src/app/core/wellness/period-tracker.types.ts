/**
 * Period Tracker Types
 * TypeScript interfaces for period tracking data
 */

export interface PeriodLog {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string | null;
  flowIntensity: 'LIGHT' | 'MEDIUM' | 'HEAVY';
  symptoms: string[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PeriodLogsListResponse {
  success: boolean;
  data: PeriodLog[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface CycleInsights {
  lastPeriodStart: string | null;
  averageCycleLength: number | null;
  averagePeriodDuration: number | null;
  predictedNextPeriodStart: string | null;
  fertilityWindow: {
    start: string;
    end: string;
  } | null;
  dataPoints: number;
}

export interface CycleInsightsResponse {
  success: boolean;
  data: CycleInsights;
}

export interface ContraceptivePillReminder {
  enabled: boolean;
  timeOfDay: string; // HH:MM
  snoozeDuration: number; // minutes
  dayOfWeekReminders?: number[];
  notes?: string;
}

export interface ContraceptivePillReminderResponse {
  success: boolean;
  data: ContraceptivePillReminder | null;
}

export interface PeriodLogCreatePayload {
  startDate: string; // YYYY-MM-DD
  endDate?: string | null;
  flowIntensity?: 'LIGHT' | 'MEDIUM' | 'HEAVY';
  symptoms?: string[];
  notes?: string;
}

export interface PeriodLogUpdatePayload {
  endDate?: string | null;
  flowIntensity?: 'LIGHT' | 'MEDIUM' | 'HEAVY';
  symptoms?: string[];
  notes?: string;
}

export const FLOW_INTENSITY_OPTIONS = ['LIGHT', 'MEDIUM', 'HEAVY'] as const;

export const SYMPTOMS_OPTIONS = [
  'CRAMPS',
  'BLOATING',
  'HEADACHE',
  'FATIGUE',
  'MOOD_SWINGS',
  'BACK_PAIN',
  'BREAST_TENDERNESS',
  'NAUSEA',
  'ACNE',
  'APPETITE_CHANGES',
] as const;

export const SYMPTOMS_LABELS: Record<string, string> = {
  CRAMPS: 'Cramps',
  BLOATING: 'Bloating',
  HEADACHE: 'Headache',
  FATIGUE: 'Fatigue',
  MOOD_SWINGS: 'Mood Swings',
  BACK_PAIN: 'Back Pain',
  BREAST_TENDERNESS: 'Breast Tenderness',
  NAUSEA: 'Nausea',
  ACNE: 'Acne',
  APPETITE_CHANGES: 'Appetite Changes',
};

export const FLOW_INTENSITY_LABELS: Record<string, string> = {
  LIGHT: 'Light',
  MEDIUM: 'Medium',
  HEAVY: 'Heavy',
};
