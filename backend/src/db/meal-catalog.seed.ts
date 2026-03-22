/**
 * Meal Catalog Seed
 * Reference meal templates for nutrition auto-complete and quick logging.
 * Values are practical meal templates intended for autofill, not strict lab measurements.
 */

import { prisma } from '../lib/prisma';
import type { MealType } from '@prisma/client';

export interface MealCatalogEntry {
  key: string;
  mealType: MealType;
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  servingSize?: string;
  emoji: string;
  tags: string[];
}

type MealCatalogClient = {
  findUnique: (args: { where: { key: string } }) => Promise<unknown>;
  findMany: (args?: unknown) => Promise<unknown[]>;
  findFirst: (args: { where: { id?: string; key?: string; isActive?: boolean } }) => Promise<unknown>;
  upsert: (args: unknown) => Promise<unknown>;
};

export const MEAL_CATALOG: MealCatalogEntry[] = [
  // BREAKFAST
  {
    key: 'BREAKFAST_OATMEAL_BERRIES',
    mealType: 'BREAKFAST',
    name: 'Oatmeal with Berries',
    calories: 320,
    protein: 10,
    carbs: 54,
    fat: 8,
    fiber: 8,
    sugar: 12,
    sodium: 180,
    servingSize: '1 bowl',
    emoji: '🥣',
    tags: ['breakfast', 'high-fiber', 'vegetarian', 'quick'],
  },
  {
    key: 'BREAKFAST_GREEK_YOGURT_GRANOLA',
    mealType: 'BREAKFAST',
    name: 'Greek Yogurt with Granola',
    calories: 290,
    protein: 20,
    carbs: 34,
    fat: 8,
    fiber: 4,
    sugar: 16,
    sodium: 110,
    servingSize: '1 bowl',
    emoji: '🍓',
    tags: ['breakfast', 'high-protein', 'vegetarian', 'quick'],
  },
  {
    key: 'BREAKFAST_EGGS_TOAST',
    mealType: 'BREAKFAST',
    name: 'Eggs and Toast',
    calories: 350,
    protein: 20,
    carbs: 28,
    fat: 18,
    fiber: 3,
    sugar: 4,
    sodium: 420,
    servingSize: '2 eggs + 2 slices',
    emoji: '🍳',
    tags: ['breakfast', 'high-protein', 'savory', 'quick'],
  },
  {
    key: 'BREAKFAST_AVOCADO_TOAST',
    mealType: 'BREAKFAST',
    name: 'Avocado Toast',
    calories: 330,
    protein: 10,
    carbs: 30,
    fat: 18,
    fiber: 8,
    sugar: 4,
    sodium: 360,
    servingSize: '2 slices',
    emoji: '🥑',
    tags: ['breakfast', 'vegetarian', 'fiber-rich', 'quick'],
  },
  {
    key: 'BREAKFAST_SMOOTHIE_PROTEIN',
    mealType: 'BREAKFAST',
    name: 'Protein Smoothie',
    calories: 280,
    protein: 28,
    carbs: 22,
    fat: 8,
    fiber: 5,
    sugar: 16,
    sodium: 220,
    servingSize: '1 large glass',
    emoji: '🥤',
    tags: ['breakfast', 'high-protein', 'drink', 'quick'],
  },

  // LUNCH
  {
    key: 'LUNCH_CHICKEN_BOWL',
    mealType: 'LUNCH',
    name: 'Chicken Rice Bowl',
    calories: 540,
    protein: 38,
    carbs: 52,
    fat: 18,
    fiber: 6,
    sugar: 8,
    sodium: 640,
    servingSize: '1 bowl',
    emoji: '🍚',
    tags: ['lunch', 'high-protein', 'balanced', 'meal-prep'],
  },
  {
    key: 'LUNCH_GREEK_SALAD',
    mealType: 'LUNCH',
    name: 'Greek Salad with Feta',
    calories: 310,
    protein: 12,
    carbs: 18,
    fat: 21,
    fiber: 5,
    sugar: 8,
    sodium: 520,
    servingSize: '1 bowl',
    emoji: '🥗',
    tags: ['lunch', 'vegetarian', 'low-carb', 'fresh'],
  },
  {
    key: 'LUNCH_TUNA_WRAP',
    mealType: 'LUNCH',
    name: 'Tuna Wrap',
    calories: 430,
    protein: 30,
    carbs: 34,
    fat: 18,
    fiber: 4,
    sugar: 5,
    sodium: 780,
    servingSize: '1 wrap',
    emoji: '🌯',
    tags: ['lunch', 'high-protein', 'portable', 'quick'],
  },
  {
    key: 'LUNCH_LENTIL_SOUP',
    mealType: 'LUNCH',
    name: 'Lentil Soup and Bread',
    calories: 410,
    protein: 22,
    carbs: 58,
    fat: 10,
    fiber: 14,
    sugar: 8,
    sodium: 640,
    servingSize: '1 bowl + 1 slice',
    emoji: '🍲',
    tags: ['lunch', 'vegetarian', 'high-fiber', 'comfort'],
  },
  {
    key: 'LUNCH_BUDDHA_BOWL',
    mealType: 'LUNCH',
    name: 'Buddha Bowl',
    calories: 520,
    protein: 18,
    carbs: 60,
    fat: 22,
    fiber: 12,
    sugar: 9,
    sodium: 460,
    servingSize: '1 bowl',
    emoji: '🥙',
    tags: ['lunch', 'vegetarian', 'balanced', 'colorful'],
  },

  // DINNER
  {
    key: 'DINNER_SALMON_VEGGIES',
    mealType: 'DINNER',
    name: 'Salmon with Vegetables',
    calories: 560,
    protein: 42,
    carbs: 20,
    fat: 34,
    fiber: 7,
    sugar: 8,
    sodium: 520,
    servingSize: '1 plate',
    emoji: '🐟',
    tags: ['dinner', 'high-protein', 'omega-3', 'balanced'],
  },
  {
    key: 'DINNER_CHICKEN_PASTA',
    mealType: 'DINNER',
    name: 'Chicken Pasta',
    calories: 650,
    protein: 36,
    carbs: 72,
    fat: 22,
    fiber: 6,
    sugar: 10,
    sodium: 760,
    servingSize: '1 plate',
    emoji: '🍝',
    tags: ['dinner', 'balanced', 'family', 'comfort'],
  },
  {
    key: 'DINNER_TOFU_STIR_FRY',
    mealType: 'DINNER',
    name: 'Tofu Stir Fry',
    calories: 480,
    protein: 26,
    carbs: 44,
    fat: 20,
    fiber: 8,
    sugar: 12,
    sodium: 680,
    servingSize: '1 plate',
    emoji: '🥡',
    tags: ['dinner', 'vegetarian', 'high-protein', 'quick'],
  },
  {
    key: 'DINNER_BEEF_TACOS',
    mealType: 'DINNER',
    name: 'Beef Tacos',
    calories: 590,
    protein: 34,
    carbs: 38,
    fat: 31,
    fiber: 7,
    sugar: 6,
    sodium: 820,
    servingSize: '3 tacos',
    emoji: '🌮',
    tags: ['dinner', 'high-protein', 'comfort', 'casual'],
  },
  {
    key: 'DINNER_VEGETABLE_CURRY',
    mealType: 'DINNER',
    name: 'Vegetable Curry with Rice',
    calories: 540,
    protein: 14,
    carbs: 78,
    fat: 18,
    fiber: 10,
    sugar: 12,
    sodium: 690,
    servingSize: '1 bowl',
    emoji: '🍛',
    tags: ['dinner', 'vegetarian', 'high-fiber', 'comfort'],
  },

  // SNACK
  {
    key: 'SNACK_APPLE_PB',
    mealType: 'SNACK',
    name: 'Apple with Peanut Butter',
    calories: 220,
    protein: 6,
    carbs: 24,
    fat: 12,
    fiber: 5,
    sugar: 16,
    sodium: 110,
    servingSize: '1 apple + 2 tbsp',
    emoji: '🍎',
    tags: ['snack', 'fiber-rich', 'balanced', 'quick'],
  },
  {
    key: 'SNACK_NUTS',
    mealType: 'SNACK',
    name: 'Mixed Nuts',
    calories: 180,
    protein: 6,
    carbs: 6,
    fat: 16,
    fiber: 3,
    sugar: 2,
    sodium: 0,
    servingSize: '30g',
    emoji: '🥜',
    tags: ['snack', 'low-carb', 'high-fat', 'portable'],
  },
  {
    key: 'SNACK_PROTEIN_BAR',
    mealType: 'SNACK',
    name: 'Protein Bar',
    calories: 210,
    protein: 18,
    carbs: 22,
    fat: 8,
    fiber: 7,
    sugar: 9,
    sodium: 180,
    servingSize: '1 bar',
    emoji: '🍫',
    tags: ['snack', 'high-protein', 'portable', 'quick'],
  },
  {
    key: 'SNACK_HUMMUS_CARROTS',
    mealType: 'SNACK',
    name: 'Hummus and Carrot Sticks',
    calories: 170,
    protein: 5,
    carbs: 18,
    fat: 8,
    fiber: 5,
    sugar: 6,
    sodium: 230,
    servingSize: '1 cup',
    emoji: '🥕',
    tags: ['snack', 'vegetarian', 'fiber-rich', 'fresh'],
  },
  {
    key: 'SNACK_GREEK_YOGURT',
    mealType: 'SNACK',
    name: 'Greek Yogurt Cup',
    calories: 150,
    protein: 15,
    carbs: 12,
    fat: 4,
    fiber: 0,
    sugar: 10,
    sodium: 75,
    servingSize: '1 cup',
    emoji: '🥛',
    tags: ['snack', 'high-protein', 'light', 'quick'],
  },
];

