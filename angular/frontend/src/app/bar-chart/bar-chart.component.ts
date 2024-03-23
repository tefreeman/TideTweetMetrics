import { Component, OnInit, Input, HostListener} from '@angular/core';
import {IGraph } from '../graph.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss'
})

export class BarChartComponent implements OnInit {
  @Input() graph: IGraph;

  constructor(){
    this.graph = {'id': '', 'name': '', 'type': '', 'data': {labels: [], datasets: []}};

  }

  public chart: any;


  ngOnInit() {
    this.createChart();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (this.chart) {
      this.chart.destroy();
      this.createChart();
    }
  }
  createChart(){
    this.chart = new Chart(this.graph.id, {
      type: 'bar', //this denotes tha type of chart

      data: {// values on X-Axis
        labels: this.graph.data.labels,
	       datasets: this.graph.data.datasets
      },
      options: {
        aspectRatio:2.5
      }
      
    });
  }

}
