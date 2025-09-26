import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DecimalPipe, CommonModule } from '@angular/common';
import { toast } from 'ngx-sonner';
import { AuthService } from '../../../services/auth.service';
import { InputComponent } from '../../../components/ui/input/input';
import { ButtonComponent } from '../../../components/ui/button/button';

interface UserForm {
  name: FormControl;
  email: FormControl;
  password: FormControl;
}

interface OrganizationForm {
  organizationName: FormControl;
  plan: FormControl;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, DecimalPipe, InputComponent, ButtonComponent],
  templateUrl: './register.html',
})
export class Register {
  currentStep = 1;
  totalSteps = 2;

  userForm!: FormGroup<UserForm>;
  organizationForm!: FormGroup<OrganizationForm>;

  plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$29',
      period: '/month',
      features: ['Up to 5 users', 'Email support', 'Basic reports'],
      popular: false,
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '$79',
      period: '/month',
      features: ['Up to 25 users', 'Priority support', 'Advanced reports', 'Integrations'],
      popular: true,
    },
  ];

  constructor(private authService: AuthService, private router: Router) {
    this.userForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(2)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });

    this.organizationForm = new FormGroup({
      organizationName: new FormControl('', [Validators.required, Validators.minLength(2)]),
      plan: new FormControl('professional', [Validators.required]),
    });
  }

  nextStep() {
    if (this.currentStep === 1 && this.userForm.valid) {
      this.currentStep = 2;
    }
  }

  previousStep() {
    if (this.currentStep === 2) {
      this.currentStep = 1;
    }
  }

  selectPlan(planId: string) {
    this.organizationForm.patchValue({ plan: planId });
  }

  async submit() {
    if (this.userForm.valid && this.organizationForm.valid) {
      try {
        const userData = this.userForm.value;
        const orgData = this.organizationForm.value;

        const result = await this.authService.signUpWithOrganization(
          userData.email!,
          userData.password!,
          userData.name!,
          orgData.organizationName!
        );

        if (result.user.data?.user) {
          toast.success('Conta criada com sucesso!');
          this.router.navigate(['/']);
        } else {
          toast.error('Erro ao criar conta');
        }
      } catch (error) {
        toast.error('Erro ao criar conta');
      }
    }
  }

  getStepProgress() {
    return (this.currentStep / this.totalSteps) * 100;
  }
}
