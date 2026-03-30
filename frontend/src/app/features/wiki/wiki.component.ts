import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { WikiCondition } from './wiki.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

const CONDITION_TITLES: string[] = [
  'Hypertension', 'Type 2 Diabetes', 'Asthma', 'Chronic Kidney Disease', 'COPD',
  'Depression', 'Anxiety Disorders', 'Anemia', 'Osteoarthritis', 'Rheumatoid Arthritis',
  'Migraine', 'Hypothyroidism', 'Hyperthyroidism', 'Sleep Apnea', 'GERD',
  'Eczema', 'Psoriasis', 'Stroke', 'Heart Failure', 'Alzheimer Disease',
  'Atrial Fibrillation', 'Coronary Artery Disease', 'Peripheral Artery Disease', 'Deep Vein Thrombosis', 'Pulmonary Embolism',
  'Hyperlipidemia', 'Metabolic Syndrome', 'Obesity', 'Nonalcoholic Fatty Liver Disease', 'Acute Myocardial Infarction',
  'Varicose Veins', 'Parkinson Disease', 'Epilepsy', 'Multiple Sclerosis', 'Systemic Lupus Erythematosus',
  'Sjogren Syndrome', 'Psoriatic Arthritis', 'Ulcerative Colitis', 'Crohn Disease', 'Irritable Bowel Syndrome',
  'Celiac Disease', 'Chronic Pancreatitis', 'Gallstones', 'Peptic Ulcer Disease', 'Hepatitis B',
  'Hepatitis C', 'Cirrhosis', 'Gout', 'Osteoporosis', 'Sarcopenia',
  'Fibromyalgia', 'Chronic Fatigue Syndrome', 'Lupus Nephritis', 'Polycystic Ovary Syndrome', 'Endometriosis',
  'Uterine Fibroids', 'HPV Infection', 'Pelvic Inflammatory Disease', 'Benign Prostatic Hyperplasia', 'Prostate Cancer',
  'Breast Cancer', 'Lung Cancer', 'Colorectal Cancer', 'Pancreatic Cancer', 'Melanoma',
  'Non-Hodgkin Lymphoma', 'Hodgkin Lymphoma', 'Leukemia', 'Bone Metastasis', 'Sepsis',
  'Meningitis', 'Encephalitis', 'Guillain-Barre Syndrome', 'Amyotrophic Lateral Sclerosis', 'Huntington Disease',
  'Autism Spectrum Disorder', 'Attention Deficit Hyperactivity Disorder', 'Schizophrenia', 'Bipolar Disorder', 'Obsessive Compulsive Disorder',
  'Posttraumatic Stress Disorder', 'Panic Disorder', 'Social Anxiety Disorder', 'Dyslipidemia', 'Hypokalemia',
  'Hyperkalemia', 'Hyponatremia', 'Hypernatremia', 'Hypercalcemia', 'Hypocalcemia',
  'Addison Disease', 'Cushing Syndrome', 'Diabetes Insipidus', 'Gestational Diabetes', 'Polymyalgia Rheumatica',
  'Giant Cell Arteritis', 'Takayasu Arteritis', 'Systemic Sclerosis', 'Dermatomyositis', 'Polymyositis',
  'Myasthenia Gravis', 'Carpal Tunnel Syndrome', 'Restless Leg Syndrome', 'Peripheral Neuropathy', 'Tinnitus',
  'Vertigo', 'Erectile Dysfunction', 'Chronic Pelvic Pain', 'Interstitial Cystitis', 'Kidney Stones',
  'Urinary Tract Infection', 'Pyelonephritis', 'Acute Renal Failure', 'Nephrotic Syndrome', 'Nephritic Syndrome',
  'Polycystic Kidney Disease', 'Renal Cell Carcinoma', 'Testicular Cancer', 'Ovarian Cancer', 'Cervical Cancer',
  'Endometrial Cancer', 'Cholecystitis', 'Appendicitis', 'Diverticulitis', 'Hemorrhoids',
  'Anal Fissure', 'Cystic Fibrosis', 'Scurvy', 'Rickets', 'Beriberi',
  'Pellagra', 'Night Blindness', 'Macular Degeneration', 'Glaucoma', 'Cataracts',
  'Conjunctivitis', 'Otitis Media', 'Sinusitis', 'Pharyngitis', 'Tonsillitis',
  'Laryngitis', 'Influenza', 'COVID-19', 'Viral Pneumonia', 'Bacterial Pneumonia',
  'Tuberculosis', 'HIV/AIDS', 'Herpes Simplex', 'Varicella Zoster', 'Epstein-Barr Virus',
  'Cytomegalovirus', 'Dengue Fever', 'Malaria', 'Lyme Disease', 'Rocky Mountain Spotted Fever',
  'Zika Virus', 'Yellow Fever', 'Chikungunya', 'Syphilis', 'Gonorrhea',
  'Chlamydia', 'Genital Herpes', 'Toxic Shock Syndrome', 'Vitamin D Deficiency', 'Hyperparathyroidism',
  'Hypoparathyroidism', 'Bipolar II Disorder', 'Cyclothymic Disorder', 'Agoraphobia', 'Preeclampsia',
  'Eclampsia', 'Placenta Previa', 'Placental Abruption', 'Gestational Hypertension', 'Hyperemesis Gravidarum',
  'Premature Labor', 'Reactive Arthritis', 'Ankylosing Spondylitis', 'Juvenile Idiopathic Arthritis', 'Trigeminal Neuralgia',
  'Cluster Headache', 'Tension Headache', 'Temporomandibular Disorder', 'Primary Biliary Cholangitis', 'Autoimmune Hepatitis',
  'Acute Lymphoblastic Leukemia', 'Chronic Lymphocytic Leukemia', 'Multiple Myeloma', 'Myelodysplastic Syndrome', 'Hemophilia',
  'Sickle Cell Disease', 'Thalassemia', 'Aplastic Anemia', 'Pulmonary Hypertension', 'Bronchiectasis',
  'Interstitial Lung Disease', 'Amyloidosis', 'Polyarteritis Nodosa', 'Henoch-Schonlein Purpura', 'Superior Vena Cava Syndrome',
  'Aortic Aneurysm', 'Transient Ischemic Attack', 'Dementia with Lewy Bodies', 'Normal Pressure Hydrocephalus', 'Carcinoid Syndrome',
  'Pheochromocytoma', 'Pituitary Adenoma', 'Macrophage Activation Syndrome', 'Bisphosphonate-related Osteonecrosis', 'Hemophagocytic Lymphohistiocytosis',
  'Ehlers-Danlos Syndrome', 'Marfan Syndrome', 'Neuromyelitis Optica', 'Adenosine Deaminase Deficiency', 'Epidermolysis Bullosa',
  'Sleep Wake Circadian Disorder', 'Metastatic Melanoma', 'Chronic Eosinophilic Leukemia', 'Severe Atopic Dermatitis',
];

