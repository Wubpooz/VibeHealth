import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center" [class]="containerClass()">
      <div
        class="animate-spin rounded-full border-b-2 border-primary-500"
        [ngClass]="{
          'h-4 w-4 border-2': size() === 'sm',
          'h-8 w-8 border-3': size() === 'md',
          'h-12 w-12 border-4': size() === 'lg'
        }"
      ></div>
      @if (text()) {
        <span class="ml-3 text-gray-500 dark:text-gray-400 font-medium">{{ text() }}</span>
      }
    </div>
  `,
})
export class SpinnerComponent {
  size = input<'sm' | 'md' | 'lg'>('md');
  text = input<string>('');
  containerClass = input<string>('');
}
