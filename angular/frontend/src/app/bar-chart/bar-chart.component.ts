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
      type: 'bar', // this denotes the type of chart

      data: {
        labels: this.graph.data.labels,
        datasets: this.graph.data.datasets.map((dataset, index) => ({
          ...dataset,
          backgroundColor: this.getBackgroundColor(index),
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
            text: 'Likes',
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


  // Function to get background color based on index
  getBackgroundColor(index: number): string {
    const colors = ['rgba(241,116,99,255)', 'rgba(180,218,225,255)', 'rgba(255, 206, 86, 0.5)'];
    return colors[index % colors.length]; 
  }

}