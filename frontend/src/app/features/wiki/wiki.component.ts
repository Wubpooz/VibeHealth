import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { catchError, of } from 'rxjs';
import { LocalizedDataService, WikiCondition as LocalizedWikiCondition } from '../../core/localized-data/localized-data.service';
import { WikiCondition } from './wiki.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LucideBookOpen, LucideSearch } from '@lucide/angular';

@Component({
  selector: 'app-wiki',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PageHeaderComponent, LucideBookOpen, LucideSearch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <app-page-header
        [title]="'WIKI.TITLE' | translate"
        [subtitle]="'WIKI.SUBTITLE' | translate"
        [showBackLabel]="false"
      >
        <span pageHeaderIcon class="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 text-sky-500 flex items-center justify-center" aria-hidden="true">
          <svg lucideBookOpen [size]="20" [strokeWidth]="2"></svg>
        </span>
      </app-page-header>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <!-- Search Bar with Suggestions -->
        <div class="rounded-2xl bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
          <div class="relative">
            <input
              type="search"
              #searchInput
              [ngModel]="searchQuery()"
              (ngModelChange)="onSearchChange($event)"
              (keydown)="onSearchKeydown($event)"
              [placeholder]="'WIKI.SEARCH_PLACEHOLDER' | translate"
              class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              autocomplete="off"
            />
            <span class="absolute right-3 top-3 text-gray-400 text-sm">
              <svg lucideSearch [size]="16" [strokeWidth]="2"></svg>
            </span>
            
            <!-- Search Suggestions Dropdown -->
            @if (searchQuery().length > 0 && searchSuggestions().length > 0) {
              <div class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-50 max-h-64 overflow-y-auto">
                @for (suggestion of searchSuggestions(); track suggestion.id; let isFirst = $first) {
                  <button
                    type="button"
                    (click)="selectFromSuggestion(suggestion)"
                    class="w-full text-left px-4 py-3 hover:bg-primary-50 dark:hover:bg-sky-900 transition-colors flex items-center gap-3 border-t border-gray-100 dark:border-gray-700 first:border-t-0"
                  >
                    <span class="text-sm text-primary-600 dark:text-primary-400 font-semibold">{{ suggestion.tags[0] || 'General' }}</span>
                    <span class="flex-1">{{ suggestion.title }}</span>
                  </button>
                }
              </div>
            }
          </div>
        </div>

        <!-- Filter Tabs & Alphabet Index -->
        <div class="flex flex-col lg:flex-row gap-4 mb-6">
          <!-- Category Filter -->
          <div class="flex-1 rounded-2xl bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 class="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">{{ 'WIKI.FILTER_BY_TAGS' | translate }}</h3>
            <div class="flex flex-wrap gap-2">
              @for (tag of availableTags(); track tag) {
                <button
                  (click)="toggleTag(tag)"
                  [class.active]="isTagSelected(tag)"
                  class="tag-filter-button"
                >
                  {{ tag }}
                </button>
              }
            </div>
            @if (selectedTags().length > 0) {
              <button
                (click)="selectedTags.set([])"
                class="mt-3 text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
              >
                ✕ {{ 'WIKI.CLEAR_FILTERS' | translate }}
              </button>
            }
          </div>

          <!-- Alphabet Index (Sticky) -->
          <div class="rounded-2xl bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 shadow-sm h-fit lg:sticky lg:top-20">
            <h3 class="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">A-Z</h3>
            <div class="grid grid-cols-7 gap-1">
              @for (letter of alphabet; track letter) {
                <button
                  (click)="jumpToLetter(letter)"
                  [class.active]="currentLetter() === letter"
                  class="py-1 px-0.5 text-xs font-semibold rounded text-gray-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-sky-950 transition-colors"
                  [class.bg-primary-500]="currentLetter() === letter"
                  [class.text-white]="currentLetter() === letter"
                >
                  {{ letter }}
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="lg:grid lg:grid-cols-12 gap-6">
          <!-- Conditions List (Sidebar) -->
          <aside class="lg:col-span-4 space-y-2 max-h-[600px] overflow-y-auto rounded-2xl bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            @if (filteredConditions().length === 0) {
              <div class="text-center py-6 text-gray-500 dark:text-gray-400">
                <p class="text-sm">{{ 'WIKI.NO_RESULTS' | translate }}</p>
              </div>
            } @else {
              @for (item of filteredConditions(); track item.id) {
                <button
                  (click)="selectCondition(item.id)"
                  class="w-full text-left rounded-xl p-3 border transition-all hover:shadow-md hover:border-primary-300 dark:hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                  [class.border-primary-500]="getSelectedCondition()?.id === item.id"
                  [class.bg-primary-50]="getSelectedCondition()?.id === item.id"
                  [class.dark:bg-sky-950]="getSelectedCondition()?.id === item.id"
                  [class.border-gray-300]="getSelectedCondition()?.id !== item.id"
                  [class.dark:border-gray-600]="getSelectedCondition()?.id !== item.id"
                  [class.bg-gray-50]="getSelectedCondition()?.id !== item.id"
                  [class.dark:bg-gray-700]="getSelectedCondition()?.id !== item.id"
                >
                  <h2 class="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">{{ item.title }}</h2>
                  <div class="flex gap-1 mt-1 flex-wrap">
                    @for (tag of item.tags.slice(0, 2); track tag) {
                      <span class="text-xs px-2 py-0.5 rounded-full bg-primary-100 dark:bg-sky-900 text-primary-700 dark:text-primary-300">
                        {{ tag }}
                      </span>
                    }
                    @if (item.tags.length > 2) {
                      <span class="text-xs px-2 py-0.5 text-gray-500 dark:text-gray-400">+{{ item.tags.length - 2 }}</span>
                    }
                  </div>
                </button>
              }
            }
          </aside>

          <!-- Detail Panel -->
          <main class="lg:col-span-8 rounded-2xl bg-white dark:bg-gray-900 p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            @if (getSelectedCondition()) {
              <article class="space-y-6">
                <!-- Header -->
                <div class="space-y-2">
                  <div class="flex items-start gap-3">
                    <span class="text-3xl">🏥</span>
                    <div class="flex-1">
                      <h2 class="text-3xl font-bold text-gray-900 dark:text-white">{{ getSelectedCondition()?.title }}</h2>
                      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ getSelectedCondition()?.subtitle }}</p>
                    </div>
                  </div>
                </div>

                <!-- Summary -->
                <p class="text-gray-700 dark:text-gray-200 leading-relaxed">{{ getSelectedCondition()?.summary }}</p>

                <!-- Details Table -->
                <div class="space-y-3">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>📋</span> {{ 'WIKI.DETAILS_TITLE' | translate }}
                  </h3>
                  <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                    <table class="w-full text-left text-sm">
                      <tbody>
                        <tr class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                          <td class="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 w-32">{{ 'WIKI.CLINICAL_AREA' | translate }}</td>
                          <td class="px-4 py-3 text-gray-700 dark:text-gray-200">{{ getSelectedCondition()!.details.clinicalArea }}</td>
                        </tr>
                        <tr class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                          <td class="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 w-32">{{ 'WIKI.RISK_FACTORS' | translate }}</td>
                          <td class="px-4 py-3 text-gray-700 dark:text-gray-200">{{ getSelectedCondition()!.details.riskFactors }}</td>
                        </tr>
                        <tr class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                          <td class="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 w-32">{{ 'WIKI.DIAGNOSTICS' | translate }}</td>
                          <td class="px-4 py-3 text-gray-700 dark:text-gray-200">{{ getSelectedCondition()!.details.diagnostics }}</td>
                        </tr>
                        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                          <td class="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 w-32">{{ 'WIKI.TREATMENTS' | translate }}</td>
                          <td class="px-4 py-3 text-gray-700 dark:text-gray-200">{{ getSelectedCondition()!.details.treatments }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Links Section -->
                <div class="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>🔗</span> {{ 'WIKI.RESOURCES' | translate }}
                  </h3>
                  <div class="flex flex-col sm:flex-row gap-3">
                    <a 
                      [href]="getSelectedCondition()?.vidalUrl" 
                      target="_blank" 
                      rel="noopener"
                      class="flex-1 px-4 py-3 rounded-lg bg-primary-50 dark:bg-sky-950 border border-primary-300 dark:border-sky-700 text-primary-700 dark:text-primary-300 font-medium hover:bg-primary-100 dark:hover:bg-sky-900 transition text-center text-sm"
                    >
                      📖 {{ 'WIKI.VIEW_ON_VIDAL' | translate }}
                    </a>
                    <a 
                      [href]="getSelectedCondition()?.sourceUrl" 
                      target="_blank" 
                      rel="noopener"
                      class="flex-1 px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition text-center text-sm"
                    >
                      🌐 {{ 'WIKI.SOURCE_LABEL' | translate }}
                    </a>
                  </div>
                </div>
              </article>
            } @else {
              <div class="flex flex-col items-center justify-center h-80 text-gray-500 dark:text-gray-400">
                <span class="text-5xl mb-4">📚</span>
                <p class="text-lg font-medium">{{ 'WIKI.WELCOME_TITLE' | translate }}</p>
                <p class="text-sm mt-2">{{ 'WIKI.WELCOME_DESC' | translate }}</p>
              </div>
            }
          </main>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tag-filter-button {
      display: inline-flex;
      align-items: center;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
      border: 1px solid #d1d5db;
      background: white;
      color: #374151;
      transition: all 0.2s;
      cursor: pointer;
    }

    :host-context(.dark) .tag-filter-button {
      background: #1f2937;
      border-color: #374151;
      color: #9ca3af;
    }

    .tag-filter-button:hover {
      border-color: #f43f5e;
      color: #f43f5e;
      background: #fef2f4;
    }

    :host-context(.dark) .tag-filter-button:hover {
      background: #8b5cf6;
      border-color: #a78bfa;
      color: white;
    }

    .tag-filter-button.active {
      background: linear-gradient(135deg, #f43f5e, #e11d48);
      border-color: transparent;
      color: white;
      box-shadow: 0 4px 12px rgba(244, 63, 94, 0.3);
    }

    /* Scrollbar styling */
    aside {
      scrollbar-width: thin;
      scrollbar-color: #d1d5db #f3f4f6;
    }

    :host-context(.dark) aside {
      scrollbar-color: #4b5563 #1f2937;
    }

    aside::-webkit-scrollbar {
      width: 6px;
    }

    aside::-webkit-scrollbar-track {
      background: #f3f4f6;
      border-radius: 10px;
    }

    :host-context(.dark) aside::-webkit-scrollbar-track {
      background: #1f2937;
    }

    aside::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 10px;
    }

    :host-context(.dark) aside::-webkit-scrollbar-thumb {
      background: #4b5563;
    }

    aside::-webkit-scrollbar-thumb:hover {
      background: #9ca3af;
    }

    :host-context(.dark) aside::-webkit-scrollbar-thumb:hover {
      background: #6b7280;
    }
  `],
})
export class WikiComponent {
  private readonly localizedDataService = inject(LocalizedDataService);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  searchQuery = signal('');
  selectedTags = signal<string[]>([]);
  currentLetter = signal<string | null>(null);

  readonly conditions = signal<WikiCondition[]>([]);
  readonly selectedConditionSignal = signal<WikiCondition | null>(null);

  alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  availableTags = computed<string[]>(() => {
    const allTags = new Set<string>();
    this.conditions().forEach((condition: WikiCondition) => {
      condition.tags.forEach((tag: string) => allTags.add(tag));
    });

    return Array.from(allTags).sort((a, b) => a.localeCompare(b));
  });

  filteredConditions = computed<WikiCondition[]>(() => {
    let filtered: WikiCondition[] = this.conditions();

    // Filter by search query
    const query = this.searchQuery().trim().toLowerCase();
    if (query) {
      filtered = filtered.filter((condition: WikiCondition) =>
        condition.title.toLowerCase().includes(query) ||
        condition.subtitle.toLowerCase().includes(query) ||
        condition.summary.toLowerCase().includes(query),
      );
    }

    // Filter by selected tags
    const tags = this.selectedTags();
    if (tags.length > 0) {
      filtered = filtered.filter((condition: WikiCondition) =>
        tags.every((tag: string) => condition.tags.includes(tag)),
      );
    }

    // Filter by letter if alphabet jumped
    const letter = this.currentLetter();
    if (letter && !query) {
      filtered = filtered.filter((condition: WikiCondition) =>
        condition.title.charAt(0).toUpperCase() === letter,
      );
    }

    return filtered.sort((a, b) => a.title.localeCompare(b.title));
  });

  searchSuggestions = computed<WikiCondition[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query || query.length < 2) return [];

    return this.filteredConditions()
      .filter((condition) => condition.title.toLowerCase().startsWith(query))
      .slice(0, 8);
  });

  selectCondition(conditionId: string): void {
    const found = this.conditions().find((condition) => condition.id === conditionId);
    if (found) {
      this.selectedConditionSignal.set(found);
    }
  }

  constructor() {
    this.loadLocalizedConditions();

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadLocalizedConditions();
      });
  }

  private loadLocalizedConditions(): void {
    const locale = this.getCurrentLocale();

    this.localizedDataService
      .getWikiConditions(undefined, undefined, locale)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error) => {
          console.warn('Failed to fetch localized wiki conditions.', error);
          return of([] as LocalizedWikiCondition[]);
        }),
      )
      .subscribe((apiConditions) => {
        const localized = apiConditions.map((condition) => this.mapLocalizedCondition(condition, locale));
        this.conditions.set(localized);
        this.ensureSelectedConditionExists();
      });
  }

  private ensureSelectedConditionExists(): void {
    const selected = this.selectedConditionSignal();
    const all = this.conditions();

    if (!selected || !all.some((condition) => condition.id === selected.id)) {
      this.selectedConditionSignal.set(all[0] ?? null);
    }
  }

  private getCurrentLocale(): 'en' | 'fr' {
    const current = this.translate.getCurrentLang() || this.translate.getFallbackLang() || 'en';
    return current.toLowerCase().startsWith('fr') ? 'fr' : 'en';
  }

  private mapLocalizedCondition(condition: LocalizedWikiCondition, locale: 'en' | 'fr'): WikiCondition {
    const tags = Array.isArray(condition.tags) ? condition.tags : [];
    let clinicalArea = tags.join(', ');
    if (!clinicalArea) {
      clinicalArea = locale === 'fr' ? 'général' : 'general';
    }
    const riskFactors = this.buildRiskFactorSummary(tags, locale);

    return {
      id: condition.key,
      title: condition.title,
      subtitle: condition.subtitle,
      summary: condition.summary,
      sourceUrl: condition.sourceUrl,
      sourceName: condition.sourceName,
      vidalUrl: condition.sourceUrl,
      details: {
        clinicalArea,
        riskFactors,
        diagnostics:
          locale === 'fr'
            ? 'Examen clinique, analyses biologiques, imagerie et avis spécialisé si nécessaire'
            : 'Clinical exam, lab tests, imaging, and specialist review when needed',
        treatments:
          locale === 'fr'
            ? 'Mesures de mode de vie, traitements ciblés et suivi régulier selon le profil'
            : 'Lifestyle measures, targeted treatment plans, and regular follow-up',
      },
      tags,
    };
  }

  private buildRiskFactorSummary(tags: string[], locale: 'en' | 'fr'): string {
    const joinedTags = tags.join(' ');
    const hasMetabolicProfile = /cardiovascular|endocrine|nephrology/.test(joinedTags);

    if (locale === 'fr') {
      return hasMetabolicProfile
        ? 'Âge, antécédents familiaux, alimentation, sédentarité, tabac, obésité, hypertension'
        : 'Génétique, environnement, immunité, infections et habitudes de vie';
    }

    return hasMetabolicProfile
      ? 'Age, family history, diet, inactivity, smoking, obesity, hypertension'
      : 'Genetics, environment, immune status, infection, lifestyle';
  }

  selectFromSuggestion(suggestion: WikiCondition): void {
    this.searchQuery.set('');
    this.selectCondition(suggestion.id);
  }

  toggleTag(tag: string): void {
    const currentTags = this.selectedTags();
    if (currentTags.includes(tag)) {
      this.selectedTags.set(currentTags.filter((currentTag) => currentTag !== tag));
    } else {
      this.selectedTags.set([...currentTags, tag]);
    }
    this.currentLetter.set(null);
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags().includes(tag);
  }

  jumpToLetter(letter: string): void {
    if (this.currentLetter() === letter) {
      this.currentLetter.set(null);
    } else {
      this.currentLetter.set(letter);
      this.searchQuery.set('');
    }
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.currentLetter.set(null);
    
    // Auto-select first suggestion if available
    const suggestions = this.searchSuggestions();
    if (suggestions.length > 0 && value.length >= 2) {
      // Keep dropdown visible but don't auto-select (let user choose)
    }
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.searchQuery.set('');
    } else if (event.key === 'Enter') {
      const suggestions = this.searchSuggestions();
      if (suggestions.length > 0) {
        this.selectFromSuggestion(suggestions[0]);
        event.preventDefault();
      }
    }
  }

  getSelectedCondition(): WikiCondition | null {
    return this.selectedConditionSignal();
  }
}
