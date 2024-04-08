import { Component } from '@angular/core';
import { ChartData, ChartOptions} from 'chart.js';
import {BaseChartDirective} from 'ng2-charts';
@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss'
})
export class BarChartComponent {

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
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };
  }


