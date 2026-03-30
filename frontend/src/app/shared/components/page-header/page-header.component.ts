import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackButtonComponent } from '../back-button/back-button.component';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, BackButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="relative bg-inherit px-4 sm:px-6 lg:px-8 py-4 shadow-sm">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-center justify-between gap-4">
          <div class="shrink-0">
            <app-back-button [label]="backLabel()" [showLabel]="showBackLabel()"></app-back-button>
          </div>

          <div class="flex-1 flex items-center justify-center gap-3 min-w-0">
            <ng-content select="[pageHeaderIcon]"></ng-content>
            <div class="text-center min-w-0">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white font-heading truncate">{{ title() }}</h1>
              @if (subtitle()) {
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">{{ subtitle() }}</p>
              }
            </div>
          </div>

          <div class="shrink-0 flex items-center justify-end min-w-[160px]">
            <ng-content select="[pageHeaderRight]"></ng-content>
          </div>
        </div>
      </div>
    </header>
  `,
})
export class PageHeaderComponent {
  readonly title = input('');
  readonly subtitle = input('');
  readonly backLabel = input('common.back_to_dashboard');
  readonly showBackLabel = input(true);
}
