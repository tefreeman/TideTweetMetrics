import { NgFor, NgIf } from '@angular/common';
import { Component, HostListener, AfterViewInit, OnInit, afterNextRender} from '@angular/core';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatCardModule} from '@angular/material/card'; 
import { BarChartComponent } from '../bar-chart/bar-chart.component';
import { LineChartComponent } from '../line-chart/line-chart.component';
import { GraphService, IGraph } from '../graph.service';
import { ChangeDetectorRef } from '@angular/core';

interface Graph {
  name: string;
  type: string; // "line", "bar" 
  data: any; // todo later

}
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatGridListModule, NgFor, NgIf,  MatCardModule,
     BarChartComponent, LineChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements AfterViewInit, OnInit{
  screenHeight:any;
  screenWidth:any;
  graph_cols = 2;
  breakpoint_width = 1080;
  graphs: IGraph[];
  number_submits: Number = 0

  constructor(private graphService: GraphService, private cdr: ChangeDetectorRef){
    this.graphs = this.graphService.getGraphs();
    afterNextRender(() => { 
      this.graphService.getClassifierData().then((data)=> {
        this.number_submits = data;
      })
      this.graphService.getPostLengthMetrics().subscribe({
        next: (data) => {
          this.graphs.push(data);
          this.cdr.detectChanges();

        },
        error: (error) => {
          console.error('Error fetching post length metrics:', error);
        }
      });
    });
  }
  // Resizing to 1 column when screen width is less than 1080px breakPoint_width
  @HostListener('window:resize', ['$event'])
  getScreenSize(event?: any) {
    if (typeof window !== "undefined") {
      this.screenHeight = window.innerHeight;
      this.screenWidth = window.innerWidth;

      if (this.screenWidth <= this.breakpoint_width) {
        this.graph_cols = 1;
      } else {
        this.graph_cols = 2;
      }
  console.log(this.screenHeight, this.screenWidth);
    }
}

ngOnInit(){
}

ngAfterViewInit(){
  this.getScreenSize();
}

 
} 
