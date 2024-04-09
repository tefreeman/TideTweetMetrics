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
import { I_GraphDataInterface, I_DisplayableRequest } from '../core/interfaces/displayable-interface';
import { MetricService } from '../core/services/metric.service';
import { GraphService } from '../core/services/graph.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatGridListModule, MatCardModule, NgFor, DatacardComponent,MatDividerModule, BarChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  providers: [MetricService]
})
export class DashboardComponent implements OnInit, OnDestroy{
  _auth = inject(AuthService);
  _metric_service = inject(MetricService);
  _graph_service = inject(GraphService);

  public graph_cols: number = 2;
  public data_cols: number = 4;

  graphs: I_GraphDataInterface[] = [];

  graphsRequest: I_DisplayableRequest[] = [
    {"owners": ["alabama_cs"], "stat_name": "tweet_count-sum", "type": "display"},
    {"owners": ["alabama_cs"], "stat_name": "tweet_likes-mean", "type": "display"},
    {"owners": ["alabama_cs"], "stat_name": "tweet_likes-sum", "type": "display"},
    {"owners": ["alabama_cs"], "stat_name": "tweet_words-mean", "type": "display"},
    {"owners": ["alabama_cs"], "stat_name": "tweet_photos-mean", "type": "display"},
    {"owners": ["alabama_cs"], "stat_name": "tweet_hashtags-mean", "type": "display"},
    {"owners": ["alabama_cs"], "stat_name": "tweet_urls-mean", "type": "display"},
  ];

  private eventSub: Subscription;

  ngOnInit() {

  this._metric_service.subject.subscribe((val) => {
    if (val == 1) {
    this._graph_service.getMetricsForGraphs(this.graphsRequest, this._metric_service).forEach((graph) => {
      this.graphs.push(graph);
      console.log('Graphs:', this.graphs);
    });
  }
  });
  
  this._auth.getProfileDoc().subscribe((user) => {
    console.log('User:', user);

});
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
    this.adjustGraphGridCols(window.innerWidth);
    this.eventSub = fromEvent(window, 'resize').pipe(
      throttleTime(300), // emits once, then ignores subsequent emissions for 300ms, repeat...
      tap<any>(event => {this.adjustGraphGridCols(event.target.innerWidth); this.adjustDataCols(event.target.innerWidth);})
    ).subscribe();
  }




}
