import { NgFor, NgIf,} from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { inject } from '@angular/core';
import { Observable, Subject, Subscription, catchError, debounceTime, filter, forkJoin, fromEvent, map, of, switchMap, takeUntil, tap,} from 'rxjs';
import { IDisplayableStats, I_DisplayableRequest, T_DisplayableDataType } from '../../../core/interfaces/displayable-interface';
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

  @ViewChildren('statcard', {read: ElementRef}) statCards!: QueryList<any>;
  
  _displayProcessor = inject(DisplayableProviderService);
  editModeService: EditModeService = inject(EditModeService);
  _displayRequestManagerService: DisplayRequestManagerService = inject(DisplayRequestManagerService);
  public cardGrid: MoveableGridTilesService = new MoveableGridTilesService();
  public graphGrid: MoveableGridTilesService = new MoveableGridTilesService();
  editMode: Observable<boolean> = this.editModeService.getEditMode();
  subscription: any;

  pageName$: Observable<string>;

  statGrids$: Observable<{name: string, type: 'stat' | 'graph'}[]>
  graphGrids$: Observable<{name: string, type: 'stat' | 'graph'}[]>



  routeParamSubscription: Subscription | undefined;
  gridsSubscription: Subscription | undefined;

  
  constructor(private route: ActivatedRoute, private cdr: ChangeDetectorRef) {
    this.pageName$ = this.route.params.pipe(map(params => {
      console.log(params);
      return params['page']
    }));

    const grids$ = this.pageName$.pipe(
      switchMap(pageName =>
        forkJoin({
          cards: this._displayRequestManagerService.getDisplayNames$(pageName, 'stat'),
          graphs: this._displayRequestManagerService.getDisplayNames$(pageName, 'graph')
        })
      ),
      map(({cards, graphs}) => ({
        statGrids: cards.map(name => ({ name, type: 'stat' })),
        graphGrids: graphs.map(name => ({ name, type: 'graph' }))
      })),
      tap(({statGrids, graphGrids}) => {
        console.log(statGrids, graphGrids); // Log the grids for debugging
      }),
      catchError(error => {
        console.error("Failed to load display names", error);
        return of({statGrids: [], graphGrids: []}); // Return empty arrays on error
      })
    );
  
    // Assigning to the observables directly
    this.statGrids$ = grids$.pipe(
      map(grids => grids.statGrids.map(grid => ({
          ...grid,
          type: grid.type as 'stat' | 'graph' // Cast the type here if you're confident in its value
      })))
      // Correct the type assertion if necessary. For example, you may filter or enforce the type more explicitly if the automatic casting isn't safe.
  );
  
  this.graphGrids$ = grids$.pipe(
      map(grids => grids.graphGrids.map(grid => ({
          ...grid,
          type: grid.type as 'stat' | 'graph' // Same casting applied here
      })))
      // Adjust based on your actual logic and types. 
  );
  
}

ngOnInit() {
  // You should initialize the observables here, based on the page name

  // Note: 

// Other initialization logic...
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
    
  }

  

}
