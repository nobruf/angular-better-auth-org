import {
  Component,
  EventEmitter,
  HostListener,
  input,
  Input,
  output,
  Output,
  signal,
  OnInit,
  OnDestroy,
  inject,
  computed,
  effect,
} from '@angular/core';
import { toast } from 'ngx-sonner';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';
import { AccountRefreshService } from '../../../services/account-refresh.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-account-menu',
  imports: [],
  templateUrl: './account-menu.html',
  styles: ``,
})
export class AccountMenu implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private accountRefreshService = inject(AccountRefreshService);
  profileClick = output<void>();
  signOutClick = output<void>();

  isOpen = false;
  private subscription?: Subscription;

  userSession = signal<any>(null);
  isLoading = signal<boolean>(true);

  userName = computed(() => {
    const session = this.userSession();
    return session?.data?.user?.name || '';
  });

  userEmail = computed(() => {
    const session = this.userSession();
    return session?.data?.user?.email || '';
  });

  userAvatar = computed(() => {
    const session = this.userSession();
    return session?.data?.user?.image || '';
  });

  userInitials = computed(() => {
    const name = this.userName();
    if (!name) return '';

    return name
      .split(' ')
      .map((namePart: string) => namePart.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });

  constructor(private router: Router, public themeService: ThemeService) {
    effect(() => {
      this.loadUserSession();
    });
  }

  ngOnInit() {
    this.loadUserSession();

    this.subscription = this.accountRefreshService.refresh$.subscribe(() => {
      this.loadUserSession();
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private async loadUserSession() {
    try {
      this.isLoading.set(true);
      const session = await this.authService.getSession();
      this.userSession.set(session);
    } catch (error) {
      console.error('Erro ao carregar sessão do usuário:', error);
      this.userSession.set(null);
    } finally {
      this.isLoading.set(false);
    }
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

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
