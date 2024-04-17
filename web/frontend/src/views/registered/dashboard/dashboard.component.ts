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
  displayableCardArr: T_DisplayableDataType[] = [];
  displayableGraphArr: T_DisplayableDataType[] = [];
  positionArr: {x: number, y: number}[] = []
  editMode: Observable<boolean> = this.editModeService.getEditMode();
  subscription: any;
  private destroy$ = new Subject<void>();

  private statsCardsChangesSub!: Subscription;
  constructor(private cdr: ChangeDetectorRef, public dialog: MatDialog, private ngZone: NgZone){
}

  ngOnInit() {
    this.subscription = this._displayProcessor.displayables$.subscribe((data) => {
      this.displayableCardArr = [];
      this.displayableGraphArr = [];
      data.forEach((displayable) => {
        if (this.isCard(displayable)) {
          this.displayableCardArr.push(displayable);
        } else if (this.isGraph(displayable)) {
          this.displayableGraphArr.push(displayable);
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
            this.onResize();
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
      this.setElementPositions(queryList);
      
      // keeping views in sync
      this.cdr.detectChanges();
    });

    // Trigger for existing elements
    if (this.statCards.length) {
      this.statCards.notifyOnChanges();
    }
  }
  
  onResize() {
    this.setElementPositions(this.statCards);
  }

  private swapClosestElements(index: number, dropPos: { x: number, y: number }) {
    if (index < 0 || index >= this.positionArr.length) {
      return;
    }
  
    // grid capacity calculations
    const itemsPerRow = this.determineItemsPerRow();
    const totalRows = Math.ceil(this.positionArr.length / itemsPerRow);
    const itemsInLastRow = this.positionArr.length % itemsPerRow || itemsPerRow;
    const dropInLastRowOrBelow = this.isDropInLastRowOrBelow(dropPos, itemsPerRow, totalRows, itemsInLastRow);
  
    // Either move the dragged item to the end or swap it with the closest item.
    if (dropInLastRowOrBelow) {
      this.moveToEnd(index);
    } else {
      this.performSwap(index, dropPos);
    }
  }
  
  private determineItemsPerRow(): number {

    if (this.positionArr.length < 2) {
      return this.positionArr.length;
    }
  
  
    const firstItemYPos = this.positionArr[0].y;
    const indexOfSecondRow = this.positionArr.findIndex(pos => pos.y !== firstItemYPos);
    
    if (indexOfSecondRow === -1) {
      return this.positionArr.length;
    }

    return indexOfSecondRow;
  }
  
  private isDropInLastRowOrBelow(dropPos: { x: number, y: number }, itemsPerRow: number, totalRows: number, itemsInLastRow: number): boolean {
    const lastItem = this.positionArr[this.positionArr.length - 1];
    if (!lastItem) {
      return false;
    }
  
    const estimatedRowHeight = lastItem.y - (this.positionArr[0]?.y || 0) / (totalRows - 1 || 1);
    const bottomOfGrid = lastItem.y + estimatedRowHeight;

    if (dropPos.y > bottomOfGrid || (dropPos.y > lastItem.y && this.positionArr.length % itemsPerRow !== 0)) {
      return true;
    }
  
    return false;
  }
     // Move the dragged item to the end if dropped in an extra space or below the grid.
  private moveToEnd(index: number) {
    const item = this.displayableCardArr.splice(index, 1)[0];
    this.displayableCardArr.push(item);
    
    const position = this.positionArr.splice(index, 1)[0];
    this.positionArr.push(position);
  }
  
  // Swap the dragged item with the closest item.
  private performSwap(index: number, dropPos: { x: number, y: number }) {
    let closestDistance = Number.MAX_VALUE;
    let closestIndex = -1;
  
    this.positionArr.forEach((pos, idx) => {
      const distance = Math.sqrt((pos.x - dropPos.x) ** 2 + (pos.y - dropPos.y) ** 2);
      if (distance < closestDistance && idx !== index) {
        closestDistance = distance;
        closestIndex = idx;
      }
    });
  
    if (closestIndex !== -1) {
      [this.displayableCardArr[index], this.displayableCardArr[closestIndex]] =
      [this.displayableCardArr[closestIndex], this.displayableCardArr[index]];
  
      [this.positionArr[index], this.positionArr[closestIndex]] =
      [this.positionArr[closestIndex], this.positionArr[index]];
    }
  }
  
  
  private setElementPositions(queryList: QueryList<ElementRef>) {
    queryList.forEach((elemRef, index) => {
      if (elemRef && elemRef.nativeElement) { 
        const rect = elemRef.nativeElement.getBoundingClientRect();
        // Calc the center points
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        this.positionArr[index] = { x: centerX, y: centerY };
      }
    });
  }
  // ISSUE:  solved
  drop(event: CdkDragDrop<T_DisplayableDataType[]>) {
    console.log(event);
    this.swapClosestElements(event.previousIndex, { x: event.dropPoint.x, y: event.dropPoint.y });
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
}
