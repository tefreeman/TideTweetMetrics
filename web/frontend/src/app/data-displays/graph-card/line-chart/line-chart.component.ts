import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions, AgChartTheme, AgChartThemeName } from 'ag-charts-community';

@Component({
  standalone: true,
  imports: [CommonModule, RouterOutlet, AgChartsAngular, ],
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent{

  public chartOptions: AgChartOptions;
  constructor() {
    
    const myTheme: AgChartTheme = {
      baseTheme: 'ag-default',
      palette: {
          fills: ['#5C2983', '#0076C5', '#21B372', '#FDDE02', '#F76700', '#D30018'],
          strokes: ['black'],
      },
      overrides: {
        common: {
          title: {
            fontSize: 13,
            fontWeight: 'bold',
            fontFamily: 'Open Sans',
            color: '#999',
  
          },

        },
      }
  };

    this.chartOptions = {
      theme: myTheme,
      title: {
        text: "whoop",
      },
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
    }
  }
}
