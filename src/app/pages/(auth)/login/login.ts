import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { AuthService } from '../../../services/auth.service';
import { InputComponent } from '../../../components/ui/input/input';
import { ButtonComponent } from '../../../components/ui/button/button';

interface LoginForm {
  email: FormControl;
  password: FormControl;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './login.html',
})
export class Login {
  loginForm!: FormGroup<LoginForm>;

  constructor(private authService: AuthService, private router: Router) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });
  }

  async submit() {
    const session = await this.authService.signIn(
      this.loginForm.value.email,
      this.loginForm.value.password
    );
    if (session.data?.user) {
      toast.success('Login realizado com sucesso');

      this.router.navigate(['/']);
    } else {
      toast.error('Senha ou email inválidos');
    }
  }
}
