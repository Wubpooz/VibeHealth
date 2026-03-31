import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface FirstAidCategory {
  id: string;
  key: string;
  locale: string;
  name: string;
  icon: string;
  order: number;
  isActive: boolean;
}

export interface FirstAidCard {
  id: string;
  key: string;
  locale: string;
  categoryId: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  steps: { order: number; instruction: string; warning?: string; tip?: string }[];
  warnings: string[];
  doNot: string[];
  whenToCallEmergency: string[];
  relatedCards: string[];
  isActive: boolean;
  category?: FirstAidCategory;
}

export interface EmergencyNumber {
  id: string;
  countryCode: string;
  locale: string;
  category: string;
  name: string;
  description?: string;
  number: string;
  notes?: string;
  isActive: boolean;
}

export interface Helpline {
  id: string;
  countryCode: string;
  locale: string;
  name: string;
  category: string;
  number?: string;
  email?: string;
  url?: string;
  description?: string;
  hoursOperating?: string;
  isActive: boolean;
}

export interface WikiCondition {
  id: string;
  key: string;
  locale: string;
  title: string;
  subtitle: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  tags: string[];
  isActive: boolean;
}

export interface OnboardingGoal {
  id: string;
  key: string;
  locale: string;
  label: string;
  emoji: string;
  description: string;
  isActive: boolean;
}

export interface OnboardingFitnessLevel {
  id: string;
  key: string;
  locale: string;
  label: string;
  description: string;
  order: number;
  isActive: boolean;
}

export interface OnboardingCondition {
  id: string;
  key: string;
  locale: string;
  name: string;
  category?: string;
  isActive: boolean;
}

export interface OnboardingAllergy {
  id: string;
  key: string;
  locale: string;
  name: string;
  category?: 'FOOD' | 'DRUG' | 'ENVIRONMENTAL';
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class LocalizedDataService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/localized`;

  /**
   * Get all first aid categories in the given locale
   * Defaults to user's current locale
   */
  getFirstAidCategories(lang?: string): Observable<FirstAidCategory[]> {
    const url = lang ? `${this.baseUrl}/first-aid/categories?lang=${lang}` : `${this.baseUrl}/first-aid/categories`;
    return this.http.get<{ locale: string; data: FirstAidCategory[] }>(url).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get first aid cards, optionally filtered by category
   */
  getFirstAidCards(categoryKey?: string, lang?: string): Observable<FirstAidCard[]> {
    let url = `${this.baseUrl}/first-aid/cards`;
    const params = new URLSearchParams();
    if (categoryKey) params.append('categoryKey', categoryKey);
    if (lang) params.append('lang', lang);
    if (params.toString()) url += `?${params.toString()}`;

    return this.http.get<{ locale: string; data: FirstAidCard[] }>(url).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get a single first aid card by key
   */
  getFirstAidCard(key: string, lang?: string): Observable<FirstAidCard> {
    const url = lang ? `${this.baseUrl}/first-aid/cards/${key}?lang=${lang}` : `${this.baseUrl}/first-aid/cards/${key}`;
    return this.http.get<{ locale: string; data: FirstAidCard }>(url).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get emergency numbers for a specific country
   */
  getEmergencyNumbers(countryCode: string, lang?: string): Observable<EmergencyNumber[]> {
    const url = lang 
      ? `${this.baseUrl}/emergency-numbers/${countryCode}?lang=${lang}` 
      : `${this.baseUrl}/emergency-numbers/${countryCode}`;
    return this.http.get<{ locale: string; countryCode: string; data: EmergencyNumber[] }>(url).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get helplines for a specific country, optionally filtered by category
   */
  getHelplines(countryCode: string, category?: string, lang?: string): Observable<Helpline[]> {
    let url = `${this.baseUrl}/helplines/${countryCode}`;
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (lang) params.append('lang', lang);
    if (params.toString()) url += `?${params.toString()}`;

    return this.http.get<{ locale: string; countryCode: string; data: Helpline[] }>(url).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get medical conditions from wiki, with optional search and tag filtering
   */
  getWikiConditions(search?: string, tag?: string, lang?: string): Observable<WikiCondition[]> {
    let url = `${this.baseUrl}/wiki/conditions`;
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (tag) params.append('tag', tag);
    if (lang) params.append('lang', lang);
    if (params.toString()) url += `?${params.toString()}`;

    return this.http.get<{ locale: string; data: WikiCondition[] }>(url).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get a single wiki condition by key
   */
  getWikiCondition(key: string, lang?: string): Observable<WikiCondition> {
    const url = lang ? `${this.baseUrl}/wiki/conditions/${key}?lang=${lang}` : `${this.baseUrl}/wiki/conditions/${key}`;
    return this.http.get<{ locale: string; data: WikiCondition }>(url).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get all onboarding goals
   */
  getOnboardingGoals(lang?: string): Observable<OnboardingGoal[]> {
    const url = lang ? `${this.baseUrl}/onboarding/goals?lang=${lang}` : `${this.baseUrl}/onboarding/goals`;
    return this.http.get<{ locale: string; data: OnboardingGoal[] }>(url).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get all onboarding fitness levels
   */
  getOnboardingFitnessLevels(lang?: string): Observable<OnboardingFitnessLevel[]> {
    const url = lang ? `${this.baseUrl}/onboarding/fitness-levels?lang=${lang}` : `${this.baseUrl}/onboarding/fitness-levels`;
    return this.http.get<{ locale: string; data: OnboardingFitnessLevel[] }>(url).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get all onboarding conditions
   */
  getOnboardingConditions(lang?: string): Observable<OnboardingCondition[]> {
    const url = lang ? `${this.baseUrl}/onboarding/conditions?lang=${lang}` : `${this.baseUrl}/onboarding/conditions`;
    return this.http.get<{ locale: string; data: OnboardingCondition[] }>(url).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get all onboarding allergies, optionally filtered by category
   */
  getOnboardingAllergies(category?: string, lang?: string): Observable<OnboardingAllergy[]> {
    let url = `${this.baseUrl}/onboarding/allergies`;
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (lang) params.append('lang', lang);
    if (params.toString()) url += `?${params.toString()}`;

    return this.http.get<{ locale: string; data: OnboardingAllergy[] }>(url).pipe(
      map(response => response.data)
    );
  }
}