function buildWikiConditions(): WikiCondition[] {
  return CONDITION_TITLES.map((title) => {
    const slug = title.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/(^-|-$)/g, '');
    const lower = title.toLowerCase();
    const tags: string[] = [];

    if (/heart|cardio|hypertension|stroke|cholesterol|myocardial|arrhythmia|aortic/.test(lower)) tags.push('cardiovascular');
    if (/diabetes|thyroid|adrenal|cortisol|hormone|obesity|metabolic|parathyroid|pituitary/.test(lower)) tags.push('endocrine');
    if (/asthma|copd|pneumonia|tuberculosis|sleep|pulmonary|lung|bronchiectasis|interstitial/.test(lower)) tags.push('respiratory');
    if (/cancer|lymphoma|leukemia|myeloma|melanoma|metastatic|oncology/.test(lower)) tags.push('oncology');
    if (/arthritis|rheumatoid|scleroderma|vasculitis|fibromyalgia|polymyalgia/.test(lower)) tags.push('rheumatological');
    if (/kidney|renal|nephro|pyelonephritis|nephrotic|nephritic/.test(lower)) tags.push('nephrology');
    if (/depression|anxiety|schizophrenia|bipolar|ptsd|agoraphobia|obsessive|psychosis/.test(lower)) tags.push('mental-health');
    if (/hepatitis|liver|cirrhosis|gallstones|pancreatitis|colitis|diverticulitis|appendicitis/.test(lower)) tags.push('gastrointestinal');
    if (/infection|viral|bacterial|tuberculosis|hiv|aids|syphilis|gonorrhea|chlamydia|dengue|malaria|zika|yellow|chikungunya|covid/.test(lower)) tags.push('infectious');
    if (/eczema|psoriasis|dermatitis|atopic|melanoma|bullosa/.test(lower)) tags.push('dermatological');
    if (/vision|macular|glaucoma|cataracts|conjunctivitis|otitis|sinusitis/.test(lower)) tags.push('otolaryngology');
    if (/pregnancy|preeclampsia|eclampsia|gestational|placenta|labor/.test(lower)) tags.push('obstetric');
    if (/sepsis|shock|syndrome|acute|chronic|pain|anemia|fracture|metastatic|sickle/.test(lower)) tags.push('general');
    if (tags.length === 0) tags.push('general');

    const clinicalArea = tags.join(', ');
    const riskFactors = /cardiovascular|endocrine|nephrology/.test(tags.join(' '))
      ? 'Age, family history, diet, inactivity, smoking, obesity, hypertension'
      : 'Genetics, environment, immune status, infection, lifestyle';

    return {
      id: slug,
      title,
      subtitle: title,
      summary: `${title} is a condition that often requires specialized diagnosis, evidence-based management, and regular patient follow-up.`,
      sourceUrl: 'https://www.vidal.fr/maladies/a-z.html',
      sourceName: 'Vidal',
      vidalUrl: `https://www.vidal.fr/maladies/a-z.html#${slug}`,
      details: {
        clinicalArea,
        riskFactors,
        diagnostics: 'Clinical exam, lab tests, imaging, specialist consultation when appropriate',
        treatments: 'Lifestyle measures, pharmacologic therapy as indicated, monitoring, and specialist referral when needed',
      },
      tags,
    };
  });
}

@Component({
  selector: 'app-wiki',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <app-page-header
        [title]="'WIKI.TITLE' | translate"
        [subtitle]="'WIKI.SUBTITLE' | translate"
        [showBackLabel]="false"
      >
        <span pageHeaderIcon class="text-2xl">📚</span>
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
            <span class="absolute right-3 top-3 text-gray-400 text-sm">🔍</span>
            
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
  searchQuery = signal('');
  selectedTags = signal<string[]>([]);
  currentLetter = signal<string | null>(null);

  conditions = buildWikiConditions();
  selectedConditionSignal = signal<WikiCondition | null>(this.conditions[0] ?? null);

  alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  availableTags = computed<string[]>(() => {
    const allTags = new Set<string>();
    this.conditions.forEach((condition: WikiCondition) => {
      condition.tags.forEach((tag: string) => allTags.add(tag));
    });

    return Array.from(allTags).sort((a, b) => a.localeCompare(b));
  });

  filteredConditions = computed<WikiCondition[]>(() => {
    let filtered: WikiCondition[] = this.conditions;

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
    const found = this.conditions.find((condition) => condition.id === conditionId);
    if (found) {
      this.selectedConditionSignal.set(found);
    }
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
