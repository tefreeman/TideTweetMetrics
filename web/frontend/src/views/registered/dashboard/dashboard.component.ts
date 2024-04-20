import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { AsyncPipe, CommonModule, NgFor } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import {
  Observable,
  Subscription,
  distinctUntilChanged,
  map,
  switchMap,
} from 'rxjs';
import { I_GridRequestEntryWithName } from '../../../core/interfaces/pages-interface';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { DashboardPageManagerService } from '../../../core/services/dashboard-page-manager.service';
import { DisplayRequestManagerService } from '../../../core/services/display-request-manager.service';
import { DisplayableProviderService } from '../../../core/services/displayable-provider.service';
import { EditModeService } from '../../../core/services/edit-mode.service';
import { MetricService } from '../../../core/services/metric.service';
import { MoveableGridTilesService } from '../../../core/services/moveable-grid-tiles.service';
import { BarChartComponent } from '../../../displayable-components/bar-chart/bar-chart.component';
import { CardGridComponent } from '../../../displayable-components/card-grid/card-grid.component';
import { GraphCardComponent } from '../../../displayable-components/graph-card/graph-card.component';
import { GraphGridComponent } from '../../../displayable-components/graph-grid/graph-grid.component';
import { StatCardComponent } from '../../../displayable-components/stat-card/stat-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NgFor,
    StatCardComponent,
    BarChartComponent,
    AsyncPipe,
    MaterialModule,
    GraphCardComponent,
    CommonModule,
    CdkDrag,
    CdkDropList,
    AsyncPipe,
    CardGridComponent,
    GraphGridComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  providers: [MetricService],
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  _displayProcessor = inject(DisplayableProviderService);
  editModeService: EditModeService = inject(EditModeService);
  _displayRequestManagerService: DisplayRequestManagerService = inject(
    DisplayRequestManagerService
  );
  _displayableProviderService: DisplayableProviderService = inject(
    DisplayableProviderService
  );
  _dashboardPageManagerService: DashboardPageManagerService = inject(
    DashboardPageManagerService
  );
  public cardGrid: MoveableGridTilesService = new MoveableGridTilesService();
  public graphGrid: MoveableGridTilesService = new MoveableGridTilesService();
  editMode: Observable<boolean> = this.editModeService.getEditMode();
  subscription: any;
  pageName$: Observable<string>;
  grids$: Observable<I_GridRequestEntryWithName[]>;
  routeParamSubscription: Subscription | undefined;
  gridsSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {
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
  }

  ngOnInit() {}

  ngOnDestroy(): void {
    this.routeParamSubscription?.unsubscribe();
  }

  ngAfterViewInit() {
    // Initial subscription
  }

  toggleEditMode() {
    this.editModeService.toggleEditMode();
  }

  update() {
    this._dashboardPageManagerService.savePage();
    this.openSnackBar('Page has been saved.');
  }

  isEmpty$(): Observable<boolean> {
    return this.grids$.pipe(map((stats) => stats.length === 0));
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000, // Duration in milliseconds after which the snackbar will auto-dismiss.
      horizontalPosition: 'center', // Change as needed.
      verticalPosition: 'bottom', // Change as needed.
    });
  }
}
