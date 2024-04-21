import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { AsyncPipe, CommonModule, NgFor } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
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
import { BarChartComponent } from '../../../components/graph-components/bar-chart/bar-chart.component';
import { GraphCardComponent } from '../../../components/graph-components/graph-card/graph-card.component';
import { GraphGridComponent } from '../../../components/graph-components/graph-grid/graph-grid.component';
import { CardGridComponent } from '../../../components/stat-components/card-grid/card-grid.component';
import { StatCardComponent } from '../../../components/stat-components/stat-card/stat-card.component';
import { I_GridRequestEntryWithName } from '../../../core/interfaces/pages-interface';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { DashboardPageManagerService } from '../../../core/services/dashboard-page-manager.service';
import { DisplayableProviderService } from '../../../core/services/displayables/displayable-provider.service';
import { EditModeService } from '../../../core/services/edit-mode.service';
import { MetricService } from '../../../core/services/metrics/metric.service';

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
export class DashboardComponent implements OnInit {
  _displayProcessor = inject(DisplayableProviderService);
  editModeService: EditModeService = inject(EditModeService);
  _displayableProviderService: DisplayableProviderService = inject(
    DisplayableProviderService
  );
  _dashboardPageManagerService: DashboardPageManagerService = inject(
    DashboardPageManagerService
  );

  editMode: Observable<boolean> = this.editModeService.getEditMode();
  gridEditMode: boolean = false;

  pageName$: Observable<string>;
  grids$: Observable<I_GridRequestEntryWithName[]>;
  gridsSubscription: Subscription | undefined;
  localGrids: I_GridRequestEntryWithName[] = [];

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

  ngOnInit() {}

  toggleEditMode() {
    this.editModeService.toggleEditMode();
  }

  toggleGridEditMode() {
    this.gridEditMode = !this.gridEditMode;
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

  ngOnDestroy() {
    this.gridsSubscription?.unsubscribe();
  }
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
