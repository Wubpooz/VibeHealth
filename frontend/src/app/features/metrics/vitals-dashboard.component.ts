import {
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { VitalsLoggerComponent } from './vitals-logger.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LucideHeartPulse } from '@lucide/angular';

@Component({
  selector: 'app-vitals-dashboard',
  imports: [
    CommonModule,
    TranslateModule,
    VitalsLoggerComponent,
    PageHeaderComponent,
    LucideHeartPulse,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex flex-col bg-[#fdf8f8] dark:bg-gray-950 transition-colors duration-300 no-select">
      <!-- Page Header -->
      <app-page-header
        [title]="'METRICS.TITLE' | translate"
        [subtitle]="'METRICS.CONSISTENCY_KEY' | translate"
        [backLabel]="'common.back_to_dashboard' | translate"
        [showBackLabel]="true"
      >
        <span pageHeaderIcon class="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <span class="text-white inline-flex" aria-hidden="true">
            <svg lucideHeartPulse [size]="24" [strokeWidth]="2"></svg>
          </span>
        </span>
      </app-page-header>

      <div class="px-4 sm:px-6 lg:px-8 py-8 pb-10">
        <div class="flex flex-col gap-6">
          <!-- Vitals Logger -->
          <div>
            <app-vitals-logger />
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .no-select {
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
    }
  `],
})
export class VitalsDashboardComponent {}
