import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MaterialModule } from '../../core/modules/material/material.module';
import { NgFor } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { DashboardComponent } from '../registered/dashboard/dashboard.component';
import { EditModeService } from '../../core/services/edit-mode.service';
import { DisplayRequestManagerService } from '../../core/services/display-request-manager.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AddBoardComponent } from '../registered/add-board/add-board.component';
import { DashboardPageManagerService } from '../../core/services/dashboard-page-manager.service';

@Component({
    selector: 'app-main-view',
    standalone: true,
    templateUrl: './main-view.component.html',
    styleUrl: './main-view.component.scss',
    imports: [MaterialModule, RouterLink, RouterOutlet, DashboardComponent,NgFor]
})
export class MainViewComponent implements OnInit, OnDestroy{
  editModeService: EditModeService = inject(EditModeService);
  displayRequestManagerService: DisplayRequestManagerService = inject(DisplayRequestManagerService);
  dashboardPageManagerService: DashboardPageManagerService = inject(DashboardPageManagerService);
  pageSubscription: Subscription | undefined;

  staticNavRoutes = [
    {name: "Home", route: "home"},
    {name:'Analysis Board', route:'analysis-board'},  //Add more here as needed
    {name:'Optimizer', route:'optimizer'},
    {name:'My Profile', route:'my-profile'},
  ];

  dynamicNavRoutes: {name: string; route: string}[] = [];


  public isExpanded = false;
  constructor(private authService: AuthService, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.pageSubscription = this.dashboardPageManagerService.getPageNames$().subscribe((pages) => {
      const newPages = pages.map((page) => ({ name: page.charAt(0).toUpperCase() + page.slice(1), route: page }))
      .filter((page) => page.name !== 'Home');
      this.dynamicNavRoutes = newPages;
    });
  }

  ngOnDestroy(): void {
      this.pageSubscription?.unsubscribe();
  }

    public toggleMenu() {
      this.isExpanded = !this.isExpanded;
    }

    signout(){
      this.authService.signout();
    }
  

  addBoard(){
    const addBoardRef = this.dialog.open(AddBoardComponent, {
  
    });

    addBoardRef.afterClosed().subscribe(result => {
      if (result) {
        if (typeof result === 'string') {
       this.dashboardPageManagerService.addNewPage$(result);
        }
      }
    });
    }
  
}
