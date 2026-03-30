// Onboarding Wizard Types

export interface OnboardingProfile {
  // Step 1: Personal Info
  name: string;
  dateOfBirth: string;
  biologicalSex: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  
  // Step 2: Body Metrics
  height: number;
  heightUnit: 'cm' | 'ft';
  weight: number;
  weightUnit: 'kg' | 'lb';
  
  // Step 3: Health Info
  medicalConditions: string[];
  allergies: string[];
  currentMedications: string[];
  
  // Step 4: Goals
  fitnessLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goals: HealthGoal[];
  
  // Step 5: Preferences
  notificationPreferences: NotificationPreferences;
}

export type HealthGoal = 
  | 'weight_loss'
  | 'muscle_gain'
  | 'maintenance'
  | 'better_sleep'
  | 'stress_reduction'
  | 'nutrition'
  | 'hydration'
  | 'general_wellness';

export interface NotificationPreferences {
  dailyReminders: boolean;
  weeklyReports: boolean;
  achievements: boolean;
  medicationReminders: boolean;
}

export interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  bunnyMood: 'wave' | 'curious' | 'thinking' | 'excited' | 'celebrate';
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to VibeHealth!',
    subtitle: "Let's get to know each other",
    icon: '👋',
    bunnyMood: 'wave',
  },
  {
    id: 'personal',
    title: 'About You',
    subtitle: 'The basics to personalize your experience',
    icon: '🪪',
    bunnyMood: 'curious',
  },
  {
    id: 'body',
    title: 'Your Body',
    subtitle: 'Help us tailor recommendations',
    icon: '📏',
    bunnyMood: 'thinking',
  },
  {
    id: 'health',
    title: 'Health Background',
    subtitle: 'Important info for your safety',
    icon: '🏥',
    bunnyMood: 'curious',
  },
  {
    id: 'goals',
    title: 'Your Goals',
    subtitle: 'What would you like to achieve?',
    icon: '🎯',
    bunnyMood: 'excited',
  },
  {
    id: 'complete',
    title: "You're All Set!",
    subtitle: 'Ready to start your health journey',
    icon: '🎉',
    bunnyMood: 'celebrate',
  },
];
