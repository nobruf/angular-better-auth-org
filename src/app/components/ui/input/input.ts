import { Component, booleanAttribute, input, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroAtSymbolSolid, heroEyeSlashSolid, heroEyeSolid } from '@ng-icons/heroicons/solid';

export type InputType = 'text' | 'email' | 'password' | 'number';
export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'default' | 'outline' | 'ghost';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, NgIcon],
  templateUrl: './input.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: InputComponent,
      multi: true,
    },
    provideIcons({ heroAtSymbolSolid, heroEyeSolid, heroEyeSlashSolid }),
  ],
})
export class InputComponent implements ControlValueAccessor {
  type = input<InputType>('text');
  placeholder = input('');
  value = input('');
  label = input('');
  error = input('');
  disabled = input(false, { transform: booleanAttribute });
  required = input(false, { transform: booleanAttribute });
  size = input<InputSize>('md');
  variant = input<InputVariant>('default');

  valueModel = model<string>(this.value());
  showPassword = signal(false);

  private onChangeCallback: (v: any) => void = () => {};
  private onTouchedCallback: () => void = () => {};

  writeValue(value: any): void {
    this.valueModel.set(value ?? '');
  }
  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }

  handleInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.valueModel.set(value);
    this.onChangeCallback(value);
  }

  handleBlur() {
    this.onTouchedCallback();
  }
  togglePasswordVisibility() {
    this.showPassword.update((v) => !v);
  }

  get inputType(): string {
    return this.type() === 'password' ? (this.showPassword() ? 'text' : 'password') : this.type();
  }

  get inputClasses(): string {
    const base = 'w-full border rounded-xl focus:outline-none transition-all duration-200';

    const sizeMap: Record<InputSize, string> = {
      sm: 'px-3 py-2 text-xs',
      md: 'px-3 py-2 md:py-2.5 text-sm',
      lg: 'px-4 py-3 text-base',
    };

    const variantMap: Record<InputVariant, string> = {
      default:
        'bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500',
      outline:
        'bg-transparent border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-emerald-500',
      ghost:
        'bg-gray-100/50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700 focus:ring-1 focus:ring-emerald-500',
    };

    const errorClass = this.error() ? 'border-red-500 focus:ring-red-500' : '';
    const disabledClass = this.disabled() ? 'opacity-50 cursor-not-allowed' : '';

    return `${base} ${sizeMap[this.size()]} ${
      variantMap[this.variant()]
    } ${errorClass} ${disabledClass}`;
  }
}
