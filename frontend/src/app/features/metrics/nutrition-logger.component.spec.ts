/// <reference types="jasmine" />

import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import type { MealCatalogEntry, NutritionSummary } from '../../core/metrics/metrics.types';
import { MetricsService } from '../../core/metrics/metrics.service';
import { RewardsService } from '../../core/rewards/rewards.service';
import { NutritionLoggerComponent } from './nutrition-logger.component';

describe('NutritionLoggerComponent', () => {
  const nutritionToday = signal<NutritionSummary | null>(null);
  const mealCatalog = signal<MealCatalogEntry[]>([]);

  const metricsServiceMock = {
    caloriesToday: signal(0),
    proteinToday: signal(0),
    carbsToday: signal(0),
    fatToday: signal(0),
    nutritionToday,
    mealCatalog,
    loadNutritionToday: jasmine.createSpy('loadNutritionToday').and.resolveTo(undefined),
    loadMealCatalog: jasmine.createSpy('loadMealCatalog').and.resolveTo(undefined),
    logMeal: jasmine.createSpy('logMeal').and.resolveTo({ success: true, carrots: 1 }),
  };

  const rewardsServiceMock = {
    awardCarrots: jasmine.createSpy('awardCarrots'),
  };

  async function createComponent() {
    await TestBed.configureTestingModule({
      imports: [NutritionLoggerComponent, TranslateModule.forRoot()],
      providers: [
        { provide: MetricsService, useValue: metricsServiceMock },
        { provide: RewardsService, useValue: rewardsServiceMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(NutritionLoggerComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    mealCatalog.set([]);
    nutritionToday.set(null);
    metricsServiceMock.logMeal.calls.reset();
    rewardsServiceMock.awardCarrots.calls.reset();
  });

  it('parses nutrition numeric inputs safely', async () => {
    const fixture = await createComponent();
    const component = fixture.componentInstance;

    component.onCaloriesChange('420');
    component.onProteinChange('31.3');
    component.onCarbsChange('bad-input');
    component.onFatChange(0);

    expect(component.calories()).toBe(420);
    expect(component.protein()).toBe(31.3);
    expect(component.carbs()).toBeNull();
    expect(component.fat()).toBeNull();
  });

  it('seeds selected catalog meal when meal type is chosen', async () => {
    mealCatalog.set([
      {
        id: 'meal-1',
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
        tags: ['breakfast'],
        isActive: true,
      },
    ]);

    const fixture = await createComponent();
    const component = fixture.componentInstance;

    component.selectMealType('BREAKFAST');

    expect(component.selectedMealSearch()).toEqual(['Oatmeal with Berries']);
    expect(component.mealName()).toBe('Oatmeal with Berries');
    expect(component.calories()).toBe(320);
  });

  it('keeps form values when submit fails', async () => {
    mealCatalog.set([
      {
        id: 'meal-2',
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
        tags: ['lunch'],
        isActive: true,
      },
    ]);

    metricsServiceMock.logMeal.and.resolveTo({ success: false });

    const fixture = await createComponent();
    const component = fixture.componentInstance;

    component.selectMealType('LUNCH');
    component.onMealSearchChange(['Chicken Rice Bowl']);
    component.onCaloriesChange(540);

    await component.submitForm();

    expect(metricsServiceMock.logMeal).toHaveBeenCalled();
    expect(component.mealName()).toBe('Chicken Rice Bowl');
    expect(component.calories()).toBe(540);
    expect(component.logging()).toBeFalse();
  });
});
