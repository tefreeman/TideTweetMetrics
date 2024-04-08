import { Component } from '@angular/core';
import { ChartData, ChartOptions, Chart} from 'chart.js';
import {BaseChartDirective} from 'ng2-charts';
import { Colors } from 'chart.js';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss'
})
export class BarChartComponent {


  constructor() {
    Chart.register(Colors);
  }


  type = 'bar';

  data: ChartData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        label: 'My First Dataset',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };
    options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 1.5,
      resizeDelay: 300,
      
      plugins: {
        colors: {
          enabled: true,
          forceOverride: true
        },
        
      },

      scales: {
        x: {
          title: {
            display: true,
            text: 'X Axis',
            font: {
              size: 14,
              weight: 'bold'
            }
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Y Axis',
            font: {
              size: 14,
              weight: 'bold'
            }
          }
        }
      }
    };
  }
