import { Component } from '@angular/core';
import { DashboardComponent } from "./dashboard/dashboard.component";
import { RouterLink, RouterOutlet } from '@angular/router';
import { MaterialModule } from '../../core/modules/material/material.module';
import { NgFor } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-main-view',
    standalone: true,
    templateUrl: './main-view.component.html',
    styleUrl: './main-view.component.scss',
    imports: [MaterialModule, RouterLink, RouterOutlet, DashboardComponent,NgFor]
})
export class MainViewComponent {

  constructor(private authService: AuthService) {}
  
  navRoutes = [
    {name:'Dashboard', route:'home'},
    {name:'Graph Builder', route:'graph-builder'},  //Add more here as needed
    {name:'Optimizer', route:'optimizer'}

  ];


    public isExpanded = false;

    public toggleMenu() {
      this.isExpanded = !this.isExpanded;
    }

    signout(){
      this.authService.signout();
    }
}
