import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { InputComponent } from '../../../components/ui/input/input';
import { ButtonComponent } from '../../../components/ui/button/button';
import { toast } from 'ngx-sonner';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroClockSolid,
  heroComputerDesktopSolid,
  heroHomeSolid,
  heroLockClosedSolid,
  heroShieldCheckSolid,
  heroUserSolid,
} from '@ng-icons/heroicons/solid';

interface ProfileForm {
  name: FormControl;
}

interface PasswordForm {
  currentPassword: FormControl;
  newPassword: FormControl;
  confirmPassword: FormControl;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.html',
  imports: [ReactiveFormsModule, CommonModule, InputComponent, ButtonComponent, NgIcon],
  providers: [
    provideIcons({
      heroUserSolid,
      heroLockClosedSolid,
      heroShieldCheckSolid,
      heroClockSolid,
      heroComputerDesktopSolid,
      heroHomeSolid,
    }),
  ],
})
export class Settings implements OnInit {
  profileForm!: FormGroup<ProfileForm>;
  passwordForm!: FormGroup<PasswordForm>;

  isUpdatingProfile = false;
  isChangingPassword = false;

  sessions: any[] = [];
  currentSessionId: string = '';
  private authService = inject(AuthService);

  constructor() {
    this.authService.getSession().subscribe((res) => {
      if (!res?.data) return;
      this.profileForm?.patchValue({
        name: res.data.user.name,
      });
    });
  }

  ngOnInit() {
    this.initializeForms();
    this.loadSessions();
  }

  private initializeForms() {
    this.profileForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
    });

    this.passwordForm = new FormGroup(
      {
        currentPassword: new FormControl('', [Validators.required]),
        newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
        confirmPassword: new FormControl('', [Validators.required]),
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const form = control as FormGroup;
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
    } else if (confirmPassword?.hasError('mismatch')) {
      confirmPassword.setErrors(null);
    }

    return null;
  }

  async onUpdateProfile() {
    if (this.profileForm.invalid) return;

    this.isUpdatingProfile = true;

    try {
      const { name } = this.profileForm.value;
      const result = await this.authService.updateUser(name, '');

      if (result.error) {
        throw new Error(result.error.message || 'Failed to update profile');
      }

      toast.success('Profile updated successfully!');
      this.profileForm.markAsPristine();
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Error updating profile. Please try again.');
    } finally {
      this.isUpdatingProfile = false;
    }
  }

  async onChangePassword() {
    if (this.passwordForm.invalid) return;

    this.isChangingPassword = true;

    try {
      const { currentPassword, newPassword } = this.passwordForm.value;
      const result = await this.authService.changePassword(currentPassword, newPassword);

      if (result.error) {
        throw new Error(result.error.message || 'Failed to change password');
      }

      toast.success('Password changed successfully!');
      this.passwordForm.reset();
    } catch (error: any) {
      console.error('Password change error:', error);
      toast.error(error.message || 'Error changing password. Please check your current password.');
    } finally {
      this.isChangingPassword = false;
    }
  }

  getPasswordError(): string {
    const newPassword = this.passwordForm.get('newPassword');
    if (newPassword?.invalid && newPassword?.touched) {
      if (newPassword.errors?.['required']) {
        return 'New password is required';
      }
      if (newPassword.errors?.['minlength']) {
        return 'Password must be at least 6 characters';
      }
    }
    return '';
  }

  getConfirmPasswordError(): string {
    const confirmPassword = this.passwordForm.get('confirmPassword');
    if (confirmPassword?.invalid && confirmPassword?.touched) {
      if (confirmPassword.errors?.['required']) {
        return 'Password confirmation is required';
      }
      if (confirmPassword.errors?.['mismatch']) {
        return 'Passwords do not match';
      }
    }
    return '';
  }

  private async loadSessions() {
    try {
      const result = await this.authService.getSessions();
      if (result.data) {
        this.sessions = result.data;
        if (this.sessions.length > 0) {
          this.currentSessionId = this.sessions[0].id;
        }
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getBrowserInfo(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown Browser';
  }

  async revokeSession(sessionId: string) {
    try {
      await this.authService.revokeSession(sessionId);
      toast.success('Session revoked successfully!');
      this.loadSessions();
    } catch (error: any) {
      toast.error('Error revoking session. Please try again.');
    }
  }
}
