import { NgFor } from '@angular/common';
import { Component, HostListener, AfterViewInit} from '@angular/core';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatCardModule} from '@angular/material/card'; 
import { BarChartComponent } from '../bar-chart/bar-chart.component';
import { LineChartComponent } from '../line-chart/line-chart.component';


interface Graph {
  name: string;
  type: string; // "line", "bar" 
  data: any; // todo later

}
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatGridListModule, NgFor, MatCardModule,
     BarChartComponent, LineChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements AfterViewInit{
  screenHeight:any;
  screenWidth:any;
  graph_cols = 2;
  breakpoint_width = 1080;
  graphs = ["g1", "g2", "g3", "g4"]


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

constructor() {
}

ngAfterViewInit(){
  this.getScreenSize();
}

 
} 
