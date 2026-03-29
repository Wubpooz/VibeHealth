import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import { FirstAidService } from './first-aid.service';
import { FirstAidCategory, SeverityLevel } from './first-aid.types';
import { FIRST_AID_CATEGORIES } from './first-aid.data';
import { fadeInOut, slideInUp, scaleIn } from '../../shared/animations';

@Component({
  selector: 'app-first-aid',
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule, BackButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInOut, slideInUp, scaleIn],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-rose-50 via-white to-sage-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">

      <!-- Header -->
      <header class="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <app-back-button [showLabel]="false" />
              <div>
                <h1 class="text-xl font-bold text-gray-900 dark:text-white font-heading">{{ 'FIRST_AID.TITLE' | translate }}</h1>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ 'FIRST_AID.SUBTITLE' | translate }}</p>
              </div>
            </div>

            <!-- Offline badge -->
            <div class="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-full">
              <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span class="text-xs font-medium text-green-700 dark:text-green-400">{{ 'FIRST_AID.AVAILABLE_OFFLINE' | translate }}</span>
            </div>
          </div>
        </div>
      </header>

      <main class="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24">

        <!-- Emergency Numbers Quick Access -->
        @if (service.userEmergencyNumber(); as emergency) {
          <div @slideInUp class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800">
            <div class="flex items-center justify-between flex-wrap gap-4">
              <div class="flex items-center gap-3">
                <span class="text-2xl">{{ emergency.flag }}</span>
                <div>
                  <p class="font-semibold text-red-900 dark:text-red-100">{{ 'FIRST_AID.EMERGENCY_NUMBERS' | translate }}</p>
                  <p class="text-sm text-red-700 dark:text-red-300">
                    {{ ('SETTINGS.COUNTRY.NAMES.' + (service.userCountryCode() || emergency.countryCode)) | translate }}
                  </p>
                </div>
              </div>
              <a
                [href]="'tel:' + emergency.numbers.general"
                class="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {{ emergency.numbers.general }}
              </a>
            </div>
          </div>
        }

        <!-- Search -->
        <div @fadeInOut class="mb-6">
          <div class="relative">
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              [placeholder]="'FIRST_AID.SEARCH_PLACEHOLDER' | translate"
              [ngModel]="searchQuery()"
              (ngModelChange)="onSearchChange($event)"
              class="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
            />
          </div>
        </div>

        <!-- Category Pills -->
        <div class="mb-8 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <div class="flex gap-2 min-w-max">
            <button
              (click)="selectCategory(null)"
              class="category-pill"
              [class.active]="!selectedCategory()"
            >
              {{ 'FIRST_AID.ALL_CATEGORIES' | translate }}
            </button>
            @for (cat of categories; track cat.id) {
              <button
                (click)="selectCategory(cat.id)"
                class="category-pill"
                [class.active]="selectedCategory() === cat.id"
              >
                <span>{{ cat.icon }}</span>
                {{ cat.labelKey | translate }}
              </button>
            }
          </div>
        </div>

        <!-- Cards Grid -->
        @if (filteredCards().length > 0) {
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (card of filteredCards(); track card.id; let i = $index) {
              <a
                @scaleIn
                [routerLink]="['/first-aid', card.id]"
                class="first-aid-card group"
                [attr.data-severity]="card.severity"
                [style.animation-delay.ms]="i * 50"
              >
                <!-- Severity Badge -->
                <div class="severity-badge" [attr.data-severity]="card.severity">
                  {{ getSeverityLabel(card.severity) | translate }}
                </div>

                <!-- Icon -->
                <div class="text-4xl mb-3">{{ card.icon }}</div>

                <!-- Title -->
                <h3 class="font-bold text-gray-900 dark:text-white text-lg mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {{ card.titleKey | translate }}
                </h3>

                <!-- Description -->
                <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {{ card.descriptionKey | translate }}
                </p>

                <!-- Arrow -->
                <div class="mt-4 flex items-center text-sm font-medium text-primary-600 dark:text-primary-400">
                  <span>{{ 'FIRST_AID.STEP' | translate }} 1 → {{ card.steps.length }}</span>
                  <svg class="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            }
          </div>
        } @else {
          <div @fadeInOut class="text-center py-16">
            <div class="text-6xl mb-4">🔍</div>
            <p class="text-gray-500 dark:text-gray-400">{{ 'FIRST_AID.NO_RESULTS' | translate }}</p>
          </div>
        }

        <!-- Helplines Section -->
        <section class="mt-12">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4 font-heading">{{ 'HELPLINES.TITLE' | translate }}</h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6">{{ 'HELPLINES.SUBTITLE' | translate }}</p>

          <div class="grid sm:grid-cols-2 gap-4">
            @for (helpline of service.userHelplines(); track helpline.id) {
              <div @slideInUp class="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm helpline-card">
                <div class="flex items-start gap-3">
                  <span class="text-2xl">{{ helpline.icon }}</span>
                  <div class="flex-1">
                    <h3 class="font-semibold text-gray-900 dark:text-white">{{ helpline.nameKey | translate }}</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">{{ helpline.descriptionKey | translate }}</p>
                    @if (helpline.phone) {
                      <a
                        [href]="helpline.phone.startsWith('Text') ? null : 'tel:' + helpline.phone"
                        class="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {{ helpline.phone }}
                      </a>
                    }
                    @if (helpline.website) {
                      <a
                        [href]="helpline.website"
                        target="_blank"
                        rel="noopener"
                        class="inline-flex items-center gap-1 ml-4 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Website
                      </a>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        </section>

        <!-- Disclaimer -->
        <div @fadeInOut class="mt-12 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
          <p class="text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
            <span class="text-lg">⚠️</span>
            {{ 'FIRST_AID.DISCLAIMER' | translate }}
          </p>
        </div>

      </main>
    </div>
  `,
  styles: [`
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    .category-pill {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.625rem 1rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
      white-space: nowrap;
      background: white;
      border: 1px solid #e5e7eb;
      color: #4b5563;
      transition: all 0.2s;
    }

    :host-context(.dark) .category-pill {
      background: #1f2937;
      border-color: #374151;
      color: #9ca3af;
    }

    .category-pill:hover {
      border-color: #f43f5e;
      color: #f43f5e;
    }

    .category-pill.active {
      background: linear-gradient(135deg, #f43f5e, #e11d48);
      border-color: transparent;
      color: white;
      box-shadow: 0 4px 12px rgba(244, 63, 94, 0.3);
    }

    .first-aid-card {
      display: block;
      padding: 1.25rem;
      background: white;
      border-radius: 1.25rem;
      border: 1px solid #e5e7eb;
      transition: all 0.2s;
      position: relative;
      overflow: hidden;
    }

    :host-context(.dark) .first-aid-card {
      background: #1f2937;
      border-color: #374151;
    }

    .first-aid-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }

    .first-aid-card[data-severity="critical"] {
      border-left: 4px solid #ef4444;
    }

    .first-aid-card[data-severity="serious"] {
      border-left: 4px solid #f97316;
    }

    .first-aid-card[data-severity="moderate"] {
      border-left: 4px solid #eab308;
    }

    .first-aid-card[data-severity="minor"] {
      border-left: 4px solid #22c55e;
    }

    .severity-badge {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      padding: 0.25rem 0.625rem;
      border-radius: 9999px;
      font-size: 0.625rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .severity-badge[data-severity="critical"] {
      background: #fef2f2;
      color: #dc2626;
    }

    .severity-badge[data-severity="serious"] {
      background: #fff7ed;
      color: #ea580c;
    }

    .severity-badge[data-severity="moderate"] {
      background: #fefce8;
      color: #ca8a04;
    }

    .severity-badge[data-severity="minor"] {
      background: #f0fdf4;
      color: #16a34a;
    }

    :host-context(.dark) .severity-badge[data-severity="critical"] {
      background: rgba(239, 68, 68, 0.2);
      color: #f87171;
    }

    :host-context(.dark) .severity-badge[data-severity="serious"] {
      background: rgba(249, 115, 22, 0.2);
      color: #fb923c;
    }

    :host-context(.dark) .severity-badge[data-severity="moderate"] {
      background: rgba(234, 179, 8, 0.2);
      color: #fbbf24;
    }

    :host-context(.dark) .severity-badge[data-severity="minor"] {
      background: rgba(34, 197, 94, 0.2);
      color: #4ade80;
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .helpline-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .helpline-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }
  `],
})
export class FirstAidComponent {
  readonly service = inject(FirstAidService);
  readonly translate = inject(TranslateService);

  readonly categories = FIRST_AID_CATEGORIES;

  readonly searchQuery = this.service.searchQuery;
  readonly selectedCategory = this.service.selectedCategory;
  readonly filteredCards = this.service.filteredCards;

  onSearchChange(query: string): void {
    this.service.setSearchQuery(query);
  }

  selectCategory(category: FirstAidCategory | null): void {
    this.service.setCategory(category);
  }

  getSeverityLabel(severity: SeverityLevel): string {
    const labels: Record<SeverityLevel, string> = {
      critical: 'FIRST_AID.CRITICAL',
      serious: 'FIRST_AID.SERIOUS',
      moderate: 'FIRST_AID.MODERATE',
      minor: 'FIRST_AID.MINOR',
    };
    return labels[severity];
  }
}
