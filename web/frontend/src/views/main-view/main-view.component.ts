import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MaterialModule } from '../../core/modules/material/material.module';
import { NgFor } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { DashboardComponent } from '../registered/dashboard/dashboard.component';
import { EditModeService } from '../../core/services/edit-mode.service';

@Component({
    selector: 'app-main-view',
    standalone: true,
    templateUrl: './main-view.component.html',
    styleUrl: './main-view.component.scss',
    imports: [MaterialModule, RouterLink, RouterOutlet, DashboardComponent,NgFor]
})
export class MainViewComponent {
  editModeService: EditModeService = inject(EditModeService);
  constructor(private authService: AuthService) {}
  
  navRoutes = [
    {name:'Dashboard', route:'home'},
    {name:'Analysis Board', route:'analysis-board'},  //Add more here as needed
    {name:'Optimizer', route:'optimizer'},
    {name:'My Profile', route:'my-profile'},

  ];


    public isExpanded = false;

    public toggleMenu() {
      this.isExpanded = !this.isExpanded;
    }

    signout(){
      this.authService.signout();
    }

    toggleEditMode(){
      this.editModeService.toggleEditMode();
    }

    update(){
      
    }
}
