import { Routes } from '@angular/router';
import { RegisterComponent } from './views/account/register/register.component';
import { MainViewComponent } from './views/main-view/main-view.component';
import { LoginComponent } from './views/account/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { HomeComponent } from './views/home/home.component';
import { DashboardComponent } from './views/main-view/dashboard/dashboard.component';
import { GraphBuilderComponent } from './views/main-view/graph-builder/graph-builder.component';
import { OptimizerComponent } from './views/main-view/optimizer/optimizer.component';
import { MyProfileComponent } from './views/main-view/my-profile/my-profile.component';
import { UnauthorizedComponent } from './views/unauthorized/unauthorized.component';
import { StartComponent } from './views/main-view/start/start.component';
import { startGuard } from './core/guards/start.guard';

export const routes: Routes = [
  {
    path: 'unauthorized',
    component: UnauthorizedComponent
    },
  {path: '', component: HomeComponent},
  {path: 'dashboard', component: MainViewComponent, canActivate: [AuthGuard],
    children: [
      {
        path: '', 
        redirectTo: 'home', //redirects to default child route if no other specified. 
        pathMatch: 'full' 
      },
      {
        path: 'start',
        component: StartComponent,
        canActivate: []
      },
      {
      path: 'home',
      component: DashboardComponent,
      canActivate: [startGuard],
      },
      {
      path: 'graph-builder',
      component: GraphBuilderComponent,
      canActivate: [startGuard],
      },
      {
      path: 'optimizer',
      component: OptimizerComponent,
      canActivate: [startGuard],
      },
      {
      path: 'my-profile',
      component: MyProfileComponent,
      canActivate: [startGuard],
      }
  ]
  },
  {path: 'register', component: RegisterComponent},
  {path: 'login', component: LoginComponent},
];
