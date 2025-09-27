import { Component, HostListener, inject, viewChild, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AccountMenu } from '../account-menu/account-menu';
import { AuthService } from '../../../services/auth.service';
import { Organization } from 'better-auth/plugins';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowPathRoundedSquareSolid } from '@ng-icons/heroicons/solid';
import { ModalChangeOrgComponent } from '../modal-change-org/modal-change-org';

@Component({
  selector: 'app-header',
  imports: [AccountMenu, NgIcon, ModalChangeOrgComponent],
  providers: [provideIcons({ heroArrowPathRoundedSquareSolid })],
  templateUrl: './header.html',
  styles: ``,
})
export class Header {
  @ViewChild('accountMenu') accountMenu!: AccountMenu;
  private orgModal = viewChild.required<ModalChangeOrgComponent>('orgModal');

  currentOrg: Organization | null = null;
  private authService = inject(AuthService);
  isMobileMenuOpen = false;
  activeRoute = '';

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.activeRoute = event.url;
      });

    this.authService.getActiveOrganization().subscribe((res) => {
      if (!res?.data) return;
      this.currentOrg = res.data;
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

  hadleOpenModalOrg() {
    this.orgModal().openModal();
  }
}
