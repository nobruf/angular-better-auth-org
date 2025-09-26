import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input',
  imports: [CommonModule],
  templateUrl: './input.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  styles: ``,
})
export class InputComponent implements ControlValueAccessor {
  @Input() type: 'text' | 'email' | 'password' | 'number' = 'text';
  @Input() placeholder: string = '';
  @Input() label: string = '';
  @Input() error: string = '';
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() variant: 'default' | 'outline' | 'ghost' = 'default';

  value: string = '';
  isFocused: boolean = false;
  showPassword: boolean = false;

  private onChange = (value: string) => {};
  private onTouched = () => {};

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onFocus(): void {
    this.isFocused = true;
  }

  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  getInputType(): string {
    if (this.type === 'password') {
      return this.showPassword ? 'text' : 'password';
    }
    return this.type;
  }

  getInputClasses(): string {
    const baseClasses = 'w-full border rounded-xl focus:outline-none transition-all duration-200';

    const sizeClasses = {
      sm: 'px-3 py-2 text-xs',
      md: 'px-3 py-2 md:py-2.5 text-xs md:text-sm',
      lg: 'px-4 py-3 text-sm md:text-base',
    };

    const variantClasses = {
      default:
        'bg-gray-700/50 border-gray-600 focus:border-transparent focus:ring-2 focus:ring-emerald-500 text-white placeholder-gray-400',
      outline:
        'bg-transparent border-gray-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-gray-400',
      ghost:
        'bg-gray-800/30 border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-gray-400',
    };

    const errorClasses = this.error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';
    const disabledClasses = this.disabled ? 'opacity-50 cursor-not-allowed' : '';

    return `${baseClasses} ${sizeClasses[this.size]} ${
      variantClasses[this.variant]
    } ${errorClasses} ${disabledClasses}`;
  }

  getLabelClasses(): string {
    const sizeClasses = {
      sm: 'text-xs',
      md: 'text-xs md:text-sm',
      lg: 'text-sm md:text-base',
    };

    return `font-medium text-gray-300 ${sizeClasses[this.size]}`;
  }

  getErrorClasses(): string {
    return 'text-red-400 text-xs';
  }
}
