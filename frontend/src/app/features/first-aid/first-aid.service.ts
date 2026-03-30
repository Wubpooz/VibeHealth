import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { catchError, of } from 'rxjs';
import {
  LocalizedDataService,
  FirstAidCard as LocalizedFirstAidCard,
  FirstAidCategory as LocalizedFirstAidCategory,
  EmergencyNumber as LocalizedEmergencyNumber,
  Helpline as LocalizedHelpline,
} from '../../core/localized-data/localized-data.service';
import { FirstAidCard, FirstAidCategory, FirstAidCategoryMetadata, EmergencyNumber, Helpline, FirstAidSearchResult } from './first-aid.types';

const CACHE_KEY = 'vibehealth_first_aid_cache';
const USER_COUNTRY_KEY = 'vibehealth_user_country';

@Injectable({ providedIn: 'root' })
export class FirstAidService {
  private readonly localizedDataService = inject(LocalizedDataService);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _categories = signal<FirstAidCategoryMetadata[]>([]);
  private readonly _cards = signal<FirstAidCard[]>([]);
  private readonly _emergencyNumbers = signal<EmergencyNumber[]>([]);
  private readonly _helplines = signal<Helpline[]>([]);
  private readonly _selectedCategory = signal<FirstAidCategory | null>(null);
  private readonly _searchQuery = signal('');
  private readonly _userCountryCode = signal<string | null>(null);
  private readonly _loading = signal(false);

  // Public readonly signals
  readonly cards = this._cards.asReadonly();
  readonly emergencyNumbers = this._emergencyNumbers.asReadonly();
  readonly helplines = this._helplines.asReadonly();
  readonly selectedCategory = this._selectedCategory.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();
  readonly userCountryCode = this._userCountryCode.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly categories = this._categories.asReadonly();

