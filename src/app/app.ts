import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSonnerToaster } from 'ngx-sonner';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSonnerToaster],
  templateUrl: './app.html',
})
export class App implements OnInit {
  protected readonly title = signal('angular-better-auth-org');
  private themeService = inject(ThemeService);

  ngOnInit() {
    this.themeService.initializeTheme();
  }
}
