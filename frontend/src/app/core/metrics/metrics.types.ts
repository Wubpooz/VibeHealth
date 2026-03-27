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

// =============================================================================
// Activity Types
// =============================================================================

export type ActivityType =
  | 'WALK'
  | 'RUN'
  | 'CYCLE'
  | 'SWIM'
  | 'YOGA'
  | 'STRENGTH'
  | 'HIIT'
  | 'SPORTS'
  | 'DANCE'
  | 'OTHER';

export type Intensity = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';

export interface ActivityCatalogEntry {
  id: string;
  key: string;
  name: string;
  category: ActivityType;
  metValue: number;
  emoji: string;
  description?: string | null;
  tags: string[];
  isActive: boolean;
}

export interface MealCatalogEntry {
  id: string;
  key: string;
  mealType: MealType;
  name: string;
  calories: number;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  fiber?: number | null;
  sugar?: number | null;
  sodium?: number | null;
  servingSize?: string | null;
  emoji: string;
  tags: string[];
  isActive: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  type: ActivityType;
  name: string;
  duration: number; // minutes
  calories?: number;
  distance?: number; // km
  intensity: Intensity;
  heartRateAvg?: number;
  notes?: string;
  source: string;
  loggedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivitySummary {
  totalMinutes: number;
  totalCalories: number;
  totalDistance: number;
  activitiesCount: number;
  byType: Record<string, { count: number; minutes: number; calories: number }>;
  logs: ActivityLog[];
}

export interface WeeklyActivitySummary {
  dailySummary: Record<string, { minutes: number; calories: number; count: number }>;
  totalMinutes: number;
  totalCalories: number;
  activeDays: number;
}

export const ACTIVITY_PRESETS: Record<ActivityType, { label: string; emoji: string; caloriesPerMin: number }> = {
  WALK: { label: 'Walk', emoji: '🚶', caloriesPerMin: 4 },
  RUN: { label: 'Run', emoji: '🏃', caloriesPerMin: 10 },
  CYCLE: { label: 'Cycle', emoji: '🚴', caloriesPerMin: 8 },
  SWIM: { label: 'Swim', emoji: '🏊', caloriesPerMin: 9 },
  YOGA: { label: 'Yoga', emoji: '🧘', caloriesPerMin: 3 },
  STRENGTH: { label: 'Strength', emoji: '🏋️', caloriesPerMin: 6 },
  HIIT: { label: 'HIIT', emoji: '⚡', caloriesPerMin: 12 },
  SPORTS: { label: 'Sports', emoji: '⚽', caloriesPerMin: 7 },
  DANCE: { label: 'Dance', emoji: '💃', caloriesPerMin: 6 },
  OTHER: { label: 'Other', emoji: '🎯', caloriesPerMin: 5 },
};

export const INTENSITY_LABELS: Record<Intensity, { label: string; multiplier: number }> = {
  LOW: { label: 'Low', multiplier: 0.8 },
  MODERATE: { label: 'Moderate', multiplier: 1 },
  HIGH: { label: 'High', multiplier: 1.2 },
  VERY_HIGH: { label: 'Very High', multiplier: 1.4 },
};

// =============================================================================
// Meal/Nutrition Types
// =============================================================================

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface MealLog {
  id: string;
  userId: string;
  mealType: MealType;
  name: string;
  calories?: number;
  protein?: number; // grams
  carbs?: number;   // grams
  fat?: number;     // grams
  fiber?: number;   // grams
  sugar?: number;   // grams
  sodium?: number;  // mg
  servingSize?: string;
  barcode?: string;
  notes?: string;
  imageUrl?: string;
  source: string;
  mealCatalogId?: string | null;
  loggedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface NutritionSummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSugar: number;
  mealsCount: number;
  byMealType: Record<string, { count: number; calories: number }>;
  logs: MealLog[];
}

export interface WeeklyNutritionSummary {
  dailySummary: Record<string, { calories: number; protein: number; carbs: number; fat: number; count: number }>;
  averageCalories: number;
  totalMeals: number;
}

export const MEAL_TYPE_INFO: Record<MealType, { label: string; emoji: string; defaultTime: string }> = {
  BREAKFAST: { label: 'Breakfast', emoji: '🍳', defaultTime: '08:00' },
  LUNCH: { label: 'Lunch', emoji: '🥗', defaultTime: '12:00' },
  DINNER: { label: 'Dinner', emoji: '🍽️', defaultTime: '19:00' },
  SNACK: { label: 'Snack', emoji: '🍎', defaultTime: '15:00' },
};

// Recommended daily values for reference
export const DAILY_GOALS = {
  calories: 2000,
  protein: 50, // grams
  carbs: 300,  // grams
  fat: 65,     // grams
  fiber: 25,   // grams
  sugar: 50,   // grams
  sodium: 2300, // mg
  water: 2500,  // ml
  steps: 10000,
  activityMinutes: 30,
  sleepHours: 8,
};

// =============================================================================
// Workouts + Health Sync Types
// =============================================================================

export type ExerciseCategory = 'STRENGTH' | 'CARDIO' | 'MOBILITY' | 'FLEXIBILITY' | 'RECOVERY';
export type WorkoutDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type HealthSyncProvider = 'GOOGLE_FIT' | 'SAMSUNG_HEALTH';

export interface WorkoutExerciseSuggestion {
  id: string;
  key: string;
  name: string;
  category: ExerciseCategory;
  difficulty: WorkoutDifficulty;
  defaultSets: number;
  defaultRepsMin: number;
  defaultRepsMax: number;
  defaultRestSeconds: number;
  instructions?: string | null;
  tags: string[];
}

export interface WorkoutPlanExercise {
  id: string;
  workoutPlanId: string;
  exerciseCatalogId: string;
  orderIndex: number;
  sets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
  exercise: WorkoutExerciseSuggestion;
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  difficulty: WorkoutDifficulty;
  isActive: boolean;
  exercises: WorkoutPlanExercise[];
}

export interface WorkoutSuggestions {
  categories: ExerciseCategory[];
  difficulty: WorkoutDifficulty;
  exercises: WorkoutExerciseSuggestion[];
}

export interface WorkoutSetLogResult {
  workoutPlanExerciseId: string;
  repsCompleted: number;
  targetReps: {
    min: number;
    max: number;
  };
  restSeconds: number;
  exerciseName: string;
}

export interface HealthSyncConnection {
  id: string;
  userId: string;
  provider: HealthSyncProvider;
  connected: boolean;
  autoSync: boolean;
  lastSyncAt?: string | null;
}

export interface HealthSyncOAuthStartResponse {
  success: boolean;
  provider: HealthSyncProvider;
  mode: 'oauth_placeholder';
  authUrl: string;
  expiresInSeconds: number;
}
