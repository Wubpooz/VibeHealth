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

      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div class="rounded-2xl bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
          <input
            type="search"
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
            [placeholder]="'WIKI.SEARCH_PLACEHOLDER' | translate"
            class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div class="rounded-2xl bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">{{ 'WIKI.FILTER_BY_TAGS' | translate }}</h3>
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
              class="mt-3 text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              {{ 'WIKI.CLEAR_FILTERS' | translate }}
            </button>
          }
        </div>

        <div class="lg:grid lg:grid-cols-3 gap-6">
          <aside class="space-y-2">
            @for (item of filteredConditions(); track item.id) {
              <div
                tabindex="0"
                (click)="selectCondition(item.id)"
                (keydown.enter)="selectCondition(item.id)"
                (keydown.space)="selectCondition(item.id)"
                class="cursor-pointer rounded-xl p-3 border transition-all hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                [class.border-primary-500]="getSelectedCondition()?.id === item.id"
                [class.bg-primary-50]="getSelectedCondition()?.id === item.id"
                [class.dark:bg-sky-950]="getSelectedCondition()?.id === item.id"
              >
                <h2 class="font-semibold text-base text-gray-900 dark:text-white">{{ item.title }}</h2>
                <p class="text-xs text-gray-500 dark:text-gray-300 mt-1">{{ item.subtitle }}</p>
              </div>
            }
          </aside>

          <main class="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
            @if (getSelectedCondition()) {
              <article>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ getSelectedCondition()?.title }}</h2>
                <p class="text-sm text-gray-500 dark:text-gray-300 mt-1 mb-4">{{ getSelectedCondition()?.subtitle }}</p>
                <p class="text-gray-700 dark:text-gray-200 leading-relaxed">{{ getSelectedCondition()?.summary }}</p>

                <div class="mt-5">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ 'WIKI.DETAILS_TITLE' | translate }}</h3>
                  <div class="overflow-x-auto mt-3">
                    <table class="w-full text-left border border-gray-200 dark:border-gray-700 rounded-lg">
                      <tbody>
                        <tr class="border-b border-gray-200 dark:border-gray-700">
                          <th class="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{{ 'WIKI.CLINICAL_AREA' | translate }}</th>
                          <td class="px-3 py-2 text-gray-700 dark:text-gray-200">{{ getSelectedCondition()!.details.clinicalArea }}</td>
                        </tr>
                        <tr class="border-b border-gray-200 dark:border-gray-700">
                          <th class="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{{ 'WIKI.RISK_FACTORS' | translate }}</th>
                          <td class="px-3 py-2 text-gray-700 dark:text-gray-200">{{ getSelectedCondition()!.details.riskFactors }}</td>
                        </tr>
                        <tr class="border-b border-gray-200 dark:border-gray-700">
                          <th class="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{{ 'WIKI.DIAGNOSTICS' | translate }}</th>
                          <td class="px-3 py-2 text-gray-700 dark:text-gray-200">{{ getSelectedCondition()!.details.diagnostics }}</td>
                        </tr>
                        <tr>
                          <th class="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{{ 'WIKI.TREATMENTS' | translate }}</th>
                          <td class="px-3 py-2 text-gray-700 dark:text-gray-200">{{ getSelectedCondition()!.details.treatments }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p class="mt-3 text-xs text-gray-500 dark:text-gray-400">{{ 'WIKI.VIDAL_URL' | translate }} <a class="text-primary-600 dark:text-primary-400 hover:underline" [href]="getSelectedCondition()?.vidalUrl" target="_blank" rel="noopener">{{ getSelectedCondition()?.vidalUrl }}</a></p>
                </div>

                <p class="mt-4 text-xs text-gray-500 dark:text-gray-400">{{ 'WIKI.SOURCE_LABEL' | translate }} <a class="text-primary-600 dark:text-primary-400 hover:underline" [href]="getSelectedCondition()?.sourceUrl" target="_blank" rel="noopener">{{ getSelectedCondition()?.sourceName }}</a></p>
              </article>
            } @else {
              <div class="text-center py-10 text-gray-500 dark:text-gray-400">{{ 'WIKI.NO_CONDITION_SELECTED' | translate }}</div>
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
      padding: 0.375rem 0.75rem;
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
    }

    .tag-filter-button.active {
      background: linear-gradient(135deg, #f43f5e, #e11d48);
      border-color: transparent;
      color: white;
      box-shadow: 0 4px 12px rgba(244, 63, 94, 0.3);
    }
  `],
})
export class WikiComponent {
  searchQuery = signal('');
  selectedTags = signal<string[]>([]);

  conditions = buildWikiConditions();

  selectedConditionSignal = signal<WikiCondition | null>(this.conditions[0] ?? null);

  availableTags = computed<string[]>(() => {
    const allTags = new Set<string>();
    this.conditions.forEach((condition: WikiCondition) => {
      condition.tags.forEach((tag: string) => allTags.add(tag));
    });

    return Array.from(allTags).sort((a, b) => a.localeCompare(b));
  });

  filteredConditions = computed<WikiCondition[]>(() => {
    let filtered: WikiCondition[] = this.conditions;

    const query = this.searchQuery().trim().toLowerCase();
    if (query) {
      filtered = filtered.filter((condition: WikiCondition) =>
        condition.title.toLowerCase().includes(query) ||
        condition.subtitle.toLowerCase().includes(query) ||
        condition.summary.toLowerCase().includes(query),
      );
    }

    const tags = this.selectedTags();
    if (tags.length > 0) {
      filtered = filtered.filter((condition: WikiCondition) =>
        tags.every((tag: string) => condition.tags.includes(tag)),
      );
    }

    return filtered;
  });

  selectCondition(conditionId: string): void {
    const found = this.conditions.find((condition) => condition.id === conditionId);
    if (found) {
      this.selectedConditionSignal.set(found);
    }
  }

  toggleTag(tag: string): void {
    const currentTags = this.selectedTags();
    if (currentTags.includes(tag)) {
      this.selectedTags.set(currentTags.filter((currentTag) => currentTag !== tag));
    } else {
      this.selectedTags.set([...currentTags, tag]);
    }
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags().includes(tag);
  }

  getSelectedCondition(): WikiCondition | null {
    return this.selectedConditionSignal();
  }
}
