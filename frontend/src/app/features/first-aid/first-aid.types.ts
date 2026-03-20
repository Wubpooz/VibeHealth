/**
 * First Aid Types
 * Comprehensive type definitions for the First Aid Guide feature
 */

export type FirstAidCategory =
  | 'burns'
  | 'choking'
  | 'cpr'
  | 'fractures'
  | 'allergic-reactions'
  | 'bleeding'
  | 'poisoning'
  | 'shock'
  | 'stroke'
  | 'heart-attack'
  | 'seizures'
  | 'hypothermia'
  | 'heat-stroke'
  | 'drowning'
  | 'bites-stings';

export type SeverityLevel = 'critical' | 'serious' | 'moderate' | 'minor';

export interface FirstAidStep {
  order: number;
  instruction: string;
  warning?: string;
  tip?: string;
  duration?: string;
}

export interface FirstAidCard {
  id: string;
  category: FirstAidCategory;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  severity: SeverityLevel;
  steps: FirstAidStep[];
  warnings?: string[];
  whenToCallEmergency?: string[];
  doNot?: string[];
  relatedCards?: string[];
}

export interface EmergencyNumber {
  country: string;
  countryCode: string;
  flag: string;
  numbers: {
    general: string;
    police?: string;
    fire?: string;
    ambulance?: string;
    poisonControl?: string;
  };
}

export interface Helpline {
  id: string;
  nameKey: string;
  descriptionKey: string;
  phone: string;
  website?: string;
  available: string;
  countries: string[];
  category: 'mental-health' | 'suicide-prevention' | 'abuse' | 'addiction' | 'general';
  icon: string;
}

export interface FirstAidSearchResult {
  card: FirstAidCard;
  matchScore: number;
  matchedTerms: string[];
}

export interface UserCountryInfo {
  code: string;
  name: string;
  emergencyNumber: EmergencyNumber | null;
}
