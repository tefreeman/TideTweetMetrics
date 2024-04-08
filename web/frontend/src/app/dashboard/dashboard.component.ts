import { NgFor, NgIf,} from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatCardModule} from '@angular/material/card';
import { AuthService } from '../auth.service';
import { inject } from '@angular/core';
import { GraphRequest, GraphService } from '../graph/graph.service';
import { DatacardComponent } from './datacard/datacard.component';
import {MatDividerModule} from '@angular/material/divider';
import { BarChartComponent } from './graphs/bar-chart/bar-chart.component';
import { fromEvent, Subscription, tap, throttleTime } from 'rxjs';

interface Card {
  title: string;
  subtitle: string;
  content: string;
  image: string;
}


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatGridListModule, MatCardModule, NgFor, DatacardComponent,MatDividerModule, BarChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy{
  _auth = inject(AuthService);
  _graphService = inject(GraphService);
  graphs: GraphRequest[] = []
  public graph_cols: number = 2;
  public data_cols: number = 4;

  private eventSub: Subscription;


  ngOnInit() {

  }

  ngOnDestroy(): void {
    this.eventSub.unsubscribe(); // don't forget to unsubscribe
  }

  adjustGraphGridCols(innerWidth: number) {
    const baseWidth = 600; // Base width per column
    const minWidth = 800; // Minimum width of the grid to start showing more than one column
    const maxWidth = 2600; // Maximum considered width for calculation
    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, innerWidth));
    this.graph_cols = Math.max(1, Math.floor(clampedWidth / baseWidth));
  }
  adjustDataCols(innerWidth: number) {
    const baseWidth = 300; // Base width per column
    const minWidth = 600; // Minimum width of the grid to start showing more than one column
    const maxWidth = 1800; // Maximum considered width for calculation
    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, innerWidth));
    this.data_cols = Math.max(1, Math.floor(clampedWidth / baseWidth));
  }
  constructor(){
    this.graphs = this._graphService.getGraphRequests();
    this.adjustGraphGridCols(window.innerWidth);

    this.eventSub = fromEvent(window, 'resize').pipe(
      throttleTime(300), // emits once, then ignores subsequent emissions for 300ms, repeat...
      tap<any>(event => {this.adjustGraphGridCols(event.target.innerWidth); this.adjustDataCols(event.target.innerWidth);})
    ).subscribe();
  }

  tryGetFile(): void {
    this._auth.getChartData();
  }

  test(): void {
    this._graphService.getStatKeys().forEach((stat) => {
      console.log(stat);
    });
  }

}
