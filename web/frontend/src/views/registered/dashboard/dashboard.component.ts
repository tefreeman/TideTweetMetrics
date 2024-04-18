import { NgFor, NgIf,} from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { inject } from '@angular/core';
import { Observable, Subject, Subscription, debounceTime, filter, fromEvent, map, takeUntil,} from 'rxjs';
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

  public cardGrid: MoveableGridTilesService = new MoveableGridTilesService();
  public graphGrid: MoveableGridTilesService = new MoveableGridTilesService();


  editMode: Observable<boolean> = this.editModeService.getEditMode();
  subscription: any;

  constructor(public dialog: MatDialog) {
}

  ngOnInit() {
    

  }

  ngOnDestroy(): void {
  
  }

  ngAfterViewInit() {
    // Initial subscription
  
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
