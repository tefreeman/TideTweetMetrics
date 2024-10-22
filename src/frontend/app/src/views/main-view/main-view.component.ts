import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { Observable, Subscription, filter, map, switchMap } from 'rxjs';
import { MaterialModule } from '../../core/modules/material/material.module';
import { AuthService } from '../../core/services/auth.service';
import { DashboardPageManagerService } from '../../core/services/dashboard-page-manager.service';
import { DisplayRequestManagerService } from '../../core/services/displayables/display-request-manager.service';
import { EditModeService } from '../../core/services/edit-mode.service';
import { GridEditModeService } from '../../core/services/grid-edit-mode.service';
import { AddBoardComponent } from '../registered/add-board/add-board.component';
import { AddGridComponent } from '../registered/add-grid/add-grid.component';
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
    AddGridComponent,
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
    { name: 'Optimizer', route: 'optimizer' },
    { name: 'My Profile', route: 'my-profile' },
  ];

  allDefinedRoutes = [{ name: 'Home', route: 'home' }].concat(
    this.staticNavRoutes
  );
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
  isPage: boolean = false;
  pageName: string = '';
  pageNameCapitalized: string = '';
  sub: any;
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
    private snackBar: MatSnackBar,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}
  /**
   * Initializes the component.
   */
  ngOnInit(): void {
    this.handleRouteChange();
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

    this.sub = this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        switchMap((event: any) => {
          const urlTree = this.router.parseUrl(event.url);
          const segments = urlTree.root.children['primary'].segments;
          const lastSegment = segments[segments.length - 1]?.path;
          // Use isAPage$ to check if the last segment is a page
          return this.dashboardPageManagerService.isAPage$(lastSegment).pipe(
            map((isAPage) => ({
              isAPage,
              page: lastSegment,
            }))
          );
        })
      )
      .subscribe(({ isAPage, page }) => {
        this.editModeService.setEditMode(false);
        this.isPage = isAPage;
        this.pageName = page;
        this.pageNameCapitalized = page.charAt(0).toUpperCase() + page.slice(1);
      });
  }

  handleRouteChange() {
    this.evaluateCurrentRoute().subscribe(({ isAPage, page }) => {
      this.updatePageStatus(isAPage, page);
    });
  }

  updatePageStatus(isAPage: boolean, page: string) {
    this.isPage = isAPage;
    this.pageName = page;
    this.pageNameCapitalized = page.charAt(0).toUpperCase() + page.slice(1);
  }

  evaluateCurrentRoute() {
    // Ensuring the current route is evaluated even at component initialization
    const url = this.router.url;
    const urlTree = this.router.parseUrl(url);
    const segments = urlTree.root.children['primary']
      ? urlTree.root.children['primary'].segments
      : [];
    const lastSegment =
      segments.length > 0 ? segments[segments.length - 1].path : '';
    return this.dashboardPageManagerService.isAPage$(lastSegment).pipe(
      map((isAPage) => ({
        isAPage,
        page: lastSegment,
      }))
    );
  }

  /** fix the override
   * Checks if the given page is not part of static navigation routes.
   * @param pageName - The last part of the URL.
   * @returns `false` if the page is found in staticNavRoutes, otherwise `true`.
   */
  isDynamicRoute(pageName: string): boolean {
    const staticRoutesAndOne = this.staticNavRoutes.concat({
      name: 'Start',
      route: 'start',
    });
    const pageFound = staticRoutesAndOne.some(
      (route) => route.route === pageName
    );
    return !pageFound;
  }
  /**
   * Cleans up the component.
   */
  ngOnDestroy(): void {
    this.pageSubscription?.unsubscribe();
    this.sub?.unsubscribe();
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

  addGrid() {
    const addBoardRef = this.dialog.open(AddGridComponent, {});

    addBoardRef.afterClosed().subscribe((result) => {
      if (result) {
        if (typeof result['name'] === 'string') {
          if (result['type'] === 'graph' || result['type'] === 'metric') {
            this.dashboardPageManagerService
              .doesGridExist$(this.pageName, result['name'])
              .subscribe((exists) => {
                if (exists) {
                  this.openSnackBar('Grid already exists.');
                } else {
                  this.dashboardPageManagerService.createAndAddGridToEnd$(
                    this.pageName,
                    result['name'],
                    result['type']
                  );
                }
              });
          }
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

  getUnsavedChanges() {
    return this.dashboardPageManagerService.getUnsavedChanges();
  }

  cancel() {
    this.editModeService.setEditMode(false);
    this.dashboardPageManagerService.initPages(true);
  }
  /**
   * Updates the page.
   */
  update() {
    this.dashboardPageManagerService.savePage();
    this.editModeService.setEditMode(false);

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

  deleteBoard(page: string) {
    this.dashboardPageManagerService.deletePage$(page);
  }
}
