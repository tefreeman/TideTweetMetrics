import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { MaterialModule } from '../../core/modules/material/material.module';
import { AuthService } from '../../core/services/auth.service';
import { DashboardPageManagerService } from '../../core/services/dashboard-page-manager.service';
import { DisplayRequestManagerService } from '../../core/services/displayables/display-request-manager.service';
import { EditModeService } from '../../core/services/edit-mode.service';
import { GridEditModeService } from '../../core/services/grid-edit-mode.service';
import { AddBoardComponent } from '../registered/add-board/add-board.component';
import { DashboardComponent } from '../registered/dashboard/dashboard.component';
@Component({
  selector: 'app-main-view',
  standalone: true,
  templateUrl: './main-view.component.html',
  styleUrl: './main-view.component.scss',
  imports: [
    MaterialModule,
    RouterLink,
    RouterOutlet,
    DashboardComponent,
    NgFor,
    AsyncPipe,
    NgIf,
  ],
})
export class MainViewComponent implements OnInit, OnDestroy {
  editModeService: EditModeService = inject(EditModeService);
  displayRequestManagerService: DisplayRequestManagerService = inject(
    DisplayRequestManagerService
  );
  dashboardPageManagerService: DashboardPageManagerService = inject(
    DashboardPageManagerService
  );
  pageSubscription: Subscription | undefined;

  staticNavRoutes = [
    { name: 'Home', route: 'home' },
    { name: 'Analysis Board', route: 'analysis-board' }, //Add more here as needed
    { name: 'Optimizer', route: 'optimizer' },
    { name: 'My Profile', route: 'my-profile' },
  ];

  dynamicNavRoutes: { name: string; route: string }[] = [];

  public isExpanded = false;
  editMode: Observable<boolean> = this.editModeService.getEditMode();
  gridEditModeService: GridEditModeService = inject(GridEditModeService);
  gridEditMode: Observable<boolean> = this.gridEditModeService.getEditMode();

  constructor(
    private authService: AuthService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.pageSubscription = this.dashboardPageManagerService
      .getPageNames$()
      .subscribe((pages) => {
        const newPages = pages
          .map((page) => ({
            name: page.charAt(0).toUpperCase() + page.slice(1),
            route: page,
          }))
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

  signout() {
    this.authService.signout();
  }

  addBoard() {
    const addBoardRef = this.dialog.open(AddBoardComponent, {});

    addBoardRef.afterClosed().subscribe((result) => {
      if (result) {
        if (typeof result === 'string') {
          this.dashboardPageManagerService.addNewPage$(result);
        }
      }
    });
  }

  toggleEditMode() {
    this.editModeService.toggleEditMode();
  }

  toggleGridEditMode() {
    this.gridEditModeService.toggleEditMode();
  }

  update() {
    this.dashboardPageManagerService.savePage();
    this.openSnackBar('Page has been saved.');
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000, // Duration in milliseconds after which the snackbar will auto-dismiss.
      horizontalPosition: 'center', // Change as needed.
      verticalPosition: 'bottom', // Change as needed.
    });
  }
}
