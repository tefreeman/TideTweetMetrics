import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
  CdkDragHandle,
} from '@angular/cdk/drag-drop';
import { AsyncPipe, CommonModule, NgFor } from '@angular/common';
import { Component, HostListener, OnInit, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import {
  Observable,
  Subscription,
  distinctUntilChanged,
  first,
  map,
  switchMap,
} from 'rxjs';
import { GraphCardComponent } from '../../../components/graph-components/graph-card/graph-card.component';
import { GraphGridComponent } from '../../../components/graph-components/graph-grid/graph-grid.component';
import { CardGridComponent } from '../../../components/stat-components/card-grid/card-grid.component';
import { StatCardComponent } from '../../../components/stat-components/stat-card/stat-card.component';
import { I_GridRequestEntryWithName } from '../../../core/interfaces/pages-interface';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { DashboardPageManagerService } from '../../../core/services/dashboard-page-manager.service';
import { DisplayableProviderService } from '../../../core/services/displayables/displayable-provider.service';
import { EditModeService } from '../../../core/services/edit-mode.service';
import { GridEditModeService } from '../../../core/services/grid-edit-mode.service';
import { MetricService } from '../../../core/services/metrics/metric.service';

/**
 * Represents the DashboardComponent class.
 * This component is responsible for displaying the dashboard view.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NgFor,
    StatCardComponent,
    AsyncPipe,
    MaterialModule,
    GraphCardComponent,
    CommonModule,
    CdkDrag,
    CdkDropList,
    CdkDragHandle,
    AsyncPipe,
    CardGridComponent,
    GraphGridComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  providers: [MetricService],
})
export class DashboardComponent implements OnInit {
  _displayProcessor = inject(DisplayableProviderService);
  editModeService: EditModeService = inject(EditModeService);
  _displayableProviderService: DisplayableProviderService = inject(
    DisplayableProviderService
  );
  _dashboardPageManagerService: DashboardPageManagerService = inject(
    DashboardPageManagerService
  );
  gridEditModeService: GridEditModeService = inject(GridEditModeService);
  gridEditMode: Observable<boolean> = this.gridEditModeService.getEditMode();
  editMode: Observable<boolean> = this.editModeService.getEditMode();

  pageName$: Observable<string>;
  grids$: Observable<I_GridRequestEntryWithName[]>;
  gridsSubscription: Subscription | undefined;
  localGrids: I_GridRequestEntryWithName[] = [];
  minColSize = '35rem';
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.updateMinColSize();
  }

  /**
   * Constructs a new instance of the DashboardComponent class.
   * @param route - The ActivatedRoute instance.
   * @param snackBar - The MatSnackBar instance.
   */
  constructor(private route: ActivatedRoute, private snackBar: MatSnackBar) {
    this.pageName$ = this.route.params.pipe(
      map((params) => {
        return params['page'];
      }, distinctUntilChanged())
    );

    this.grids$ = this.pageName$.pipe(
      switchMap((pageName) =>
        this._displayableProviderService.getGrids$(pageName)
      )
    );

    this.gridsSubscription = this.grids$.subscribe((grids) => {
      this.localGrids = grids;
    });
  }

  /**
   * Initializes the component.
   */
  ngOnInit() {
    this.updateMinColSize();
  }

  /**
   * Checks if the grids are empty.
   * @returns An Observable that emits a boolean indicating if the grids are empty.
   */
  isEmpty$(): Observable<boolean> {
    return this.grids$.pipe(map((stats) => stats.length === 0));
  }
  updateMinColSize() {
    const screenWidth = window.innerWidth - 32;
    this.minColSize = screenWidth < 640 ? `${screenWidth}px` : '35rem';
  }
  /**
   * Opens a snackbar with the specified message.
   * @param message - The message to display in the snackbar.
   */
  openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000, // Duration in milliseconds after which the snackbar will auto-dismiss.
      horizontalPosition: 'center', // Change as needed.
      verticalPosition: 'bottom', // Change as needed.
    });
  }

  /**
   * Cleans up resources before the component is destroyed.
   */
  ngOnDestroy() {
    this.gridsSubscription?.unsubscribe();
  }

  /**
   * Handles the drop event of a CdkDrag.
   * @param event - The CdkDragDrop event.
   */
  drop(event: CdkDragDrop<I_GridRequestEntryWithName[]>) {
    console.log(event);

    moveItemInArray(this.localGrids, event.previousIndex, event.currentIndex);
    for (let i = 0; i < this.localGrids.length; i++) {
      this.localGrids[i].order = i;
    }
    this.pageName$.pipe(first()).subscribe((pageName) => {
      this._dashboardPageManagerService.updateGrids$(pageName, this.localGrids);
    });
  }
}
