import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  ElementRef,
  ViewChild,
  HostListener,
  ChangeDetectionStrategy,
  OnDestroy,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

interface HighlightPart {
  text: string;
  isMatch: boolean;
}

@Component({
  selector: 'app-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="autocomplete-container" [class.is-open]="isOpen()">
      <!-- Selected Items as Chips (Multi-select mode) -->
      @if (multiple && selectedItems.length > 0) {
        <div class="chips-container">
          @for (item of selectedItems; track item) {
            <span class="chip" [attr.data-item]="item">
              <span class="chip-text">{{ item }}</span>
              <button
                type="button"
                class="chip-remove"
                (click)="removeItem(item, $event)"
                [attr.aria-label]="'Remove ' + item"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
                </svg>
              </button>
            </span>
          }
        </div>
      }

      <!-- Input Field -->
      <div class="input-wrapper">
        <input
          #inputElement
          type="text"
          class="autocomplete-input"
          [placeholder]="computedPlaceholder()"
          [value]="searchQuery()"
          (input)="onInputChange($event)"
          (focus)="onFocus()"
          (keydown)="onKeyDown($event)"
          [attr.aria-expanded]="isOpen()"
          [attr.aria-activedescendant]="highlightedIndex() >= 0 ? 'option-' + highlightedIndex() : null"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-controls="autocomplete-listbox"
          role="combobox"
        />

        <!-- Clear button for single-select with value -->
        @if (!multiple && selectedItems.length > 0 && searchQuery()) {
          <button
            type="button"
            class="clear-btn"
            (click)="clearSelection($event)"
            aria-label="Clear selection"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
            </svg>
          </button>
        }

        <!-- Dropdown indicator -->
        <button
          type="button"
          class="dropdown-toggle"
          (click)="toggleDropdown($event)"
          [attr.aria-label]="isOpen() ? 'Close suggestions' : 'Open suggestions'"
          tabindex="-1"
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            class="w-5 h-5 transition-transform duration-200"
            [class.rotate-180]="isOpen()"
          >
            <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>

      <!-- Dropdown -->
      @if (isOpen()) {
        <div
          id="autocomplete-listbox"
          class="dropdown"
          role="listbox"
          [attr.aria-label]="placeholder + ' options'"
        >
          @if (filteredSuggestions().length > 0) {
            @for (suggestion of filteredSuggestions(); track suggestion; let i = $index) {
              <div
                [id]="'option-' + i"
                class="dropdown-item"
                [class.highlighted]="highlightedIndex() === i"
                [class.selected]="isSelected(suggestion)"
                (click)="selectSuggestion(suggestion)"
                (keydown.enter)="selectSuggestion(suggestion)"
                (mouseenter)="highlightedIndex.set(i)"
                role="option"
                tabindex="-1"
                [attr.aria-selected]="isSelected(suggestion)"
              >
                <span>
                  @for (part of getHighlightParts(suggestion); track $index) {
                    <span [class.match-highlight]="part.isMatch">{{ part.text }}</span>
                  }
                </span>
                @if (isSelected(suggestion)) {
                  <svg viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 check-icon">
                    <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/>
                  </svg>
                }
              </div>
            }
          }

          <!-- Custom entry option -->
          @if (allowCustom && searchQuery() && !suggestionExists()) {
            <div
              class="dropdown-item custom-entry"
              [class.highlighted]="highlightedIndex() === filteredSuggestions().length"
              (click)="addCustomEntry()"
              (keydown.enter)="addCustomEntry()"
              (mouseenter)="highlightedIndex.set(filteredSuggestions().length)"
              role="option"
              tabindex="-1"
              [attr.aria-selected]="false"
            >
              <span class="flex items-center gap-2">
                <svg viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"/>
                </svg>
                Add "<strong>{{ searchQuery() }}</strong>"
              </span>
            </div>
          }

          <!-- No results message -->
          @if (filteredSuggestions().length === 0 && !allowCustom) {
            <div class="dropdown-empty">
              No matching options found
            </div>
          }

          @if (filteredSuggestions().length === 0 && allowCustom && !searchQuery()) {
            <div class="dropdown-empty">
              Start typing to search or add custom entry
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .autocomplete-container {
      position: relative;
      width: 100%;
    }

    /* Chips Container */
    .chips-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem 0.375rem 0.875rem;
      background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%);
      border: 1px solid #fecdd3;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 600;
      color: #e11d48;
      box-shadow: 0 1px 2px rgba(225, 29, 72, 0.1);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      animation: chip-enter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    .chip:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 6px -1px rgba(225, 29, 72, 0.1), 0 2px 4px -1px rgba(225, 29, 72, 0.06);
    }

    @keyframes chip-enter {
      from {
        opacity: 0;
        transform: scale(0.8) translateY(4px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .chip-text {
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .chip-remove {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.25rem;
      height: 1.25rem;
      padding: 0;
      border: none;
      border-radius: 9999px;
      background: rgba(190, 18, 60, 0.1);
      color: #be123c;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .chip-remove:hover {
      background: rgba(190, 18, 60, 0.2);
      color: #9f1239;
    }

    .chip-remove:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(244, 63, 94, 0.3);
    }

    /* Input Wrapper */
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .autocomplete-input {
      width: 100%;
      padding: 0.75rem 1rem;
      padding-right: 2.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 1rem;
      background-color: #f8fafc;
      color: #1e293b;
      font-family: inherit;
      font-size: 1rem;
      line-height: 1.5;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }

    .autocomplete-input::placeholder {
      color: #94a3b8;
    }

    .autocomplete-input:focus {
      outline: none;
      border-color: #f43f5e;
      background-color: #ffffff;
      box-shadow: 0 0 0 4px rgba(244, 63, 94, 0.15);
    }

    .is-open .autocomplete-input {
      border-color: #f43f5e;
    }

    /* Buttons in input */
    .clear-btn,
    .dropdown-toggle {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem;
      border-radius: 9999px;
      border: 1px solid transparent;
      background: rgba(255, 255, 255, 0.85);
      color: #6b7280;
      cursor: pointer;
      transition: all 0.15s ease;
      box-shadow: 0 0 0 0 rgba(30, 41, 59, 0.2);
    }
    .clear-btn:hover,
    .dropdown-toggle:hover {
      color: #1f2937;
      border-color: #d1d5db;
      background: rgba(255, 255, 255, 1);
      box-shadow: 0 2px 7px rgba(30, 41, 59, 0.12);
    }

    .clear-btn {
      right: 2.5rem;
    }

    .clear-btn:hover {
      color: #ef4444;
    }

    .dropdown-toggle {
      right: 0.75rem;
    }

    .dropdown-toggle:hover {
      color: #f43f5e;
    }

    /* Dropdown */
    .dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      max-height: 280px;
      overflow-y: auto;
      margin-top: 0.5rem;
      background-color: #ffffff;
      border: 1px solid #f1f5f9;
      border-radius: 1rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      z-index: 50;
      padding: 0.5rem;
      animation: dropdown-enter 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: top center;
    }

    @keyframes dropdown-enter {
      from {
        opacity: 0;
        transform: scaleY(0.95) translateY(-5px);
      }
      to {
        opacity: 1;
        transform: scaleY(1) translateY(0);
      }
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: background 0.1s ease;
      font-size: 0.9375rem;
      color: #374151;
    }

    .dropdown-item:last-child {
      border-radius: 0 0 0.75rem 0.75rem;
    }

    .dropdown-item.highlighted {
      background: #fef2f2;
    }

    .dropdown-item.selected {
      color: #be123c;
      font-weight: 500;
    }

    .dropdown-item:hover {
      background: #fef2f2;
    }

    .dropdown-item.custom-entry {
      color: #f43f5e;
      border-top: 1px dashed #fecdd3;
    }

    .dropdown-item.custom-entry strong {
      font-weight: 600;
    }

    .check-icon {
      color: #f43f5e;
      flex-shrink: 0;
    }

    .dropdown-empty {
      padding: 1rem;
      text-align: center;
      color: #9ca3af;
      font-size: 0.875rem;
    }

    /* Highlight match styling */
    .match-highlight {
      background: #fef08a;
      border-radius: 2px;
      padding: 0 1px;
    }

    /* Scrollbar styling */
    .dropdown::-webkit-scrollbar {
      width: 6px;
    }

    .dropdown::-webkit-scrollbar-track {
      background: transparent;
    }

    .dropdown::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 3px;
    }

    .dropdown::-webkit-scrollbar-thumb:hover {
      background: #9ca3af;
    }

    /* Dark mode */
    :host-context(.dark) .chip {
      background: linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(244, 63, 94, 0.1) 100%);
      border-color: rgba(244, 63, 94, 0.3);
      color: #fb7185;
    }

    :host-context(.dark) .chip:hover {
      background: linear-gradient(135deg, rgba(244, 63, 94, 0.25) 0%, rgba(244, 63, 94, 0.2) 100%);
      border-color: rgba(244, 63, 94, 0.4);
    }

    :host-context(.dark) .chip-remove {
      background: rgba(244, 63, 94, 0.2);
      color: #fb7185;
    }

    :host-context(.dark) .chip-remove:hover {
      background: rgba(244, 63, 94, 0.3);
      color: #fda4af;
    }

    :host-context(.dark) .autocomplete-input {
      border-color: #374151;
      background: rgba(31, 41, 55, 0.8);
      color: white;
    }

    :host-context(.dark) .autocomplete-input::placeholder {
      color: #6b7280;
    }

    :host-context(.dark) .autocomplete-input:focus,
    :host-context(.dark) .is-open .autocomplete-input {
      border-color: #f43f5e;
      background: #1f2937;
      box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.2);
    }

    :host-context(.dark) .dropdown {
      background: #1f2937;
      border-color: #f43f5e;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
    }

    :host-context(.dark) .dropdown-item {
      color: #e5e7eb;
    }

    :host-context(.dark) .dropdown-item.highlighted,
    :host-context(.dark) .dropdown-item:hover {
      background: rgba(244, 63, 94, 0.1);
    }

    :host-context(.dark) .dropdown-item.selected {
      color: #fb7185;
    }

    :host-context(.dark) .dropdown-item.custom-entry {
      color: #fb7185;
      border-top-color: rgba(244, 63, 94, 0.3);
    }

    :host-context(.dark) .dropdown-empty {
      color: #6b7280;
    }

    :host-context(.dark) .clear-btn:hover {
      color: #f87171;
    }

    :host-context(.dark) .dropdown-toggle:hover {
      color: #fb7185;
    }

    :host-context(.dark) .match-highlight {
      background: rgba(250, 204, 21, 0.3);
    }

    :host-context(.dark) .dropdown::-webkit-scrollbar-thumb {
      background: #4b5563;
    }

    :host-context(.dark) .dropdown::-webkit-scrollbar-thumb:hover {
      background: #6b7280;
    }
  `]
})
export class AutocompleteComponent implements AfterViewInit, OnDestroy, OnChanges {
  // Inputs
  @Input() suggestions: string[] = [];
  @Input() selectedItems: string[] = [];
  @Input() placeholder = 'Search...';
  @Input() allowCustom = true;
  @Input() multiple = true;

  // Outputs
  @Output() itemsChange = new EventEmitter<string[]>();
  @Output() itemAdded = new EventEmitter<string>();
  @Output() itemRemoved = new EventEmitter<string>();

  // ViewChild
  @ViewChild('inputElement') inputElement!: ElementRef<HTMLInputElement>;

  // Internal signals
  searchQuery = signal('');
  isOpen = signal(false);
  highlightedIndex = signal(-1);

  // Debounce subject for filtering
  private readonly searchSubject = new Subject<string>();
  private readonly debouncedQuery = signal('');

  // Computed: filtered suggestions based on search query
  filteredSuggestions = computed(() => {
    const query = this.debouncedQuery().toLowerCase().trim();
    if (!query) {
      // Show all non-selected suggestions when empty
      return this.suggestions.filter(s => !this.selectedItems.includes(s));
    }
    return this.suggestions
      .filter(s =>
        s.toLowerCase().includes(query) &&
        !this.selectedItems.includes(s)
      )
      .sort((a, b) => {
        // Prioritize items that start with the query
        const aStarts = a.toLowerCase().startsWith(query);
        const bStarts = b.toLowerCase().startsWith(query);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.localeCompare(b);
      });
  });

  // Computed: check if current query exactly matches a suggestion
  suggestionExists = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    return this.suggestions.some(s => s.toLowerCase() === query) ||
           this.selectedItems.some(s => s.toLowerCase() === query);
  });

  // Computed: dynamic placeholder
  computedPlaceholder = computed(() => {
    if (!this.multiple && this.selectedItems.length > 0) {
      return this.selectedItems[0];
    }
    return this.placeholder;
  });

  // Use inject() instead of constructor injection
  private readonly elementRef = inject(ElementRef);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedItems'] && !this.multiple) {
      const selected = this.selectedItems?.[0] ?? '';
      this.searchQuery.set(selected);
      this.debouncedQuery.set(selected);
    }
  }

  ngAfterViewInit() {
    // Set up debounced search
    this.searchSubject.pipe(
      debounceTime(100),
      distinctUntilChanged()
    ).subscribe(query => {
      this.debouncedQuery.set(query);
    });
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }

  // Click outside handler
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  onInputChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.searchSubject.next(value);
    this.highlightedIndex.set(-1);

    if (!this.isOpen()) {
      this.isOpen.set(true);
    }
  }

  onFocus() {
    this.isOpen.set(true);
    this.highlightedIndex.set(-1);
  }

  onKeyDown(event: KeyboardEvent) {
    const totalOptions = this.filteredSuggestions().length +
      (this.allowCustom && this.searchQuery() && !this.suggestionExists() ? 1 : 0);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (this.isOpen()) {
          this.highlightedIndex.update(i =>
            i < totalOptions - 1 ? i + 1 : 0
          );
        } else {
          this.isOpen.set(true);
        }
        this.scrollToHighlighted();
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (this.isOpen()) {
          this.highlightedIndex.update(i =>
            i > 0 ? i - 1 : totalOptions - 1
          );
          this.scrollToHighlighted();
        }
        break;

      case 'Enter':
        event.preventDefault();
        if (this.highlightedIndex() >= 0) {
          if (this.highlightedIndex() < this.filteredSuggestions().length) {
            this.selectSuggestion(this.filteredSuggestions()[this.highlightedIndex()]);
          } else if (this.allowCustom && this.searchQuery()) {
            this.addCustomEntry();
          }
        } else if (this.allowCustom && this.searchQuery().trim()) {
          this.addCustomEntry();
        }
        break;

      case 'Escape':
        event.preventDefault();
        this.closeDropdown();
        break;

      case 'Backspace':
        if (!this.searchQuery() && this.multiple && this.selectedItems.length > 0) {
          // Remove last item when backspace on empty input
          const lastItem = this.selectedItems.at(-1) ?? '';
          this.removeItem(lastItem);
        }
        break;

      case 'Tab':
        this.closeDropdown();
        break;
    }
  }

  toggleDropdown(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (this.isOpen()) {
      this.closeDropdown();
    } else {
      this.isOpen.set(true);
      this.inputElement.nativeElement.focus();
    }
  }

  closeDropdown() {
    this.isOpen.set(false);
    this.highlightedIndex.set(-1);
  }

  selectSuggestion(suggestion: string) {
    if (this.multiple && this.isSelected(suggestion)) {
      this.removeItem(suggestion);
      return;
    }

    this.addItem(suggestion);
  }

  addCustomEntry() {
    const value = this.searchQuery().trim();
    if (value && !this.selectedItems.includes(value)) {
      this.addItem(value);
    }
  }

  private addItem(item: string) {
    if (!item) {
      return;
    }

    if (this.multiple && this.selectedItems.includes(item)) {
      // Prevent duplicates when user clicks quickly or UI update is delayed
      this.searchQuery.set('');
      this.debouncedQuery.set('');
      this.highlightedIndex.set(-1);
      return;
    }

    if (this.multiple) {
      const newItems = Array.from(new Set([...this.selectedItems, item]));
      this.itemsChange.emit(newItems);
      this.itemAdded.emit(item);

      // Reset input for multi-select so user can start typing another entry.
      this.searchQuery.set('');
      this.debouncedQuery.set('');
      this.highlightedIndex.set(-1);

      // Keep focus for multi-select
      this.inputElement.nativeElement.focus();
    } else {
      this.itemsChange.emit([item]);
      this.itemAdded.emit(item);

      // Keep selected value visible for single-select mode
      this.searchQuery.set(item);
      this.debouncedQuery.set(item);
      this.highlightedIndex.set(-1);
      this.closeDropdown();
    }
  }

  removeItem(item: string, event?: MouseEvent) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const newItems = this.selectedItems.filter(i => i !== item);
    this.itemsChange.emit(newItems);
    this.itemRemoved.emit(item);
  }

  clearSelection(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.itemsChange.emit([]);
    this.searchQuery.set('');
    this.debouncedQuery.set('');
    this.inputElement.nativeElement.focus();
  }

  isSelected(item: string): boolean {
    return this.selectedItems.includes(item);
  }

  getHighlightParts(text: string): HighlightPart[] {
    const query = this.debouncedQuery().trim();
    if (!query) return [{ text, isMatch: false }];

    const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
    const normalizedQuery = query.toLowerCase();

    return text
      .split(regex)
      .filter((part) => part.length > 0)
      .map((part) => ({
        text: part,
        isMatch: part.toLowerCase() === normalizedQuery,
      }));
  }

  private escapeRegex(str: string): string {
    return str.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
  }

  private scrollToHighlighted() {
    setTimeout(() => {
      const highlighted = this.elementRef.nativeElement.querySelector('.dropdown-item.highlighted');
      if (highlighted) {
        highlighted.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }
}
