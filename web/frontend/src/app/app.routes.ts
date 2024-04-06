import { Routes } from '@angular/router';
import { AppRegisterComponent } from './app-register/app-register.component';
import { MainViewComponent } from './main-view/main-view.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  {path: 'dashboard', component: MainViewComponent, canActivate: [AuthGuard]},
  {path: 'register', component: AppRegisterComponent},
  {path: 'login', component: LoginComponent},
];
