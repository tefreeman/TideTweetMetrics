import { NgFor, NgIf,} from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { inject } from '@angular/core';
import { Observable, Subject, Subscription, debounceTime, fromEvent, takeUntil,} from 'rxjs';
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


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgFor, StatCardComponent, BarChartComponent, AsyncPipe, MaterialModule, GraphCardComponent, CommonModule, CdkDrag, CdkDropList, AsyncPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  providers: [MetricService],

})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChildren('statcard', {read: ElementRef}) statCards!: QueryList<any>;
  
  _displayProcessor = inject(DisplayableProviderService);
  editModeService: EditModeService = inject(EditModeService);

  public cardGrid: MoveableGridTilesService = new MoveableGridTilesService();
  public graphGrid: MoveableGridTilesService = new MoveableGridTilesService();


  editMode: Observable<boolean> = this.editModeService.getEditMode();
  subscription: any;
  private destroy$ = new Subject<void>();
  private statsCardsChangesSub!: Subscription;
  constructor(private cdr: ChangeDetectorRef, public dialog: MatDialog, private ngZone: NgZone){
}

  ngOnInit() {
    this.subscription = this._displayProcessor.displayables$.subscribe((data) => {
      this.cardGrid.dataArr = [];
      this.graphGrid.dataArr = [];
      data.forEach((displayable) => {
        if (this.isCard(displayable)) {
          this.cardGrid.dataArr.push(displayable);
        } else if (this.isGraph(displayable)) {
          this.graphGrid.dataArr.push(displayable);
        }
      });
    
    });

    this.ngZone.runOutsideAngular(() => {
      // Create an observable that listens to the window resize event.
      fromEvent(window, 'resize')
        .pipe(
          debounceTime(300), // Debounce time in ms
          takeUntil(this.destroy$) 
        )
        .subscribe((event) => {
          this.ngZone.run(() => {
            this.cardGrid.update(this.statCards);
            this.graphGrid.update(this.statCards);
          });
        });
    });

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();

    if (this.statsCardsChangesSub) {
      this.statsCardsChangesSub.unsubscribe();
    }

    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit() {
    // Initial subscription
    this.statsCardsChangesSub = this.statCards.changes.subscribe((queryList: QueryList<ElementRef>) => {
      this.cardGrid.update(queryList);
      this.graphGrid.update(queryList);
      
      // keeping views in sync
      this.cdr.detectChanges();
    });

    // Trigger for existing elements
    if (this.statCards.length) {
      this.statCards.notifyOnChanges();
    }
  }
  
  onResize() {
    this.cardGrid.update(this.statCards);
    this.graphGrid.update(this.statCards);
  }


  // ISSUE:  solved
  dropCard(event: CdkDragDrop<T_DisplayableDataType[]>) {
    this.cardGrid.swapClosestElements(event.previousIndex, { x: event.dropPoint.x, y: event.dropPoint.y });
  }

  dropGraph(event: CdkDragDrop<T_DisplayableDataType[]>) {
    this.cardGrid.swapClosestElements(event.previousIndex, { x: event.dropPoint.x, y: event.dropPoint.y });
  }

  isCard(displayableData: T_DisplayableDataType): boolean {
    return displayableData.type === 'stat-value' || 
           displayableData.type === 'stat-trend' || 
           displayableData.type === 'stat-comp';
  }


  isGraph(displayableData: T_DisplayableDataType): boolean {
    return displayableData.type === 'graph-line' || 
           displayableData.type === 'graph-bar';
  }

  
  openGraphCardDialog() {
    

    const dialogRef = this.dialog.open(AddGraphComponent, {
      height: "calc(100% - 60px)",
      width: "calc(100% - 60px)",
      maxWidth: "100%",
      maxHeight: "100%"
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  openStatCardDialog() {
    

    const dialogRef = this.dialog.open(AddCardComponent, {
      height: "calc(100% - 60px)",
      width: "calc(100% - 60px)",
      maxWidth: "100%",
      maxHeight: "100%"
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }


  toggleEditMode(){
    this.editModeService.toggleEditMode();
  }

  update(){
    
  }


}
