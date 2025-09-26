import { Component, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AccountMenu } from '../account-menu/account-menu';

@Component({
  selector: 'app-header',
  imports: [AccountMenu],
  templateUrl: './header.html',
  styles: ``,
})
export class Header {
  isMobileMenuOpen = false;
  activeRoute = '';

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.activeRoute = event.url;
      });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const mobileMenuButton = target.closest('[data-mobile-menu-button]');
    const mobileMenu = target.closest('[data-mobile-menu]');

    if (!mobileMenuButton && !mobileMenu) {
      this.isMobileMenuOpen = false;
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth >= 640) {
      this.isMobileMenuOpen = false;
    }
  }

  isActive(route: string): boolean {
    return this.activeRoute === route || this.activeRoute.startsWith(route);
  }
}
