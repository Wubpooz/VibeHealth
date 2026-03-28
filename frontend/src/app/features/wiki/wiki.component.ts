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
})
export class WikiComponent {
  searchQuery = signal('');

  conditions: WikiCondition[] = [
    {
      id: 'hypertension',
      title: 'Hypertension',
      subtitle: 'High blood pressure',
      summary:
        'Hypertension is a chronic condition where arterial blood pressure is elevated; it increases risk for stroke, heart attack, and kidney disease.',
      sourceUrl: 'https://medlineplus.gov/highbloodpressure.html',
      sourceName: 'MedlinePlus',
    },
    {
      id: 'type-2-diabetes',
      title: 'Type 2 Diabetes',
      subtitle: 'Insulin resistance and high blood sugar',
      summary:
        'Type 2 Diabetes is a long-term metabolic disorder caused by insulin resistance and relative insulin deficiency; it requires lifestyle and medication management.',
      sourceUrl: 'https://medlineplus.gov/type2diabetes.html',
      sourceName: 'MedlinePlus',
    },
    {
      id: 'asthma',
      title: 'Asthma',
      subtitle: 'Inflammatory airway disease',
      summary:
        'Asthma causes airway inflammation and bronchoconstriction producing wheeze, cough, shortness of breath and variable expiratory flow obstruction.',
      sourceUrl: 'https://medlineplus.gov/asthma.html',
      sourceName: 'MedlinePlus',
    },
    {
      id: 'chronic-kidney-disease',
      title: 'Chronic Kidney Disease',
      subtitle: 'Progressive loss of kidney function',
      summary:
        'Chronic kidney disease is long-term kidney damage leading to reduced glomerular filtration and risk of electrolyte imbalance and cardiovascular complications.',
      sourceUrl: 'https://medlineplus.gov/chronickidneydisease.html',
      sourceName: 'MedlinePlus',
    },
    {
      id: 'copd',
      title: 'COPD',
      subtitle: 'Chronic obstructive pulmonary disease',
      summary:
        'COPD combines emphysema and chronic bronchitis; it is typically caused by smoking and leads to progressive airflow limitation and breathlessness.',
      sourceUrl: 'https://medlineplus.gov/copd.html',
      sourceName: 'MedlinePlus',
    },
    {
      id: 'depression',
      title: 'Depression',
      subtitle: 'Mood disorder',
      summary:
        'Major depressive disorder is characterized by persistent low mood, loss of interest, and functional impairment, often requiring psychotherapy and medication.',
      sourceUrl: 'https://medlineplus.gov/depression.html',
      sourceName: 'MedlinePlus',
    },
    {
      id: 'anxiety-disorders',
      title: 'Anxiety Disorders',
      subtitle: 'Excessive worry and fear',
      summary:
        'Anxiety disorders involve chronic worry, panic, or phobia symptoms that exceed normal stress responses and impair daily life.',
      sourceUrl: 'https://medlineplus.gov/anxiety.html',
      sourceName: 'MedlinePlus',
    },
    {
      id: 'anemia',
      title: 'Anemia',
      subtitle: 'Low red blood cell count',
      summary:
        'Anemia is a deficiency in hemoglobin or red cells, often causing fatigue, pallor and weakness; causes include iron deficiency, chronic disease, and genetic conditions.',
      sourceUrl: 'https://medlineplus.gov/anemia.html',
      sourceName: 'MedlinePlus',
    },
    {
      id: 'osteoarthritis',
      title: 'Osteoarthritis',
      subtitle: 'Degenerative joint disease',
      summary:
        'Osteoarthritis results from joint cartilage wear, causing pain, stiffness and reduced mobility especially in knees, hips and hands.',
      sourceUrl: 'https://medlineplus.gov/osteoarthritis.html',
      sourceName: 'MedlinePlus',
    },
    {
      id: 'rheumatoid-arthritis',
      title: 'Rheumatoid Arthritis',
      subtitle: 'Autoimmune joint inflammation',
      summary:
        'Rheumatoid arthritis is an autoimmune condition with symmetric joint inflammation, pain and deformity; early treatment helps prevent damage.',
      sourceUrl: 'https://medlineplus.gov/rheumatoidarthritis.html',
      sourceName: 'MedlinePlus',
    },
    {
      id: 'migraine',
      title: 'Migraine',
      subtitle: 'Neurological headache disorder',
      summary:
        'Migraine causes recurrent headaches with throbbing pain, nausea, and sensory sensitivity; attacks may last hours to days.',
      sourceUrl: 'https://medlineplus.gov/migraine.html',
      sourceName: 'MedlinePlus',
    },
    {
      id: 'hypothyroidism',
      title: 'Hypothyroidism',
      subtitle: 'Low thyroid hormone production',
      summary:
        'Hypothyroidism causes slow metabolism, fatigue, weight gain, and cold intolerance; it is often treated with levothyroxine.',
      sourceUrl: 'https://medlineplus.gov/hypothyroidism.html',
      sourceName: 'MedlinePlus',
    },
    {
      id: 'hyperthyroidism',
      title: 'Hyperthyroidism',
      subtitle: 'Excess thyroid hormone production',
      summary:
        'Hyperthyroidism can cause rapid heart rate, weight loss, anxiety and heat intolerance; common causes include Graves disease.',
      sourceUrl: 'https://medlineplus.gov/hyperthyroidism.html',
      sourceName: 'MedlinePlus',
    },
    {
      id: 'sleep-apnea',
      title: 'Sleep Apnea',
      subtitle: 'Sleep-disordered breathing',
      summary:
        'Sleep apnea is repeated airway collapse during sleep causing interrupted breathing, daytime sleepiness, and cardiovascular risk.',
      sourceUrl: 'https://medlineplus.gov/sleepapnea.html',
      sourceName: 'MedlinePlus',
    },
    {
      id: 'gastroesophageal-reflux',
      title: 'GERD',
      subtitle: 'Acid reflux disorder',
      summary:
        'Gastroesophageal reflux disease causes heartburn and regurgitation due to acid leakage from the stomach into the esophagus.',
      sourceUrl: 'https://medlineplus.gov/gerd.html',
      sourceName: 'MedlinePlus',
    },
    {
      id: 'eczema',
      title: 'Eczema',
      subtitle: 'Atopic dermatitis',
      summary:
        'Eczema is an inflammatory skin condition with itching, redness and dry patches; triggers include irritants, allergens and stress.',
      sourceUrl: 'https://medlineplus.gov/eczema.html',
      sourceName: 'MedlinePlus',
    },
    {
      id: 'psoriasis',
      title: 'Psoriasis',
      subtitle: 'Chronic skin condition',
      summary:
        'Psoriasis produces red, scaly plaques due to immune overactivity; treatment may include topical agents, biologics, and phototherapy.',
      sourceUrl: 'https://medlineplus.gov/psoriasis.html',
      sourceName: 'MedlinePlus',
    },
    {
      id: 'stroke',
      title: 'Stroke',
      subtitle: 'Acute cerebrovascular event',
      summary:
        'Stroke is sudden brain injury from blocked or ruptured blood vessels; immediate care is critical to reduce lasting impairment.',
      sourceUrl: 'https://medlineplus.gov/stroke.html',
      sourceName: 'MedlinePlus',
    },
    {
      id: 'heart-failure',
      title: 'Heart Failure',
      subtitle: 'Inadequate cardiac output',
      summary:
        'Heart failure occurs when the heart cannot pump enough blood to meet body needs, causing fatigue, swelling and shortness of breath.',
      sourceUrl: 'https://medlineplus.gov/heartfailure.html',
      sourceName: 'MedlinePlus',
    },
    {
      id: 'alzheimer',
      title: 'Alzheimer Disease',
      subtitle: 'Progressive cognitive decline',
      summary:
        'Alzheimer disease is a neurodegenerative disorder featuring memory loss, confusion, and behavioral change over years.',
      sourceUrl: 'https://medlineplus.gov/alzheimersdisease.html',
      sourceName: 'MedlinePlus',
    },
  ];

  selectedConditionSignal = signal<WikiCondition | null>(this.conditions[0]);

  filteredConditions = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) {
      return this.conditions;
    }
    return this.conditions.filter((condition) =>
      condition.title.toLowerCase().includes(query) ||
      condition.subtitle.toLowerCase().includes(query) ||
      condition.summary.toLowerCase().includes(query),
    );
  });

  selectCondition(conditionId: string): void {
    const found = this.conditions.find((condition) => condition.id === conditionId);
    if (found) {
      this.selectedConditionSignal.set(found);
    }
  }

  getSelectedCondition(): WikiCondition | null {
    return this.selectedConditionSignal();
  }
}
