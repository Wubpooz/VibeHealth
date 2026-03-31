/// <reference types="jasmine" />

import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import type { ActivityCatalogEntry, ActivitySummary, WeeklyActivitySummary } from '../../core/metrics/metrics.types';
import { MetricsService } from '../../core/metrics/metrics.service';
import { ProfileService } from '../../core/profile/profile.service';
import { RewardsService } from '../../core/rewards/rewards.service';
import { ActivityLoggerComponent } from './activity-logger.component';

describe('ActivityLoggerComponent', () => {
  const activityCatalog = signal<ActivityCatalogEntry[]>([]);
  const activityToday = signal<ActivitySummary | null>(null);
  const activityWeek = signal<WeeklyActivitySummary | null>(null);

  const metricsServiceMock = {
    activityCatalog,
    activityToday,
    activityWeek,
    activityMinutesToday: signal(0),
    activityCaloriesToday: signal(0),
    loadActivityToday: jasmine.createSpy('loadActivityToday').and.resolveTo(undefined),
    loadActivityCatalog: jasmine.createSpy('loadActivityCatalog').and.resolveTo(undefined),
    logActivity: jasmine.createSpy('logActivity').and.resolveTo({ success: true, carrots: 1 }),
  };

  const profileServiceMock = {
    profile: signal<{ preferredActivityKey?: string } | null>(null),
    loadProfile: jasmine.createSpy('loadProfile').and.resolveTo(undefined),
    updatePreferredWorkout: jasmine.createSpy('updatePreferredWorkout').and.resolveTo(true),
  };

  const rewardsServiceMock = {
    awardCarrots: jasmine.createSpy('awardCarrots'),
  };

  async function createComponent() {
    await TestBed.configureTestingModule({
      imports: [ActivityLoggerComponent, TranslateModule.forRoot()],
      providers: [
        { provide: MetricsService, useValue: metricsServiceMock },
        { provide: ProfileService, useValue: profileServiceMock },
        { provide: RewardsService, useValue: rewardsServiceMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ActivityLoggerComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    activityCatalog.set([]);
    activityToday.set(null);
    activityWeek.set(null);
    profileServiceMock.profile.set(null);
    metricsServiceMock.logActivity.calls.reset();
    profileServiceMock.updatePreferredWorkout.calls.reset();
    rewardsServiceMock.awardCarrots.calls.reset();
  });

  it('exposes more quick activity options', async () => {
    const fixture = await createComponent();
    const component = fixture.componentInstance;

    const quickTypes = component.quickActivities.map((activity) => activity.type);

    expect(component.quickActivities.length).toBe(6);
    expect(quickTypes).toEqual(['WALK', 'RUN', 'CYCLE', 'SWIM', 'STRENGTH', 'HIIT']);
  });

  it('selects best catalog activity when type changes', async () => {
    activityCatalog.set([
      {
        id: 'run-1',
        key: 'RUN_JOGGING',
        name: 'Jogging',
        category: 'RUN',
        metValue: 7,
        emoji: '🏃',
        description: null,
        tags: ['cardio'],
        isActive: true,
      },
      {
        id: 'run-2',
        key: 'RUN_8MPH',
        name: 'Running (8 mph / 13 km/h)',
        category: 'RUN',
        metValue: 11.8,
        emoji: '🏃‍♂️',
        description: null,
        tags: ['cardio'],
        isActive: true,
      },
    ]);

    const fixture = await createComponent();
    const component = fixture.componentInstance;

    component.onActivityTypeChange('RUN');

    expect(component.selectedType()).toBe('RUN');
    expect(component.selectedActivitySearch()).toEqual(['Running (8 mph / 13 km/h)']);
    expect(component.activityName()).toBe('Running (8 mph / 13 km/h)');
  });

  it('keeps activity form values when submit fails', async () => {
    activityCatalog.set([
      {
        id: 'walk-1',
        key: 'WALK_MODERATE',
        name: 'Moderate Walk',
        category: 'WALK',
        metValue: 3.5,
        emoji: '🚶',
        description: null,
        tags: ['cardio'],
        isActive: true,
      },
    ]);
    metricsServiceMock.logActivity.and.resolveTo({ success: false });

    const fixture = await createComponent();
    const component = fixture.componentInstance;

    component.showForm.set(true);
    component.onActivityTypeChange('WALK');
    component.activityName.set('Morning Walk');
    component.setDuration(35);

    await component.submitForm();

    expect(metricsServiceMock.logActivity).toHaveBeenCalled();
    expect(component.showForm()).toBeTrue();
    expect(component.activityName()).toBe('Morning Walk');
    expect(component.duration()).toBe(35);
    expect(component.logging()).toBeFalse();
  });
});
