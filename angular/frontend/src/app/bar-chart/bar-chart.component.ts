import { Component, OnInit, Input, HostListener} from '@angular/core';
import {IGraph } from '../graph.service';
import Chart from 'chart.js/auto';
import {GraphDataColorService} from '../graph-data-color.service';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss'
})

export class BarChartComponent implements OnInit {
  @Input() graph: IGraph;

  constructor(private graphDataColorService: GraphDataColorService){

    this.graph = {'id': '', 'name': '', 'type': '', 'data': {labels: [], datasets: []}};
  }

  public chart: any;


  ngOnInit() {
    setTimeout(() => {
      this.createChart();
    }, 200);
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
      type: 'bar', // this denotes the type of chart

      data: {
        labels: this.graph.data.labels,
        datasets: this.graph.data.datasets.map((dataset, index) => ({
          ...dataset,
          backgroundColor: this.graphDataColorService.getBackgroundColor(index),
          borderWidth: 1,
          borderRadius: 10
        }))
      },
      options: {
        aspectRatio: 2.5,
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