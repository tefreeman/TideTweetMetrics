import { NgFor, NgIf,} from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { inject } from '@angular/core';
import { DatacardComponent } from '../../../data-displays/datacard/datacard.component';
import { BarChartComponent } from '../../../data-displays/graph-card/bar-chart/bar-chart.component';
import { Observable, Subscription,} from 'rxjs';
import { IDisplayableStats, I_DisplayableRequest, T_DisplayableDataType } from '../../../core/interfaces/displayable-interface';
import { MetricService } from '../../../core/services/metric.service';
import { DisplayableProviderService } from '../../../core/services/displayable-provider.service';
import { AsyncPipe } from '@angular/common';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { GraphCardComponent } from '../../../data-displays/graph-card/graph-card.component';
import { CommonModule } from '@angular/common';
import {CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray} from '@angular/cdk/drag-drop';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgFor, DatacardComponent, BarChartComponent, AsyncPipe, MaterialModule, GraphCardComponent, CommonModule, CdkDrag, CdkDropList],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  providers: [MetricService]
})
export class DashboardComponent implements OnInit, OnDestroy{
  _displayProcessor = inject(DisplayableProviderService);
  displayableDataArr: T_DisplayableDataType[] = [];

  subscription: any;
  constructor(){
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

  
  // TODO: write custom logic for proper card placement
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






}