  // Filtered cards based on category
  readonly filteredCards = computed(() => {
    const category = this._selectedCategory();
    const query = this._searchQuery().toLowerCase().trim();
    let cards = this._cards();

    if (category) {
      cards = cards.filter(c => c.category === category);
    }

    if (query) {
      cards = cards.filter(c =>
        c.titleKey.toLowerCase().includes(query) ||
        c.descriptionKey.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query)
      );
    }

    return cards;
  });

  // Critical cards (CPR, choking, anaphylaxis, severe bleeding, heart attack, stroke)
  readonly criticalCards = computed(() =>
    this._cards().filter(c => c.severity === 'critical')
  );

  // User's country emergency number
  readonly userEmergencyNumber = computed(() => {
    const code = this._userCountryCode();
    if (!code) return null;
    return this._emergencyNumbers().find((n) => n.countryCode === code) ?? this._emergencyNumbers()[0] ?? null;
  });

  // Helplines available in user's country
  readonly userHelplines = computed(() => {
    return this._helplines();
  });

  constructor() {
    this.loadLocalizedCategories();
    this.loadCachedData();
    this.detectUserCountry();
    this.loadLocalizedCards();
    this.loadLocalizedEmergencyResources();

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadLocalizedCards();
        this.loadLocalizedEmergencyResources();
      });
  }

  /**
   * Search first aid cards with relevance scoring
   */
  searchCards(query: string): FirstAidSearchResult[] {
    if (!query.trim()) return [];

    const terms = query.toLowerCase().split(/\s+/);
    const results: FirstAidSearchResult[] = [];

    for (const card of this._cards()) {
      const searchableText = [
        card.id,
        card.category,
        card.titleKey,
        card.descriptionKey,
        ...card.steps.map(s => s.instruction),
      ].join(' ').toLowerCase();

      const matchedTerms = terms.filter(term => searchableText.includes(term));
      if (matchedTerms.length > 0) {
        results.push({
          card,
          matchScore: matchedTerms.length / terms.length,
          matchedTerms,
        });
      }
    }

    return results.sort((a, b) => {
      // Critical cards first, then by match score
      if (a.card.severity === 'critical' && b.card.severity !== 'critical') return -1;
      if (b.card.severity === 'critical' && a.card.severity !== 'critical') return 1;
      return b.matchScore - a.matchScore;
    });
  }

  /**
   * Get a card by ID
   */
  getCard(id: string): FirstAidCard | null {
    return this._cards().find(c => c.id === id) || null;
  }

  /**
   * Get cards by category
   */
  getCardsByCategory(category: FirstAidCategory): FirstAidCard[] {
    return this._cards().filter(c => c.category === category);
  }

  /**
   * Get related cards for a given card
   */
  getRelatedCards(cardId: string): FirstAidCard[] {
    const card = this.getCard(cardId);
    if (!card?.relatedCards) return [];
    return card.relatedCards
      .map(id => this.getCard(id))
      .filter((c): c is FirstAidCard => c !== null);
  }

  /**
   * Set selected category filter
   */
  setCategory(category: FirstAidCategory | null): void {
    this._selectedCategory.set(category);
  }

  /**
   * Set search query
   */
  setSearchQuery(query: string): void {
    this._searchQuery.set(query);
  }

  /**
   * Set user country for emergency numbers
   */
  setUserCountry(code: string): void {
    const normalized = code?.trim().toUpperCase();
    if (!normalized) {
      return;
    }

    this._userCountryCode.set(normalized);
    try {
      localStorage.setItem(USER_COUNTRY_KEY, normalized);
    } catch {
      // Ignore storage errors
    }

    this.loadLocalizedEmergencyResources();
  }

  /**
   * Get emergency number for a specific country
   */
  getEmergencyNumber(countryCode: string): EmergencyNumber | null {
    return this._emergencyNumbers().find(n => n.countryCode === countryCode) || null;
  }

  /**
   * Cache data for offline access
   */
  cacheForOffline(): void {
    try {
      const cacheData = {
        cards: this._cards(),
        emergencyNumbers: this._emergencyNumbers(),
        helplines: this._helplines(),
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (e) {
      console.warn('Failed to cache first aid data:', e);
    }
  }

  /**
   * Load cached data if available
   */
  private loadCachedData(): void {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as {
        cards?: FirstAidCard[];
        emergencyNumbers?: EmergencyNumber[];
        helplines?: Helpline[];
      };

      this._cards.set(Array.isArray(parsed.cards) ? parsed.cards : []);
      this._emergencyNumbers.set(Array.isArray(parsed.emergencyNumbers) ? parsed.emergencyNumbers : []);
      this._helplines.set(Array.isArray(parsed.helplines) ? parsed.helplines : []);
    } catch {
      // Ignore invalid cache payloads
    }
  }
  

  private loadLocalizedCategories(): void {
    const locale = this.getCurrentLocale();
    this._loading.set(true);

    this.localizedDataService.getFirstAidCategories(locale)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error) => {
          console.warn('Failed to fetch localized first aid categories.', error);
          return of([] as LocalizedFirstAidCategory[]);
        }),
      )
      .subscribe((apiCategories) => {
        const mapped = apiCategories
          .map((category) => {
            const id = this.mapLocalizedCategory(category, category.key);
            const normalizedKey = category.key.toString().toUpperCase().replaceAll('-', '_');
            return {
              id,
              key: category.key,
              label: category.name,
              labelKey: `FIRST_AID.CATEGORY.${normalizedKey}`,
              icon: category.icon,
              color: this.mapCategoryColor(id),
            } as FirstAidCategoryMetadata;
          });

        this._categories.set(mapped);
        this._loading.set(false);
      });
  }

  private mapCategoryColor(category: FirstAidCategory): string {
    const colorMap: Record<FirstAidCategory, string> = {
      cpr: '#ef4444',
      choking: '#f97316',
      burns: '#eab308',
      'allergic-reactions': '#84cc16',
      fractures: '#06b6d4',
      bleeding: '#dc2626',
      'heart-attack': '#be123c',
      stroke: '#7c3aed',
      shock: '#6366f1',
      seizures: '#f59e0b',
      poisoning: '#65a30d',
      hypothermia: '#0ea5e9',
      'heat-stroke': '#f43f5e',
      'bites-stings': '#fbbf24',
      drowning: '#3b82f6',
    };

    return colorMap[category] ?? '#9ca3af';
  }

  /**
   * Load localized cards from backend.
   */
  private loadLocalizedCards(): void {
    const locale = this.getCurrentLocale();
    this._loading.set(true);

    this.localizedDataService
      .getFirstAidCards(undefined, locale)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error) => {
          console.warn('Failed to fetch localized first aid cards.', error);
          return of([] as LocalizedFirstAidCard[]);
        }),
      )
      .subscribe((apiCards) => {
        const localizedCards = apiCards.map((card) => this.mapLocalizedCard(card));
        this._cards.set(localizedCards);
        this._loading.set(false);
        this.cacheForOffline();
      });
  }

  private loadLocalizedEmergencyResources(): void {
    const countryCode = this._userCountryCode()?.trim().toUpperCase() || 'US';
    const locale = this.getCurrentLocale();

    this.localizedDataService
      .getEmergencyNumbers(countryCode, locale)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error) => {
          console.warn('Failed to fetch localized emergency numbers.', error);
          return of([] as LocalizedEmergencyNumber[]);
        }),
      )
      .subscribe((numbers) => {
        this._emergencyNumbers.set(this.mapLocalizedEmergencyNumbers(countryCode, numbers));
        this.cacheForOffline();
      });

    this.localizedDataService
      .getHelplines(countryCode, undefined, locale)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error) => {
          console.warn('Failed to fetch localized helplines.', error);
          return of([] as LocalizedHelpline[]);
        }),
      )
      .subscribe((helplines) => {
        this._helplines.set(helplines.map((helpline) => this.mapLocalizedHelpline(helpline)));
        this.cacheForOffline();
      });
  }

  private getCurrentLocale(): 'en' | 'fr' {
    const current =
      this.translate.getCurrentLang() ||
      this.translate.getFallbackLang() ||
      'en';

    return current.toLowerCase().startsWith('fr') ? 'fr' : 'en';
  }


  translateFallback(key: string): string {
    if (!key) {
      return '';
    }

    const translated = this.translate.instant(key);
    if (translated && translated !== key) {
      return translated;
    }

    return this.humanizeFirstAidKey(key);
  }

  private humanizeFirstAidKey(rawKey: string): string {
    if (!rawKey) {
      return '';
    }

    // expected patterns: FIRST_AID.XYZ.TITLE, FIRST_AID.XYZ.STEP_1, FIRST_AID.XYZ.WARN_1 etc
    const stepMatch = RegExp(/STEP_(\d+)/).exec(rawKey);
    if (stepMatch) {
      return `Step ${stepMatch[1]}`;
    }

    const token = rawKey
      .replace(/^FIRST_AID\./, '')
      .replace(/\.(TITLE|DESC|STEP_\d+|WARN_\d+|DONOT_\d+|CALL_\d+)$/, '')
      .replaceAll('_', ' ')
      .replaceAll(/\b(\w)/g, (m) => m.toUpperCase());

    if (token === 'Cpr Adult') return 'CPR (Adult)';
    if (token === 'Cpr Child') return 'CPR (Child)';

    return token;
  }

  private mapLocalizedCard(card: LocalizedFirstAidCard): FirstAidCard {
    const category = this.mapLocalizedCategory(card.category, card.key);

    const mappedSteps = (card.steps ?? []).map((step) => ({
      ...step,
      order: step.order,
      instruction: this.translateFallback(step.instruction),
      warning: step.warning ? this.translateFallback(step.warning) : undefined,
      tip: step.tip ? this.translateFallback(step.tip) : undefined,
    }));

    return {
      id: card.key,
      category,
      titleKey: card.titleKey,
      descriptionKey: card.descriptionKey,
      title: this.translateFallback(card.titleKey),
      description: this.translateFallback(card.descriptionKey),
      icon: card.icon,
      severity: card.severity,
      steps: mappedSteps,
      warnings: (card.warnings ?? []).map((w) => this.translateFallback(w)),
      whenToCallEmergency: (card.whenToCallEmergency ?? []).map((w) => this.translateFallback(w)),
      doNot: (card.doNot ?? []).map((w) => this.translateFallback(w)),
      relatedCards: card.relatedCards ?? [],
    };
  }

  private mapLocalizedEmergencyNumbers(countryCode: string, numbers: LocalizedEmergencyNumber[]): EmergencyNumber[] {
    if (numbers.length === 0) {
      return [];
    }

    const byCategory = new Map(numbers.map((entry) => [entry.category.toUpperCase(), entry.number]));
    const general = byCategory.get('GENERAL') || byCategory.get('AMBULANCE') || numbers[0]?.number;

    if (!general) {
      return [];
    }

    return [
      {
        country: countryCode,
        countryCode,
        flag: this.countryCodeToFlag(countryCode),
        numbers: {
          general,
          police: byCategory.get('POLICE'),
          fire: byCategory.get('FIRE'),
          ambulance: byCategory.get('AMBULANCE'),
          poisonControl: byCategory.get('POISON'),
        },
      },
    ];
  }

  private mapLocalizedHelpline(helpline: LocalizedHelpline): Helpline {
    const normalizedCategory = (helpline.category || '').toUpperCase();

    const categoryMap: Record<string, Helpline['category']> = {
      SUICIDE: 'suicide-prevention',
      MENTAL_HEALTH: 'mental-health',
      ABUSE: 'abuse',
      DOMESTIC_VIOLENCE: 'abuse',
      ADDICTION: 'addiction',
      GENERAL: 'general',
    };

    const iconMap: Record<Helpline['category'], string> = {
      'suicide-prevention': '💙',
      'mental-health': '💬',
      abuse: '🛡️',
      addiction: '🤝',
      general: '🌍',
    };

    const category = categoryMap[normalizedCategory] ?? 'general';

    return {
      id: helpline.id,
      nameKey: helpline.name,
      descriptionKey: helpline.description || '',
      phone: helpline.number || '',
      website: helpline.url,
      available: helpline.hoursOperating || '',
      countries: [helpline.countryCode],
      category,
      icon: iconMap[category],
    };
  }

  private countryCodeToFlag(countryCode: string): string {
    if (!/^[A-Z]{2}$/.test(countryCode)) {
      return '🌍';
    }

    return String.fromCodePoint(
      ...countryCode.split('').map((char) => 127397 + (char.codePointAt(0) ?? 0)),
    );
  }

  private mapLocalizedCategory(category: LocalizedFirstAidCategory | undefined, cardKey: string): FirstAidCategory {
    const categoryKey = category?.key?.toUpperCase() ?? '';

    if (categoryKey === 'CPR') {
      return cardKey.startsWith('choking') ? 'choking' : 'cpr';
    }

    if (categoryKey === 'HEART_ATTACK') {
      return cardKey.includes('stroke') ? 'stroke' : 'heart-attack';
    }

    const categoryMap: Record<string, FirstAidCategory> = {
      BURNS: 'burns',
      BLEEDING: 'bleeding',
      ALLERGIC_REACTIONS: 'allergic-reactions',
      FRACTURES: 'fractures',
      SHOCK: 'shock',
      SEIZURES: 'seizures',
      POISONING: 'poisoning',
      HYPOTHERMIA: 'hypothermia',
      HEAT_STROKE: 'heat-stroke',
      BITES_STINGS: 'bites-stings',
      DROWNING: 'drowning',
    };

    return categoryMap[categoryKey] ?? this.guessCategoryFromCardKey(cardKey);
  }

  private guessCategoryFromCardKey(cardKey: string): FirstAidCategory {
    const key = cardKey.toLowerCase();

    if (key.includes('choking')) return 'choking';
    if (key.includes('cpr') || key.includes('aed')) return 'cpr';
    if (key.includes('burn') || key.includes('sunburn') || key.includes('eye-')) return 'burns';
    if (key.includes('bleed') || key.includes('cut') || key.includes('wound') || key.includes('amputat')) return 'bleeding';
    if (key.includes('allerg') || key.includes('anaphyl')) return 'allergic-reactions';
    if (key.includes('fracture') || key.includes('sprain') || key.includes('dislocation') || key.includes('bone') || key.includes('tooth')) return 'fractures';
    if (key.includes('heart') || key.includes('angina') || key.includes('chest-pain')) return 'heart-attack';
    if (key.includes('stroke')) return 'stroke';
    if (key.includes('shock') || key.includes('faint') || key.includes('hypogly') || key.includes('hypergly')) return 'shock';
    if (key.includes('seizure')) return 'seizures';
    if (key.includes('poison') || key.includes('overdose') || key.includes('monoxide') || key.includes('cleaner')) return 'poisoning';
    if (key.includes('hypothermia') || key.includes('frostbite') || key.includes('cold-')) return 'hypothermia';
    if (key.includes('heat') || key.includes('dehydration')) return 'heat-stroke';
    if (key.includes('bite') || key.includes('sting') || key.includes('tick') || key.includes('dog-') || key.includes('cat-') || key.includes('splinter') || key.includes('spider') || key.includes('scorpion') || key.includes('jellyfish') || key.includes('stingray')) return 'bites-stings';
    if (key.includes('drown')) return 'drowning';

    return 'cpr';
  }

  /**
   * Detect user's country from browser/system
   */
  private detectUserCountry(): void {
    // First check saved preference
    try {
      const saved = localStorage.getItem(USER_COUNTRY_KEY);
      if (saved) {
        this._userCountryCode.set(saved);
        return;
      }
    } catch {
      // Ignore storage errors
    }

    // Try to detect from browser locale
    const locale = navigator.language || (navigator as unknown as { userLanguage?: string }).userLanguage;
    if (locale) {
      const parts = locale.split('-');
      const countryCode = parts.length > 1 ? parts[1].toUpperCase() : parts[0].toUpperCase();

      // Map common locales to country codes
      const localeToCountry: Record<string, string> = {
        'EN': 'US',
        'FR': 'FR',
        'DE': 'DE',
        'ES': 'ES',
        'IT': 'IT',
        'PT': 'BR',
        'JA': 'JP',
        'ZH': 'CN',
      };

      const detected = localeToCountry[countryCode] || countryCode;
      this._userCountryCode.set(detected);
    }
  }
}
