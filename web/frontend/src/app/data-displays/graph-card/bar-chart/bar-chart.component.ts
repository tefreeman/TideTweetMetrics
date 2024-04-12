import { Component } from '@angular/core';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-community';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [AgChartsAngular],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss',
})
export class BarChartComponent {
  // Chart Options
  public chartOptions: AgChartOptions;
  constructor() {
    this.chartOptions = this.make_chart();
  }

  make_chart(): AgChartOptions {
    return {
      theme: 'ag-material',

      title: {
        "text": "Ice Cream Sales by Month"
      },
      // Data: Data to be displayed in the chart
      data: [
        { month: 'Jan', avgTemp: 2.3, iceCreamSales: 162000 },
        { month: 'Mar', avgTemp: 6.3, iceCreamSales: 302000 },
        { month: 'May', avgTemp: 16.2, iceCreamSales: 800000 },
        { month: 'Jul', avgTemp: 22.8, iceCreamSales: 1254000 },
        { month: 'Sep', avgTemp: 14.5, iceCreamSales: 950000 },
        { month: 'Nov', avgTemp: 8.9, iceCreamSales: 200000 },
      ],
      // Series: Defines which chart type and data to use
      series: [{ type: 'bar', xKey: 'month', yKey: 'iceCreamSales' }],

      axes: [
        {
          type: 'number',
          position: 'left',
          title: {
            text: 'Ice Cream Sales',
          },
          tick: {interval: 100000},
          gridLine: {
            //width: 0,
            style: [
              {
                stroke: 'rgba(0,0,0,0.5)',
                lineDash: [4, 2],
              },
            ],
          },
        },
        {
          type: 'category',
          position: 'bottom',
          title: {
            text: 'Month',
          },
        },
      ],
    };
  }
}
