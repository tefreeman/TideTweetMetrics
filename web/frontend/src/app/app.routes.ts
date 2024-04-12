import { Routes } from '@angular/router';
import { RegisterComponent } from './views/account/register/register.component';
import { MainViewComponent } from './views/main-view/main-view.component';
import { LoginComponent } from './views/account/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { HomeComponent } from './views/home/home.component';
import { DashboardComponent } from './views/main-view/dashboard/dashboard.component';
import { GraphBuilderComponent } from './views/main-view/graph-builder/graph-builder.component';
import { OptimizerComponent } from './views/main-view/optimizer/optimizer.component';

export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'dashboard', component: MainViewComponent, canActivate: [AuthGuard],
    children: [
      {
        path: '', 
        redirectTo: 'home', //redirects to default child route if no other specified. 
        pathMatch: 'full' 
      },
      {
      path: 'home',
      component: DashboardComponent,
      canActivate: [AuthGuard],
      },
      {
      path: 'graph-builder',
      component: GraphBuilderComponent,
      canActivate: [AuthGuard],
      },
      {
      path: 'optimizer',
      component: OptimizerComponent,
      canActivate: [AuthGuard],
      }
  ]
  },
  {path: 'register', component: RegisterComponent},
  {path: 'login', component: LoginComponent},
];
