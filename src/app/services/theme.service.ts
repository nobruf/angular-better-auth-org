import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'theme';
  private readonly DARK_THEME = 'dark';
  private readonly LIGHT_THEME = 'light';

  public isDarkMode = signal<boolean>(false);

  constructor() {
    this.initializeTheme();
  }

  public initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY);

    if (savedTheme === this.DARK_THEME) {
      this.setTheme(true);
    } else if (savedTheme === this.LIGHT_THEME) {
      this.setTheme(false);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setThemeWithoutSaving(prefersDark);
    }
  }

  public toggleTheme(): void {
    this.setTheme(!this.isDarkMode());
  }

  public setTheme(isDark: boolean): void {
    this.isDarkMode.set(isDark);

    if (isDark) {
      document.documentElement.classList.add(this.DARK_THEME);
      document.body.classList.add(this.DARK_THEME);
      localStorage.setItem(this.THEME_KEY, this.DARK_THEME);
    } else {
      document.documentElement.classList.remove(this.DARK_THEME);
      document.body.classList.remove(this.DARK_THEME);
      localStorage.setItem(this.THEME_KEY, this.LIGHT_THEME);
    }
  }

  private setThemeWithoutSaving(isDark: boolean): void {
    this.isDarkMode.set(isDark);

    if (isDark) {
      document.documentElement.classList.add(this.DARK_THEME);
      document.body.classList.add(this.DARK_THEME);
    } else {
      document.documentElement.classList.remove(this.DARK_THEME);
      document.body.classList.remove(this.DARK_THEME);
    }
  }
}
