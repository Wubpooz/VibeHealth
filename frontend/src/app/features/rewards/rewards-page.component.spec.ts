import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { RewardsPageComponent } from './rewards-page.component';

describe('RewardsPageComponent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  async function createComponent() {
    await TestBed.configureTestingModule({
      imports: [RewardsPageComponent, TranslateModule.forRoot()],
    }).compileComponents();

    const fixture = TestBed.createComponent(RewardsPageComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('should create', async () => {
    const fixture = await createComponent();
    const component = fixture.componentInstance;

    expect(component).toBeTruthy();
  });

  it('should start with all achievements locked when there is no reward progress', async () => {
    const fixture = await createComponent();
    const component = fixture.componentInstance;

    expect(component.unlockedAchievementsCount()).toBe(0);

    const lockedCards = fixture.nativeElement.querySelectorAll('.achievement-card.locked');
    expect(lockedCards.length).toBe(component.achievements().length);
  });

  it('should unlock achievements from stored carrots and streak data', async () => {
    localStorage.setItem('vibehealth_carrots', '130');
    localStorage.setItem('vibehealth_streak', '8');
    localStorage.setItem('vibehealth_longest_streak', '35');

    const fixture = await createComponent();
    const component = fixture.componentInstance;

    expect(component.unlockedAchievementsCount()).toBeGreaterThan(3);

    const unlockedCards = fixture.nativeElement.querySelectorAll('.achievement-card.unlocked');
    expect(unlockedCards.length).toBe(component.unlockedAchievementsCount());
  });
});