export async function seedMealCatalog(): Promise<void> {
  console.log(`   Seeding ${MEAL_CATALOG.length} meal catalog entries...`);

  let created = 0;
  let updated = 0;
  const mealCatalog = (prisma as unknown as { mealCatalog: MealCatalogClient }).mealCatalog;

  for (const entry of MEAL_CATALOG) {
    const existing = await mealCatalog.findUnique({
      where: { key: entry.key },
    });

    await mealCatalog.upsert({
      where: { key: entry.key },
      update: {
        mealType: entry.mealType,
        name: entry.name,
        calories: entry.calories,
        protein: entry.protein,
        carbs: entry.carbs,
        fat: entry.fat,
        fiber: entry.fiber,
        sugar: entry.sugar,
        sodium: entry.sodium,
        servingSize: entry.servingSize,
        emoji: entry.emoji,
        tags: entry.tags,
        isActive: true,
      },
      create: {
        key: entry.key,
        mealType: entry.mealType,
        name: entry.name,
        calories: entry.calories,
        protein: entry.protein,
        carbs: entry.carbs,
        fat: entry.fat,
        fiber: entry.fiber,
        sugar: entry.sugar,
        sodium: entry.sodium,
        servingSize: entry.servingSize,
        emoji: entry.emoji,
        tags: entry.tags,
        isActive: true,
      },
    });

    if (existing) updated++;
    else created++;
  }

  console.log(`   ✓ Meal catalog: ${created} created, ${updated} updated`);
}
