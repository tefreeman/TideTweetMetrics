import { Routes } from '@angular/router';
import { RegisterComponent } from './account/register/register.component';
import { MainViewComponent } from './main-view/main-view.component';
import { LoginComponent } from './account/login/login.component';
import { AuthGuard } from './auth.guard';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'dashboard', component: MainViewComponent, canActivate: [AuthGuard]},
  {path: 'register', component: RegisterComponent},
  {path: 'login', component: LoginComponent},
];
