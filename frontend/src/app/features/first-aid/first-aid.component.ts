import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export type EmergencyCategory = 'cardiac' | 'choking' | 'burns' | 'bleeding' | 'fracture' | 'shock' | 'allergic' | 'seizure';
export type Severity = 'critical' | 'urgent' | 'moderate';

export interface EmergencyGuide {
  id: string;
  category: EmergencyCategory;
  severity: Severity;
  titleKey: string;
  whenKey: string;
  stepKeys: string[];
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  keywords: string[];
}

const GUIDES: EmergencyGuide[] = [
  {
    id: 'cpr',
    category: 'cardiac',
    severity: 'critical',
    titleKey: 'FIRST_AID.CPR_TITLE',
    whenKey: 'FIRST_AID.CPR_WHEN',
    stepKeys: ['FIRST_AID.CPR_STEP1','FIRST_AID.CPR_STEP2','FIRST_AID.CPR_STEP3','FIRST_AID.CPR_STEP4','FIRST_AID.CPR_STEP5'],
    icon: '❤️',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    keywords: ['heart', 'cardiac', 'cpr', 'arrest', 'chest', 'unconscious', 'coeur', 'arrêt'],
  },
  {
    id: 'choking',
    category: 'choking',
    severity: 'critical',
    titleKey: 'FIRST_AID.CHOKING_TITLE',
    whenKey: 'FIRST_AID.CHOKING_WHEN',
    stepKeys: ['FIRST_AID.CHOKING_STEP1','FIRST_AID.CHOKING_STEP2','FIRST_AID.CHOKING_STEP3','FIRST_AID.CHOKING_STEP4','FIRST_AID.CHOKING_STEP5'],
    icon: '🫁',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    keywords: ['choke', 'choking', 'airway', 'heimlich', 'étouffement', 'déglutition'],
  },
  {
    id: 'burns',
    category: 'burns',
    severity: 'urgent',
    titleKey: 'FIRST_AID.BURNS_TITLE',
    whenKey: 'FIRST_AID.BURNS_WHEN',
    stepKeys: ['FIRST_AID.BURNS_STEP1','FIRST_AID.BURNS_STEP2','FIRST_AID.BURNS_STEP3','FIRST_AID.BURNS_STEP4','FIRST_AID.BURNS_STEP5'],
    icon: '🔥',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    keywords: ['burn', 'fire', 'heat', 'blister', 'brûlure', 'feu', 'chaleur'],
  },
  {
    id: 'bleeding',
    category: 'bleeding',
    severity: 'critical',
    titleKey: 'FIRST_AID.BLEEDING_TITLE',
    whenKey: 'FIRST_AID.BLEEDING_WHEN',
    stepKeys: ['FIRST_AID.BLEEDING_STEP1','FIRST_AID.BLEEDING_STEP2','FIRST_AID.BLEEDING_STEP3','FIRST_AID.BLEEDING_STEP4','FIRST_AID.BLEEDING_STEP5'],
    icon: '🩸',
    color: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-rose-50 dark:bg-rose-900/20',
    borderColor: 'border-rose-200 dark:border-rose-800',
    keywords: ['bleed', 'blood', 'wound', 'cut', 'saignement', 'sang', 'blessure'],
  },
  {
    id: 'fracture',
    category: 'fracture',
    severity: 'urgent',
    titleKey: 'FIRST_AID.FRACTURE_TITLE',
    whenKey: 'FIRST_AID.FRACTURE_WHEN',
    stepKeys: ['FIRST_AID.FRACTURE_STEP1','FIRST_AID.FRACTURE_STEP2','FIRST_AID.FRACTURE_STEP3','FIRST_AID.FRACTURE_STEP4','FIRST_AID.FRACTURE_STEP5'],
    icon: '🦴',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    keywords: ['fracture', 'break', 'bone', 'fracas', 'os cassé', 'fracture'],
  },
  {
    id: 'shock',
    category: 'shock',
    severity: 'critical',
    titleKey: 'FIRST_AID.SHOCK_TITLE',
    whenKey: 'FIRST_AID.SHOCK_WHEN',
    stepKeys: ['FIRST_AID.SHOCK_STEP1','FIRST_AID.SHOCK_STEP2','FIRST_AID.SHOCK_STEP3','FIRST_AID.SHOCK_STEP4','FIRST_AID.SHOCK_STEP5'],
    icon: '⚡',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    keywords: ['shock', 'pale', 'faint', 'dizzy', 'choc', 'pâle', 'évanouissement'],
  },
  {
    id: 'allergic',
    category: 'allergic',
    severity: 'critical',
    titleKey: 'FIRST_AID.ALLERGIC_TITLE',
    whenKey: 'FIRST_AID.ALLERGIC_WHEN',
    stepKeys: ['FIRST_AID.ALLERGIC_STEP1','FIRST_AID.ALLERGIC_STEP2','FIRST_AID.ALLERGIC_STEP3','FIRST_AID.ALLERGIC_STEP4','FIRST_AID.ALLERGIC_STEP5'],
    icon: '🌿',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    keywords: ['allergy', 'anaphylaxis', 'epipen', 'hive', 'allergie', 'anaphylaxie', 'urticaire'],
  },
  {
    id: 'seizure',
    category: 'seizure',
    severity: 'urgent',
    titleKey: 'FIRST_AID.SEIZURE_TITLE',
    whenKey: 'FIRST_AID.SEIZURE_WHEN',
    stepKeys: ['FIRST_AID.SEIZURE_STEP1','FIRST_AID.SEIZURE_STEP2','FIRST_AID.SEIZURE_STEP3','FIRST_AID.SEIZURE_STEP4','FIRST_AID.SEIZURE_STEP5'],
    icon: '🧠',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    keywords: ['seizure', 'convulsion', 'epilepsy', 'convulsions', 'épilepsie', 'crise'],
  },
];

