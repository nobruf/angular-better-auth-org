import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  imports: [CommonModule],
  templateUrl: './button.html',
  styles: ``,
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() fullWidth: boolean = false;
  @Input() icon: string = '';
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Output() onClick = new EventEmitter<Event>();

  onButtonClick(event: Event): void {
    if (!this.disabled && !this.loading) {
      this.onClick.emit(event);
    }
  }

  getButtonClasses(): string {
    const baseClasses =
      'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer';

    const sizeClasses = {
      sm: 'px-3 py-2 text-xs',
      md: 'px-3 py-2 md:py-2.5 text-xs md:text-sm',
      lg: 'px-4 py-3 text-sm md:text-base',
    };

    const variantClasses = {
      primary:
        'bg-gradient-to-r from-emerald-500 hover:from-emerald-600 to-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-emerald-500/25 text-white',
      secondary:
        'bg-gray-700/50 hover:bg-gray-700 border border-gray-600 text-gray-300 hover:text-white',
      outline:
        'bg-transparent border border-gray-600 hover:border-emerald-500 text-gray-300 hover:text-emerald-400',
      ghost: 'bg-gray-800/30 hover:bg-gray-700/50 text-gray-300 hover:text-white',
      danger:
        'bg-gradient-to-r from-red-500 hover:from-red-600 to-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/25 text-white',
    };

    const disabledClasses = this.disabled ? 'opacity-50 cursor-not-allowed' : '';
    const fullWidthClasses = this.fullWidth ? 'w-full' : '';

    return `${baseClasses} ${sizeClasses[this.size]} ${
      variantClasses[this.variant]
    } ${disabledClasses} ${fullWidthClasses}`;
  }

  getIconClasses(): string {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    return sizeClasses[this.size];
  }
}
