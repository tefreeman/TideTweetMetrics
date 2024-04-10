import { NgFor, NgIf,} from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatCardModule} from '@angular/material/card';
import { AuthService } from '../core/services/auth.service';
import { inject } from '@angular/core';
import { DatacardComponent } from '../data-displays/datacard/datacard.component';
import {MatDividerModule} from '@angular/material/divider';
import { BarChartComponent } from '../data-displays/graphs/bar-chart/bar-chart.component';
import { fromEvent, Subscription, tap, throttleTime } from 'rxjs';
import { I_DisplayableData, I_DisplayableRequest } from '../core/interfaces/displayable-interface';
import { MetricService } from '../core/services/metric.service';
import { GraphService } from '../core/services/graph.service';
import { DisplayRequestService } from '../core/services/DisplayRequest.service';
import { DisplayProcessorService } from '../core/services/DisplayProcessor.service';
import {MatSidenavModule} from '@angular/material/sidenav';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatGridListModule, MatCardModule, NgFor, DatacardComponent,MatDividerModule, BarChartComponent, MatSidenavModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  providers: [MetricService]
})
export class DashboardComponent implements OnInit, OnDestroy{
  _displayProcessor = inject(DisplayProcessorService);

  graphs: I_DisplayableData[] = [];



  constructor(){
   this._displayProcessor.displayables$.subscribe((displayables) => {
     this.graphs = displayables;
   });
}

  ngOnInit() {
  }

  ngOnDestroy(): void {

  }






}
