import { Component, OnInit, Input, HostListener} from '@angular/core';
import Chart from 'chart.js/auto';
import { IGraph } from '../graph.service';
import {GraphDataColorService} from '../graph-data-color.service';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss'
})

export class LineChartComponent implements OnInit{
  @Input() graph: IGraph;
  constructor(private graphDataColorService: GraphDataColorService){
    this.graph = {'id': '', 'name': '', 'type': '', 'data': {labels: [], datasets: []}};

  }
  public chart: any;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (this.chart) {
      this.chart.destroy();
      this.createChart();
    }
  }

  ngOnInit() {
    this.createChart();
  }
  createChart(){
  
    this.chart = new Chart(this.graph.id, {
      type: 'line', //this denotes tha type of chart

      data: {// values on X-Axis
        labels: this.graph.data.labels,
	       datasets: this.graph.data.datasets.map((dataset, index) => ({
          ...dataset,
         backgroundColor: this.graphDataColorService.getBackgroundColor(index),
         borderColor:this.graphDataColorService.getBackgroundColor(index),
         borderWidth: 5
        }))
      },
      options: {
        aspectRatio:2.5,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: 'white' // Change legend label color
            }
          },
          title: {
            display: true,
            text: 'Graph Name',
            color: 'white' // Change title color
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: 'white' // Change y-axis ticks color
            },
            grid: {
              display: false, // Remove grid lines from the y-axis
            },

          },
          x: {
            ticks: {
              color: 'white' // Change x-axis ticks color
            },
            grid: {
              display: false // Remove grid lines from the y-axis
            }
          }
        }
        
      }
      
      
    });
  }

}
