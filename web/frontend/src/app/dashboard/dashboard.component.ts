import { NgFor, NgIf,} from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatCardModule} from '@angular/material/card';
import { AuthService } from '../core/services/auth.service';
import { inject } from '@angular/core';
import { DatacardComponent } from '../data-displays/datacard/datacard.component';
import {MatDividerModule} from '@angular/material/divider';
import { BarChartComponent } from '../data-displays/graph-card/bar-chart/bar-chart.component';
import { fromEvent, map, Observable, Subscription, tap, throttleTime } from 'rxjs';
import { I_DisplayableData, I_DisplayableRequest } from '../core/interfaces/displayable-interface';
import { MetricService } from '../core/services/metric.service';
import { GraphProcessorService } from '../core/services/graph-processor.service';
import { DisplayRequestService } from '../core/services/display-request.service';
import { DisplayProcessorService } from '../core/services/display-processor.service';
import {MatSidenavModule} from '@angular/material/sidenav';
import { AsyncPipe } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { GraphCardComponent } from '../data-displays/graph-card/graph-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgFor, DatacardComponent, BarChartComponent, AsyncPipe, MaterialModule, GraphCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  providers: [MetricService]
})
export class DashboardComponent implements OnInit, OnDestroy{
  _displayProcessor = inject(DisplayProcessorService);

  displayableDataArr$: Observable<I_DisplayableData[]>;


  test_displayed_data: I_DisplayableData = {
    stat_name: "tweet_likes-mean",
    owners: ["alabama_cs"],
    type: "stat-value",
    values: [1]
  
  }

  test_displayed_data2: I_DisplayableData = {
    stat_name: "tweet_likes-sum",
    owners: ["alabama_cs"],
    type: "stat-trend",
    values: [10]
  
  }
  constructor(){
    this.displayableDataArr$ = this._displayProcessor.displayables$;
}

  ngOnInit() {
    
  }

  ngOnDestroy(): void {

  }






}
