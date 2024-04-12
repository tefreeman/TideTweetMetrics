import { Routes } from '@angular/router';
import { RegisterComponent } from './views/account/register/register.component';
import { MainViewComponent } from './views/main-view/main-view.component';
import { LoginComponent } from './views/account/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { HomeComponent } from './views/home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'dashboard', component: MainViewComponent, canActivate: [AuthGuard],
    children: [{
      path: 'home',
      component: DashboardComponent,
      canActivate: [AuthGuard],
      outlet: 'dashboard'
    
    }]
  },
  {path: 'register', component: RegisterComponent},
  {path: 'login', component: LoginComponent},
];
