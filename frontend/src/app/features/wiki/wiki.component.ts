import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

interface WikiCondition {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  tags: string[];
}

@Component({
  selector: 'app-wiki',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <header class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ 'WIKI.TITLE' | translate }}</h1>
          <p class="text-gray-600 dark:text-gray-300 mt-1">{{ 'WIKI.SUBTITLE' | translate }}</p>
        </header>

        <div class="rounded-2xl bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
          <input
            type="search"
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
            [placeholder]="'WIKI.SEARCH_PLACEHOLDER' | translate"
            class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <!-- Tag Filters -->
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

  conditions: WikiCondition[] = [
    {
      id: 'hypertension',
      title: 'Hypertension',
      subtitle: 'High blood pressure',
      summary:
        'Hypertension is a chronic condition where arterial blood pressure is elevated; it increases risk for stroke, heart attack, and kidney disease.',
      sourceUrl: 'https://medlineplus.gov/highbloodpressure.html',
      sourceName: 'MedlinePlus',
      tags: ['cardiovascular', 'chronic'],
    },
    {
      id: 'type-2-diabetes',
      title: 'Type 2 Diabetes',
      subtitle: 'Insulin resistance and high blood sugar',
      summary:
        'Type 2 Diabetes is a long-term metabolic disorder caused by insulin resistance and relative insulin deficiency; it requires lifestyle and medication management.',
      sourceUrl: 'https://medlineplus.gov/type2diabetes.html',
      sourceName: 'MedlinePlus',
      tags: ['endocrine', 'metabolic', 'chronic'],
    },
    {
      id: 'asthma',
      title: 'Asthma',
      subtitle: 'Inflammatory airway disease',
      summary:
        'Asthma causes airway inflammation and bronchoconstriction producing wheeze, cough, shortness of breath and variable expiratory flow obstruction.',
      sourceUrl: 'https://medlineplus.gov/asthma.html',
      sourceName: 'MedlinePlus',
      tags: ['respiratory', 'chronic', 'inflammatory'],
    },
    {
      id: 'chronic-kidney-disease',
      title: 'Chronic Kidney Disease',
      subtitle: 'Progressive loss of kidney function',
      summary:
        'Chronic kidney disease is long-term kidney damage leading to reduced glomerular filtration and risk of electrolyte imbalance and cardiovascular complications.',
      sourceUrl: 'https://medlineplus.gov/chronickidneydisease.html',
      sourceName: 'MedlinePlus',
      tags: ['renal', 'chronic', 'metabolic'],
    },
    {
      id: 'copd',
      title: 'COPD',
      subtitle: 'Chronic obstructive pulmonary disease',
      summary:
        'COPD combines emphysema and chronic bronchitis; it is typically caused by smoking and leads to progressive airflow limitation and breathlessness.',
      sourceUrl: 'https://medlineplus.gov/copd.html',
      sourceName: 'MedlinePlus',
      tags: ['respiratory', 'chronic', 'smoking-related'],
    },
    {
      id: 'depression',
      title: 'Depression',
      subtitle: 'Mood disorder',
      summary:
        'Major depressive disorder is characterized by persistent low mood, loss of interest, and functional impairment, often requiring psychotherapy and medication.',
      sourceUrl: 'https://medlineplus.gov/depression.html',
      sourceName: 'MedlinePlus',
      tags: ['mental health', 'mood disorder'],
    },
    {
      id: 'anxiety-disorders',
      title: 'Anxiety Disorders',
      subtitle: 'Excessive worry and fear',
      summary:
        'Anxiety disorders involve chronic worry, panic, or phobia symptoms that exceed normal stress responses and impair daily life.',
      sourceUrl: 'https://medlineplus.gov/anxiety.html',
      sourceName: 'MedlinePlus',
      tags: ['mental health', 'anxiety'],
    },
    {
      id: 'anemia',
      title: 'Anemia',
      subtitle: 'Low red blood cell count',
      summary:
        'Anemia is a deficiency in hemoglobin or red cells, often causing fatigue, pallor and weakness; causes include iron deficiency, chronic disease, and genetic conditions.',
      sourceUrl: 'https://medlineplus.gov/anemia.html',
      sourceName: 'MedlinePlus',
      tags: ['hematological', 'blood disorder'],
    },
    {
      id: 'osteoarthritis',
      title: 'Osteoarthritis',
      subtitle: 'Degenerative joint disease',
      summary:
        'Osteoarthritis results from joint cartilage wear, causing pain, stiffness and reduced mobility especially in knees, hips and hands.',
      sourceUrl: 'https://medlineplus.gov/osteoarthritis.html',
      sourceName: 'MedlinePlus',
      tags: ['musculoskeletal', 'degenerative', 'joints'],
    },
    {
      id: 'rheumatoid-arthritis',
      title: 'Rheumatoid Arthritis',
      subtitle: 'Autoimmune joint inflammation',
      summary:
        'Rheumatoid arthritis is an autoimmune condition with symmetric joint inflammation, pain and deformity; early treatment helps prevent damage.',
      sourceUrl: 'https://medlineplus.gov/rheumatoidarthritis.html',
      sourceName: 'MedlinePlus',
      tags: ['autoimmune', 'musculoskeletal', 'inflammatory', 'joints'],
    },
    {
      id: 'migraine',
      title: 'Migraine',
      subtitle: 'Neurological headache disorder',
      summary:
        'Migraine causes recurrent headaches with throbbing pain, nausea, and sensory sensitivity; attacks may last hours to days.',
      sourceUrl: 'https://medlineplus.gov/migraine.html',
      sourceName: 'MedlinePlus',
      tags: ['neurological', 'headache', 'chronic'],
    },
    {
      id: 'hypothyroidism',
      title: 'Hypothyroidism',
      subtitle: 'Low thyroid hormone production',
      summary:
        'Hypothyroidism causes slow metabolism, fatigue, weight gain, and cold intolerance; it is often treated with levothyroxine.',
      sourceUrl: 'https://medlineplus.gov/hypothyroidism.html',
      sourceName: 'MedlinePlus',
      tags: ['endocrine', 'thyroid', 'hormonal'],
    },
    {
      id: 'hyperthyroidism',
      title: 'Hyperthyroidism',
      subtitle: 'Excess thyroid hormone production',
      summary:
        'Hyperthyroidism can cause rapid heart rate, weight loss, anxiety and heat intolerance; common causes include Graves disease.',
      sourceUrl: 'https://medlineplus.gov/hyperthyroidism.html',
      sourceName: 'MedlinePlus',
      tags: ['endocrine', 'thyroid', 'hormonal'],
    },
    {
      id: 'sleep-apnea',
      title: 'Sleep Apnea',
      subtitle: 'Sleep-disordered breathing',
      summary:
        'Sleep apnea is repeated airway collapse during sleep causing interrupted breathing, daytime sleepiness, and cardiovascular risk.',
      sourceUrl: 'https://medlineplus.gov/sleepapnea.html',
      sourceName: 'MedlinePlus',
      tags: ['respiratory', 'sleep disorder', 'chronic'],
    },
    {
      id: 'gastroesophageal-reflux',
      title: 'GERD',
      subtitle: 'Acid reflux disorder',
      summary:
        'Gastroesophageal reflux disease causes heartburn and regurgitation due to acid leakage from the stomach into the esophagus.',
      sourceUrl: 'https://medlineplus.gov/gerd.html',
      sourceName: 'MedlinePlus',
      tags: ['gastrointestinal', 'digestive'],
    },
    {
      id: 'eczema',
      title: 'Eczema',
      subtitle: 'Atopic dermatitis',
      summary:
        'Eczema is an inflammatory skin condition with itching, redness and dry patches; triggers include irritants, allergens and stress.',
      sourceUrl: 'https://medlineplus.gov/eczema.html',
      sourceName: 'MedlinePlus',
      tags: ['dermatological', 'inflammatory', 'skin'],
    },
    {
      id: 'psoriasis',
      title: 'Psoriasis',
      subtitle: 'Chronic skin condition',
      summary:
        'Psoriasis produces red, scaly plaques due to immune overactivity; treatment may include topical agents, biologics, and phototherapy.',
      sourceUrl: 'https://medlineplus.gov/psoriasis.html',
      sourceName: 'MedlinePlus',
      tags: ['dermatological', 'autoimmune', 'skin', 'chronic'],
    },
    {
      id: 'stroke',
      title: 'Stroke',
      subtitle: 'Acute cerebrovascular event',
      summary:
        'Stroke is sudden brain injury from blocked or ruptured blood vessels; immediate care is critical to reduce lasting impairment.',
      sourceUrl: 'https://medlineplus.gov/stroke.html',
      sourceName: 'MedlinePlus',
      tags: ['neurological', 'cardiovascular', 'acute'],
    },
    {
      id: 'heart-failure',
      title: 'Heart Failure',
      subtitle: 'Inadequate cardiac output',
      summary:
        'Heart failure occurs when the heart cannot pump enough blood to meet body needs, causing fatigue, swelling and shortness of breath.',
      sourceUrl: 'https://medlineplus.gov/heartfailure.html',
      sourceName: 'MedlinePlus',
      tags: ['cardiovascular', 'chronic', 'heart'],
    },
    {
      id: 'alzheimer',
      title: 'Alzheimer Disease',
      subtitle: 'Progressive cognitive decline',
      summary:
        'Alzheimer disease is a neurodegenerative disorder featuring memory loss, confusion, and behavioral change over years.',
      sourceUrl: 'https://medlineplus.gov/alzheimersdisease.html',
      sourceName: 'MedlinePlus',
      tags: ['neurological', 'degenerative', 'cognitive', 'chronic'],
    },
  ];

  selectedConditionSignal = signal<WikiCondition | null>(this.conditions[0]);

  availableTags = computed(() => {
    const allTags = new Set<string>();
    this.conditions.forEach(condition => {
      condition.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  });

  filteredConditions = computed(() => {
    let filtered = this.conditions;

    // Filter by search query
    const query = this.searchQuery().trim().toLowerCase();
    if (query) {
      filtered = filtered.filter((condition) =>
        condition.title.toLowerCase().includes(query) ||
        condition.subtitle.toLowerCase().includes(query) ||
        condition.summary.toLowerCase().includes(query),
      );
    }

    // Filter by selected tags
    const tags = this.selectedTags();
    if (tags.length > 0) {
      filtered = filtered.filter((condition) =>
        tags.every(tag => condition.tags.includes(tag))
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
      this.selectedTags.set(currentTags.filter(t => t !== tag));
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
