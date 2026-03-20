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

export const HEALTH_GOALS: { id: HealthGoal; label: string; emoji: string; description: string }[] = [
  { id: 'weight_loss', label: 'Lose Weight', emoji: '⚖️', description: 'Reach your ideal weight' },
  { id: 'muscle_gain', label: 'Build Muscle', emoji: '💪', description: 'Grow stronger' },
  { id: 'maintenance', label: 'Maintain', emoji: '✨', description: 'Keep up the good work' },
  { id: 'better_sleep', label: 'Sleep Better', emoji: '😴', description: 'Improve rest quality' },
  { id: 'stress_reduction', label: 'Less Stress', emoji: '🧘', description: 'Find your calm' },
  { id: 'nutrition', label: 'Eat Better', emoji: '🥗', description: 'Healthier food choices' },
  { id: 'hydration', label: 'Stay Hydrated', emoji: '💧', description: 'Drink more water' },
  { id: 'general_wellness', label: 'Feel Great', emoji: '🌟', description: 'Overall wellness' },
];

export const FITNESS_LEVELS: { id: OnboardingProfile['fitnessLevel']; label: string; description: string }[] = [
  { id: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
  { id: 'light', label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
  { id: 'moderate', label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
  { id: 'active', label: 'Active', description: 'Hard exercise 6-7 days/week' },
  { id: 'very_active', label: 'Very Active', description: 'Intense daily training' },
];

export const COMMON_CONDITIONS = [
  'Diabetes',
  'Hypertension',
  'Asthma',
  'Heart Disease',
  'Arthritis',
  'Thyroid Disorder',
  'Depression',
  'Anxiety',
];

export const COMMON_ALLERGIES = [
  'Peanuts',
  'Tree Nuts',
  'Shellfish',
  'Fish',
  'Milk',
  'Eggs',
  'Wheat',
  'Soy',
  'Penicillin',
  'Latex',
];
