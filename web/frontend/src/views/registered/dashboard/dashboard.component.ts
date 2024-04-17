import { NgFor, NgIf,} from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { inject } from '@angular/core';
import { Observable, Subscription,} from 'rxjs';
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
  providers: [MetricService]
})
export class DashboardComponent implements OnInit, OnDestroy{
  _displayProcessor = inject(DisplayableProviderService);
  editModeService: EditModeService = inject(EditModeService);


  displayableDataArr: T_DisplayableDataType[] = [];
  editMode: Observable<boolean> = this.editModeService.getEditMode();
  subscription: any;

  constructor(public dialog: MatDialog){
}

  ngOnInit() {
    this.subscription = this._displayProcessor.displayables$.subscribe((data) => {
      console.log(data);
      this.displayableDataArr = data;
    
    })

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  
  // ISSUE:  The drop function needs to be modified to handle the CSS grid layout. MoveItemInArray is not sufficient.
  drop(event: CdkDragDrop<T_DisplayableDataType[]>) {
    console.log(event);
    moveItemInArray(this.displayableDataArr, event.previousIndex, event.currentIndex);
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
    
    /**
     * Fullscreen dialog with 15px margins
     * 
     * -> to make it work, wee need extra styling on dialog component below... 
     */
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
    
    /**
     * Fullscreen dialog with 15px margins
     * 
     * -> to make it work, wee need extra styling on dialog component below... 
     */
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
