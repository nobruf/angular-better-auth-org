import { Component, HostListener, output, signal, inject, computed } from '@angular/core';
import { toast } from 'ngx-sonner';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';
import { User } from 'better-auth';
type UserWithInitials = User & { initials: string };

@Component({
  selector: 'app-account-menu',
  imports: [],
  templateUrl: './account-menu.html',
  styles: ``,
})
export class AccountMenu {
  private authService = inject(AuthService);
  currentUser: UserWithInitials | null = null;

  constructor(private router: Router, public themeService: ThemeService) {
    this.authService.useSession().subscribe((res) => {
      if (!res?.data) return;

      this.currentUser = {
        ...res.data.user,
        initials: res.data.user.name
          .split(' ')
          .map((namePart: string) => namePart.charAt(0))
          .join('')
          .toUpperCase()
          .slice(0, 2),
      };
    });
  }

  profileClick = output<void>();
  signOutClick = output<void>();
  isOpen = signal(false);

  toggleDropdown() {
    this.isOpen.update((open) => !open);
  }

  // @HostListener('document:click', ['$event'])
  // onDocumentClick(event: Event) {
  //   const target = event.target as HTMLElement;
  //   const accountMenu = target.closest('.account-menu');

  //   if (!accountMenu) {
  //     this.isOpen.update((open) => !open);
  //   }
  // }

  onProfileClick() {
    this.isOpen.update((open) => !open);
    this.router.navigate(['/settings']);
  }

  async onSignOut() {
    this.isOpen.update((open) => !open);
    this.signOutClick.emit();

    try {
      await this.authService.signOut();
      toast.success('Logout realizado com sucesso');
      this.router.navigate(['/login']);
    } catch (error) {
      toast.error('Erro ao fazer logout');
      console.error('Sign out error:', error);
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
