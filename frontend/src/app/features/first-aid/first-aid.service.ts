import { Injectable, signal, computed } from '@angular/core';
import { FirstAidCard, FirstAidCategory, EmergencyNumber, Helpline, FirstAidSearchResult } from './first-aid.types';
import { FIRST_AID_CARDS, EMERGENCY_NUMBERS, HELPLINES, FIRST_AID_CATEGORIES } from './first-aid.data';

const CACHE_KEY = 'vibehealth_first_aid_cache';
const USER_COUNTRY_KEY = 'vibehealth_user_country';

@Injectable({ providedIn: 'root' })
export class FirstAidService {
  private readonly _cards = signal<FirstAidCard[]>(FIRST_AID_CARDS);
  private readonly _emergencyNumbers = signal<EmergencyNumber[]>(EMERGENCY_NUMBERS);
  private readonly _helplines = signal<Helpline[]>(HELPLINES);
  private readonly _categories = signal(FIRST_AID_CATEGORIES);
  private readonly _selectedCategory = signal<FirstAidCategory | null>(null);
  private readonly _searchQuery = signal('');
  private readonly _userCountryCode = signal<string | null>(null);
  private readonly _loading = signal(false);

  // Public readonly signals
  readonly cards = this._cards.asReadonly();
  readonly emergencyNumbers = this._emergencyNumbers.asReadonly();
  readonly helplines = this._helplines.asReadonly();
  readonly categories = this._categories.asReadonly();
  readonly selectedCategory = this._selectedCategory.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();
  readonly userCountryCode = this._userCountryCode.asReadonly();
  readonly loading = this._loading.asReadonly();

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
    return this._emergencyNumbers().find(n => n.countryCode === code) || null;
  });

  // Helplines available in user's country
  readonly userHelplines = computed(() => {
    const code = this._userCountryCode();
    if (!code) return this._helplines().filter(h => h.countries.length === 0); // International only
    return this._helplines().filter(h => h.countries.length === 0 || h.countries.includes(code));
  });

  constructor() {
    this.loadCachedData();
    this.detectUserCountry();
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
    this._userCountryCode.set(code);
    try {
      localStorage.setItem(USER_COUNTRY_KEY, code);
    } catch {
      // Ignore storage errors
    }
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
    // Data is already hardcoded, but we preserve this for future API support
    this.cacheForOffline();
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
      if (this._emergencyNumbers().some(n => n.countryCode === detected)) {
        this._userCountryCode.set(detected);
      }
    }
  }
}
