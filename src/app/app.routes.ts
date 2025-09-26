import { Routes } from '@angular/router';
import { NotFound } from './pages/not-found/not-found';
import { Dashboard } from './pages/(protect)/dashboard/dashboard';
import { Settings } from './pages/(protect)/settings/settings';
import { Login } from './pages/(auth)/login/login';
import { Register } from './pages/(auth)/register/register';
import { AuthGuard } from './services/auth-guard.service';
import { ProtectLayout } from './components/layout/protect-layout/protect-layout';

export const routes: Routes = [
  { path: 'login', component: Login, title: 'Login' },
  { path: 'register', component: Register, title: 'Register' },
  {
    path: '',
    component: ProtectLayout,
    children: [
      {
        path: '',
        component: Dashboard,
        canActivate: [AuthGuard],
        title: 'Dashboard',
      },
      {
        path: 'dashboard',
        component: Dashboard,
        canActivate: [AuthGuard],
        title: 'Dashboard',
      },
      {
        path: 'settings',
        component: Settings,
        title: 'Configurações',
        canActivate: [AuthGuard],
      },
    ],
  },
  { path: '**', component: NotFound, title: 'NotFound' },
];
