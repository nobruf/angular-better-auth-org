import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroXMarkSolid, heroCheckSolid, heroArrowPathSolid } from '@ng-icons/heroicons/solid';
import { AuthService } from '../../../services/auth.service';
import { Organization } from 'better-auth/plugins';

@Component({
  selector: 'app-modal-change-org',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [provideIcons({ heroXMarkSolid, heroCheckSolid, heroArrowPathSolid })],
  templateUrl: './modal-change-org.html',
})
export class ModalChangeOrgComponent {
  private authService = inject(AuthService);
  readonly isModalOpen = signal(false);
  currentOrgId: string = '';
  organizations: Organization[] = [];

  constructor() {
    this.authService.listOrganizations().subscribe((res) => {
      if (!res?.data) return;
      this.organizations = res.data;
    });
    this.authService.useSession().subscribe((res) => {
      if (!res?.data) return;
      this.currentOrgId = res.data.session.activeOrganizationId!;
    });
  }

  toggleModalOpen(): void {
    this.isModalOpen.update((value) => !value);
  }

  openModal(): void {
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  selectOrganization(org: Organization): void {
    this.authService.setActiveOrganization(org.id);
    this.currentOrgId = org.id;
  }

  getInitials(name: string) {
    return name
      .split(' ')
      .map((namePart: string) => namePart.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
