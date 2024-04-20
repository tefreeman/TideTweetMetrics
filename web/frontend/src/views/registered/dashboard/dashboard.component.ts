import { NgFor, NgIf,} from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { inject } from '@angular/core';
import { Observable, Subject, Subscription, catchError, debounceTime, filter, forkJoin, fromEvent, map, of, switchMap, takeUntil, tap,} from 'rxjs';
import { IDisplayableData, I_DisplayableRequest } from '../../../core/interfaces/displayable-interface';
import { T_DisplayableDataType } from "../../../core/interfaces/displayable-data-interface";
import { MetricService } from '../../../core/services/metric.service';
import { DisplayableProviderService } from '../../../core/services/displayable-provider.service';
import { AsyncPipe } from '@angular/common';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { CommonModule } from '@angular/common';
import {CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray} from '@angular/cdk/drag-drop';
import { StatCardComponent } from '../../../displayable-components/stat-card/stat-card.component';
import { BarChartComponent } from '../../../displayable-components/bar-chart/bar-chart.component';
import { GraphCardComponent } from '../../../displayable-components/graph-card/graph-card.component';
import { EditModeService } from '../../../core/services/edit-mode.service';
import { MatDialog } from '@angular/material/dialog';
import { AddGraphComponent } from '../../../displayable-components/add-graph/add-graph.component';
import { AddCardComponent } from '../../../displayable-components/add-card/add-card.component';
import { MoveableGridTilesService } from '../../../core/services/moveable-grid-tiles.service';
import { CardGridComponent } from '../../../displayable-components/card-grid/card-grid.component';
import { GraphGridComponent } from '../../../displayable-components/graph-grid/graph-grid.component';
import { ActivatedRoute } from '@angular/router';
import { DisplayRequestManagerService } from '../../../core/services/display-request-manager.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgFor, StatCardComponent, BarChartComponent, AsyncPipe, MaterialModule, GraphCardComponent, CommonModule, CdkDrag, CdkDropList, AsyncPipe, CardGridComponent, GraphGridComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  providers: [MetricService],

})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {

  
  _displayProcessor = inject(DisplayableProviderService);
  editModeService: EditModeService = inject(EditModeService);
  _displayRequestManagerService: DisplayRequestManagerService = inject(DisplayRequestManagerService);
  public cardGrid: MoveableGridTilesService = new MoveableGridTilesService();
  public graphGrid: MoveableGridTilesService = new MoveableGridTilesService();
  editMode: Observable<boolean> = this.editModeService.getEditMode();
  subscription: any;
  pageName$: Observable<string>;
  grids$: Observable<{name: string, type: 'stat' | 'graph', order: number}[]>
  routeParamSubscription: Subscription | undefined;
  gridsSubscription: Subscription | undefined;

  
  
  constructor(private route: ActivatedRoute, private cdr: ChangeDetectorRef) {
    this.pageName$ = this.route.params.pipe(
      map(params => {
          console.log(params);
          return params['page'];
      })
  );

  const grids$ = this.pageName$.pipe(
      switchMap(pageName =>
          forkJoin({
              cards: this._displayRequestManagerService.getDisplayNamesWithOrder$(pageName, 'stat'),
              graphs: this._displayRequestManagerService.getDisplayNamesWithOrder$(pageName, 'graph')
          })
      ),
      map(({cards, graphs}) => {
          // Ensuring each item has `type` explicitly set as 'stat' or 'graph'
          const statGrids = cards.map(item => ({ ...item, type: 'stat' })) as { name: string; type: "stat"; order: number; }[];
          const graphGrids = graphs.map(item => ({ ...item, type: 'graph' })) as { name: string; type: "graph"; order: number; }[];
          return { statGrids, graphGrids };
      }),
      tap(({ statGrids, graphGrids }) => {
          console.log(statGrids, graphGrids); // Log the grids for debugging.
      }),
      catchError(error => {
          console.error("Failed to load display names with order", error);
          return of({ statGrids: [], graphGrids: [] }); // Return empty arrays on error.
      })
  );

      // Assuming grids$ is an Observable with a suitable structure
      this.grids$ = grids$.pipe(
        map(({ statGrids, graphGrids }) => 
          [...statGrids, ...graphGrids].sort((a, b) => b.order - a.order)
        )
      );

}

ngOnInit() {
}

  ngOnDestroy(): void {
  this.routeParamSubscription?.unsubscribe();
  }

  ngAfterViewInit() {
    // Initial subscription
  
  }
  
  toggleEditMode(){
    this.editModeService.toggleEditMode();
  }

  update(){
    this._displayRequestManagerService.saveRequests();
  }

  isEmpty$(): Observable<boolean> {
    return this.grids$.pipe(map(stats => stats.length === 0));
  }
  



}