@Component({
  selector: 'app-first-aid',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 pb-20">

      <!-- Header -->
      <header class="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 border-b border-red-100 dark:border-red-900/30 shadow-sm backdrop-blur-md">
        <div class="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <a routerLink="/dashboard" class="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </a>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="text-2xl">🩹</span>
              <h1 class="text-xl font-bold text-gray-900 dark:text-white font-heading">{{ 'FIRST_AID.TITLE' | translate }}</h1>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 19a10.94 10.94 0 0 1-1.72-1.5m3.56-7.33A10.94 10.94 0 0 1 12 9c.79 0 1.56.1 2.3.28M2.42 9a15.91 15.91 0 0 1 19.15 0M12 17h.01"/></svg>
                {{ 'FIRST_AID.OFFLINE_READY' | translate }}
              </span>
            </p>
          </div>
          <!-- Emergency Call Button -->
          <a
            href="tel:112"
            class="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-500/25 hover:bg-red-600 active:scale-95 transition-all animate-pulse-slow"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
            112
          </a>
        </div>

        <!-- Search Bar -->
        <div class="max-w-2xl mx-auto px-4 pb-3">
          <div class="relative">
            <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              [(ngModel)]="searchQuery"
              type="search"
              [placeholder]="'FIRST_AID.SEARCH' | translate"
              class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-colors"
            />
          </div>
        </div>

        <!-- Severity Filter Pills -->
        <div class="max-w-2xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          @for (filter of severityFilters; track filter.value) {
            <button
              (click)="activeSeverity.set(filter.value)"
              [class]="'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ' + (activeSeverity() === filter.value ? filter.activeClass : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400')"
            >
              {{ filter.prefix }} {{ filter.labelKey | translate }}
            </button>
          }
        </div>
      </header>

      <!-- Emergency Banner -->
      <div class="max-w-2xl mx-auto px-4 pt-4">
        <div class="bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl p-4 text-white mb-4 shadow-lg shadow-red-500/25">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">🚨</div>
            <div>
              <p class="font-bold text-sm">{{ 'FIRST_AID.CALL_EMERGENCY' | translate }}</p>
              <p class="text-red-100 text-xs">{{ 'FIRST_AID.EMERGENCY_NUMBER' | translate }}</p>
            </div>
            <a href="tel:112" class="ml-auto px-4 py-2 bg-white text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 transition-colors">
              {{ 'FIRST_AID.CALL' | translate }}
            </a>
          </div>
        </div>
      </div>

      <!-- Guide Cards -->
      <main class="max-w-2xl mx-auto px-4 space-y-3 pb-8">
        @if (filteredGuides().length === 0) {
          <div class="text-center py-16">
            <p class="text-5xl mb-4">🔍</p>
            <p class="text-gray-500 dark:text-gray-400 font-medium">{{ 'FIRST_AID.NO_RESULTS' | translate }}</p>
            <p class="text-gray-400 dark:text-gray-500 text-sm mt-1">{{ 'FIRST_AID.TRY_DIFFERENT' | translate }}</p>
          </div>
        }

        @for (guide of filteredGuides(); track guide.id) {
          <div
            class="rounded-2xl border overflow-hidden transition-all duration-200 {{ guide.borderColor }}"
            [ngClass]="guide.borderColor"
          >
            <!-- Card Header (always visible, clickable) -->
            <button
              (click)="toggleExpand(guide.id)"
              class="w-full flex items-center gap-4 p-4 text-left transition-colors hover:opacity-90"
              [ngClass]="guide.bgColor"
            >
              <!-- Severity indicator -->
              <div class="flex-shrink-0 relative">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-white/60 dark:bg-black/20 shadow-sm">
                  {{ guide.icon }}
                </div>
                @if (guide.severity === 'critical') {
                  <div class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-ping-slow"></div>
                }
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-bold text-gray-900 dark:text-white text-sm font-heading" [ngClass]="guide.color">
                    {{ guide.titleKey | translate }}
                  </h3>
                  <span
                    class="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-bold"
                    [ngClass]="getSeverityBadgeClass(guide.severity)"
                  >{{ getSeverityLabel(guide.severity) }}</span>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {{ guide.whenKey | translate }}
                </p>
              </div>

              <svg
                class="flex-shrink-0 w-5 h-5 text-gray-400 transition-transform duration-200"
                [class.rotate-180]="expandedId() === guide.id"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            <!-- Expanded Steps -->
            @if (expandedId() === guide.id) {
              <div class="bg-white dark:bg-gray-900 px-4 py-4 border-t" [ngClass]="guide.borderColor">
                <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  {{ 'FIRST_AID.STEPS' | translate }}
                </p>
                <ol class="space-y-3">
                  @for (stepKey of guide.stepKeys; track stepKey; let i = $index) {
                    <li class="flex items-start gap-3">
                      <div
                        class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                        [ngClass]="getStepNumberClass(guide.severity)"
                      >
                        {{ i + 1 }}
                      </div>
                      <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {{ stepKey | translate }}
                      </p>
                    </li>
                  }
                </ol>

                @if (guide.severity === 'critical') {
                  <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <a
                      href="tel:112"
                      class="w-full flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 active:scale-95 transition-all shadow-lg shadow-red-500/20"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                      </svg>
                      {{ 'FIRST_AID.CALL_EMERGENCY' | translate }} — {{ 'FIRST_AID.EMERGENCY_NUMBER' | translate }}
                    </a>
                  </div>
                }
              </div>
            }
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .animate-ping-slow {
      animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% { transform: scale(2); opacity: 0; }
    }

    .rotate-180 { transform: rotate(180deg); }
  `],
})
export class FirstAidComponent {
  private readonly translate = inject(TranslateService);

  readonly searchQuery = signal('');
  readonly expandedId = signal<string | null>(null);
  readonly activeSeverity = signal<string>('all');

  readonly severityFilters = [
    { value: 'all', labelKey: 'FIRST_AID.ALL', prefix: '🩹', activeClass: 'bg-gray-800 text-white dark:bg-white dark:text-gray-900' },
    { value: 'critical', labelKey: 'FIRST_AID.SEVERITY_CRITICAL', prefix: '🚨', activeClass: 'bg-red-500 text-white' },
    { value: 'urgent', labelKey: 'FIRST_AID.SEVERITY_URGENT', prefix: '⚠️', activeClass: 'bg-amber-500 text-white' },
    { value: 'moderate', labelKey: 'FIRST_AID.SEVERITY_MODERATE', prefix: '💙', activeClass: 'bg-blue-500 text-white' },
  ];

  readonly filteredGuides = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const sev = this.activeSeverity();

    return GUIDES.filter(guide => {
      const severityMatch = sev === 'all' || guide.severity === sev;
      if (!q) return severityMatch;
      const keywordMatch = guide.keywords.some(k => k.includes(q));
      return severityMatch && keywordMatch;
    });
  });

  toggleExpand(id: string) {
    this.expandedId.update(current => current === id ? null : id);
  }

  getSeverityBadgeClass(severity: Severity): string {
    const classes: Record<Severity, string> = {
      critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      urgent: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      moderate: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    };
    return classes[severity];
  }

  getSeverityLabel(severity: Severity): string {
    const keys: Record<Severity, string> = {
      critical: 'FIRST_AID.SEVERITY_CRITICAL',
      urgent: 'FIRST_AID.SEVERITY_URGENT',
      moderate: 'FIRST_AID.SEVERITY_MODERATE',
    };
    const prefixes: Record<Severity, string> = { critical: '🚨', urgent: '⚠️', moderate: '💙' };
    return `${prefixes[severity]} ${this.translate.instant(keys[severity])}`;
  }

  getStepNumberClass(severity: Severity): string {
    const classes: Record<Severity, string> = {
      critical: 'bg-red-500',
      urgent: 'bg-amber-500',
      moderate: 'bg-blue-500',
    };
    return classes[severity];
  }
}
