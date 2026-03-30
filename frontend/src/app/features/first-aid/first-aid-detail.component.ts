import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { FirstAidService } from './first-aid.service';
import { FirstAidCard, SeverityLevel } from './first-aid.types';

@Component({
  selector: 'app-first-aid-detail',
  imports: [CommonModule, RouterLink, TranslateModule, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (card(); as c) {
      <div class="min-h-screen bg-gradient-to-br from-rose-50 via-white to-sage-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">

        <!-- Header -->
        <app-page-header
          [title]="c.titleKey | translate"
          [subtitle]="c.descriptionKey | translate"
          [backLabel]="'FIRST_AID.BACK' | translate"
          [showBackLabel]="false"
        >
          <span pageHeaderIcon class="text-3xl leading-none">
            {{ c.icon }}
          </span>

          <div pageHeaderRight>
            <div class="severity-badge" [attr.data-severity]="c.severity">
              {{ getSeverityLabel(c.severity) | translate }}
            </div>
          </div>
        </app-page-header>

        <main class="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24">

          <!-- Hero -->
          <div class="text-center mb-8">
            <div class="text-6xl mb-4">{{ c.icon }}</div>
            <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {{ c.descriptionKey | translate }}
            </p>
          </div>

          <!-- Emergency Call Button (for critical) -->
          @if (c.severity === 'critical' && service.userEmergencyNumber(); as emergency) {
            <a
              [href]="'tel:' + emergency.numbers.general"
              class="flex items-center justify-center gap-3 w-full mb-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-red-600/30 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {{ 'FIRST_AID.CALL_NOW' | translate }}: {{ emergency.numbers.general }}
            </a>
          }

          <!-- When to Call Emergency -->
          @if (c.whenToCallEmergency?.length) {
            <div class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800">
              <h3 class="font-bold text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
                <span>🚨</span>
                {{ 'FIRST_AID.WHEN_TO_CALL' | translate }}
              </h3>
              <ul class="space-y-1">
                @for (item of c.whenToCallEmergency; track item) {
                  <li class="text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                    <span class="mt-1">•</span>
                    {{ item | translate }}
                  </li>
                }
              </ul>
            </div>
          }

          <!-- Steps -->
          <div class="space-y-4 mb-8">
            @for (step of c.steps; track step.order; let i = $index) {
              <button
                type="button"
                class="step-card w-full text-left"
                [class.expanded]="expandedStep() === i"
                (click)="toggleStep(i)"
              >
                <div class="flex items-start gap-4">
                  <!-- Step Number -->
                  <div class="step-number">
                    {{ step.order }}
                  </div>

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 dark:text-white">
                      {{ step.instruction | translate }}
                    </p>

                    @if (step.duration) {
                      <span class="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {{ step.duration }}
                      </span>
                    }

                    <!-- Expanded content -->
                    @if (expandedStep() === i) {
                      <div class="mt-3 space-y-2">
                        @if (step.warning) {
                          <div class="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                            <p class="text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
                              <span>⚠️</span>
                              {{ step.warning | translate }}
                            </p>
                          </div>
                        }
                        @if (step.tip) {
                          <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <p class="text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                              <span>💡</span>
                              {{ step.tip | translate }}
                            </p>
                          </div>
                        }
                      </div>
                    }
                  </div>

                  <!-- Expand indicator -->
                  @if (step.warning || step.tip) {
                    <svg
                      class="w-5 h-5 text-gray-400 transition-transform"
                      [class.rotate-180]="expandedStep() === i"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  }
                </div>
              </button>
            }
          </div>

          <!-- Warnings -->
          @if (c.warnings?.length) {
            <div class="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800">
              <h3 class="font-bold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
                <span>⚠️</span>
                {{ 'FIRST_AID.WARNING' | translate }}
              </h3>
              <ul class="space-y-1">
                @for (item of c.warnings; track item) {
                  <li class="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
                    <span class="mt-1">•</span>
                    {{ item | translate }}
                  </li>
                }
              </ul>
            </div>
          }

          <!-- Do NOT -->
          @if (c.doNot?.length) {
            <div class="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl">
              <h3 class="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                <span>🚫</span>
                {{ 'FIRST_AID.DO_NOT' | translate }}
              </h3>
              <ul class="space-y-1">
                @for (item of c.doNot; track item) {
                  <li class="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span class="text-red-500 mt-1">✕</span>
                    {{ item | translate }}
                  </li>
                }
              </ul>
            </div>
          }

          <!-- Related Cards -->
          @if (relatedCards().length > 0) {
            <div class="mt-8">
              <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>🔗</span>
                {{ 'FIRST_AID.RELATED' | translate }}
              </h3>
              <div class="grid sm:grid-cols-2 gap-3">
                @for (related of relatedCards(); track related.id) {
                  <a
                    [routerLink]="['/first-aid', related.id]"
                    class="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                  >
                    <span class="text-2xl">{{ related.icon }}</span>
                    <div class="flex-1 min-w-0">
                      <p class="font-medium text-gray-900 dark:text-white truncate">{{ related.titleKey | translate }}</p>
                    </div>
                    <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                }
              </div>
            </div>
          }

        </main>
      </div>
    } @else {
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <div class="text-6xl mb-4">🔍</div>
          <p class="text-gray-500 dark:text-gray-400 mb-4">Guide not found</p>
          <a routerLink="/first-aid" class="text-primary-600 hover:underline">Back to First Aid</a>
        </div>
      </div>
    }
  `,
  styles: [`
    .severity-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.025em;
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

    .step-card {
      padding: 1rem;
      background: white;
      border-radius: 1rem;
      border: 1px solid #e5e7eb;
      cursor: pointer;
      transition: all 0.2s;
    }

    :host-context(.dark) .step-card {
      background: #1f2937;
      border-color: #374151;
    }

    .step-card:hover {
      border-color: #f43f5e;
    }

    .step-card.expanded {
      border-color: #f43f5e;
      box-shadow: 0 4px 12px rgba(244, 63, 94, 0.1);
    }

    .step-number {
      flex-shrink: 0;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f43f5e, #e11d48);
      color: white;
      border-radius: 50%;
      font-weight: 700;
      font-size: 0.875rem;
    }
  `],
})
export class FirstAidDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly service = inject(FirstAidService);
  readonly translate = inject(TranslateService);

  readonly card = signal<FirstAidCard | null>(null);
  readonly expandedStep = signal<number | null>(null);

  readonly relatedCards = computed(() => {
    const c = this.card();
    if (!c) return [];
    return this.service.getRelatedCards(c.id);
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        const foundCard = this.service.getCard(id);
        if (foundCard) {
          this.card.set(foundCard);
          this.expandedStep.set(null);
        } else {
          // Redirect to 404 page for non-existent procedures
          this.router.navigate(['/not-found']);
        }
      }
    });
  }

  toggleStep(index: number): void {
    const card = this.card();
    if (!card) return;

    const step = card.steps[index];
    if (step.warning || step.tip) {
      this.expandedStep.set(this.expandedStep() === index ? null : index);
    }
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
