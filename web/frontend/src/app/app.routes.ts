import { Routes } from '@angular/router';
import { UnauthorizedComponent } from '../views/unregistered/unauthorized/unauthorized.component';
import { HomeComponent } from '../views/unregistered/home/home.component';
import { MainViewComponent } from '../views/main-view/main-view.component';
import { AuthGuard } from '../core/guards/auth.guard';
import { StartComponent } from '../views/registered/start/start.component';
import { DashboardComponent } from '../views/registered/dashboard/dashboard.component';
import { startGuard } from '../core/guards/start.guard';
import { GraphBuilderComponent } from '../views/registered/graph-builder/graph-builder.component';
import { OptimizerComponent } from '../views/registered/optimizer/optimizer.component';
import { MyProfileComponent } from '../views/registered/my-profile/my-profile.component';
import { RegisterComponent } from '../views/unregistered/register/register.component';
import { LoginComponent } from '../views/unregistered/login/login.component';
import { AnalysisBoardComponent } from '../views/registered/analysis-board/analysis-board.component';
import { dashboardGuard } from '../core/guards/dashboard.guard';
import { DebugComponent } from '../views/debug/debug.component';

export const routes: Routes = [
  {
    path: 'unauthorized',
    component: UnauthorizedComponent
    },
  {path: '', component: HomeComponent},
  {path: 'debug', component: DebugComponent},
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
      path: 'analysis-board',
      component: AnalysisBoardComponent,
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
      },
      {
        path: ':page', // Dynamic route, `:page` can be any string.
        component: DashboardComponent, // A new component to handle dynamic pages.
        canActivate: [startGuard, dashboardGuard],
      }
  ]
  },
  {path: 'register', component: RegisterComponent},
  {path: 'login', component: LoginComponent},
];
