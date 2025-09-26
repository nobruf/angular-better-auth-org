import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { toast } from 'ngx-sonner';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account-menu',
  imports: [],
  templateUrl: './account-menu.html',
  styles: ``,
})
export class AccountMenu {
  @Input() userName: string = '';
  @Input() userEmail: string = '';
  @Input() userAvatar?: string;
  @Output() profileClick = new EventEmitter<void>();
  @Output() signOutClick = new EventEmitter<void>();

  isOpen = false;

  constructor(private authService: AuthService, private router: Router) {
    this.authService.getSession().then((session) => {
      this.userName = session.data?.user?.name || '';
      this.userEmail = session.data?.user?.email || '';
      this.userAvatar = session.data?.user?.image || '';
    });
  }

  get userInitials(): string {
    return this.userName
      .split(' ')
      .map((name) => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const accountMenu = target.closest('.account-menu');

    if (!accountMenu) {
      this.isOpen = false;
    }
  }

  onProfileClick() {
    this.isOpen = false;
    this.router.navigate(['/settings']);
  }

  async onSignOut() {
    this.isOpen = false;
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
}
