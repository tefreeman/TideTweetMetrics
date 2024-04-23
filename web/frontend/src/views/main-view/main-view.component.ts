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
/**
 * Represents the main view component of the application.
 */
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
  /**
   * Represents the edit mode service.
   */
  editModeService: EditModeService = inject(EditModeService);

  /**
   * Represents the display request manager service.
   */
  displayRequestManagerService: DisplayRequestManagerService = inject(
    DisplayRequestManagerService
  );

  /**
   * Represents the dashboard page manager service.
   */
  dashboardPageManagerService: DashboardPageManagerService = inject(
    DashboardPageManagerService
  );

  /**
   * Represents the subscription to the page names.
   */
  pageSubscription: Subscription | undefined;

  /**
   * Represents the static navigation routes.
   */
  staticNavRoutes = [
    { name: 'Home', route: 'home' },
    { name: 'Analysis Board', route: 'analysis-board' }, //Add more here as needed
    { name: 'Optimizer', route: 'optimizer' },
    { name: 'My Profile', route: 'my-profile' },
  ];

  /**
   * Represents the dynamic navigation routes.
   */
  dynamicNavRoutes: { name: string; route: string }[] = [];

  /**
   * Represents the expanded state of the menu.
   */
  public isExpanded = false;

  /**
   * Represents the edit mode observable.
   */
  editMode: Observable<boolean> = this.editModeService.getEditMode();

  /**
   * Represents the grid edit mode service.
   */
  gridEditModeService: GridEditModeService = inject(GridEditModeService);

  /**
   * Represents the grid edit mode observable.
   */
  gridEditMode: Observable<boolean> = this.gridEditModeService.getEditMode();

  constructor(
    /**
     * Represents the authentication service.
     */
    private authService: AuthService,

    /**
     * Represents the dialog service.
     */
    public dialog: MatDialog,

    /**
     * Represents the snackbar service.
     */
    private snackBar: MatSnackBar
  ) { }

  /**
   * Initializes the component.
   */
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

  /**
   * Cleans up the component.
   */
  ngOnDestroy(): void {
    this.pageSubscription?.unsubscribe();
  }

  /**
   * Toggles the menu expansion state.
   */
  public toggleMenu() {
    this.isExpanded = !this.isExpanded;
  }

  /**
   * Signs out the user.
   */
  signout() {
    this.authService.signout();
  }

  /**
   * Adds a new board.
   */
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

  /**
   * Toggles the edit mode.
   */
  toggleEditMode() {
    this.editModeService.toggleEditMode();
  }

  /**
   * Toggles the grid edit mode.
   */
  toggleGridEditMode() {
    this.gridEditModeService.toggleEditMode();
  }

  /**
   * Updates the page.
   */
  update() {
    this.dashboardPageManagerService.savePage();
    this.openSnackBar('Page has been saved.');
  }

  /**
   * Opens a snackbar with the given message.
   * @param message - The message to display in the snackbar.
   */
  openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000, // Duration in milliseconds after which the snackbar will auto-dismiss.
      horizontalPosition: 'center', // Change as needed.
      verticalPosition: 'bottom', // Change as needed.
    });
  }
}
