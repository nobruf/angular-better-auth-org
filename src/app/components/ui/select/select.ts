import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronDownSolid } from '@ng-icons/heroicons/solid';
import { ClickOutsideDirective } from '../../../directives/click-outside.directive';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, NgIcon, ClickOutsideDirective],
  providers: [
    provideIcons({
      heroChevronDownSolid,
    }),
  ],
  templateUrl: './select.html',
})
export class SelectComponent {
  @Input() options: SelectOption[] = [];
  @Input() value: string = '';
  @Input() disabled: boolean = false;
  @Input() placeholder: string = 'Select an option';
  @Output() valueChange = new EventEmitter<string>();
  @ViewChild('triggerButton', { read: ElementRef }) triggerButton?: ElementRef;

  isOpen = signal(false);
  dropdownPosition = signal({ top: 0, left: 0, width: 0 });

  get selectedOption(): SelectOption | undefined {
    return this.options.find((opt) => opt.value === this.value);
  }

  toggleDropdown(): void {
    if (!this.disabled) {
      if (!this.isOpen()) {
        this.calculateDropdownPosition();
      }
      this.isOpen.update((value) => !value);
    }
  }

  selectOption(option: SelectOption): void {
    if (!option.disabled) {
      this.valueChange.emit(option.value);
      this.isOpen.set(false);
    }
  }

  closeDropdown(): void {
    this.isOpen.set(false);
  }

  private calculateDropdownPosition(): void {
    if (this.triggerButton) {
      const rect = this.triggerButton.nativeElement.getBoundingClientRect();
      this.dropdownPosition.set({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  }
}
