import { Routes } from '@angular/router';
import { AppRegisterComponent } from './app-register/app-register.component';
import { MainViewComponent } from './main-view/main-view.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  {path: '', component: MainViewComponent},
  {path: 'register', component: AppRegisterComponent},
  {path: 'login', component: LoginComponent},
];
