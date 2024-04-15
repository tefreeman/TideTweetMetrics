import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions, AgChartTheme, AgChartThemeName } from 'ag-charts-community';
import { IDisplayableStats, I_GraphLineData } from '../../../core/interfaces/displayable-interface';

@Component({
  standalone: true,
  imports: [CommonModule, RouterOutlet, AgChartsAngular, ],
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent{
  @Input({required: true}) displayableData!: I_GraphLineData;

  public chartOptions: AgChartOptions;
  constructor() {
    
    const myTheme: AgChartTheme = {
      baseTheme: 'ag-default',
      palette: {
        fills: ['#a51e36', '#ff7f7f', '#ffa07a', '#ffd700', '#9acd32', '#87ceeb', '#6a5acd', '#9370db', '#8a2be2', '#00ced1', '#32cd32']
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
        text: "Title",
      },
      data: [
        { month: 'Mar', 1: 9000, 2: 10000, 3: 30000, 4: 60000, 5: 90000, 6: 120000, 7: 30000, 8: 40000, 9: 50000, 10: 60000, 11: 70000 },
        { month: 'May', 1: 20000, 2: 30000, 3: 40000, 4: 70000, 5: 100000, 6: 130000, 7: 40000, 8: 50000, 9: 60000, 10: 70000, 11: 80000 },
        { month: 'Jul', 1: 30000, 2: 40000, 3: 50000, 4: 80000, 5: 110000, 6: 140000, 7: 50000, 8: 60000, 9: 70000, 10: 80000, 11: 90000 },
        { month: 'Sep', 1: 40000, 2: 50000, 3: 60000, 4: 90000, 5: 120000, 6: 150000, 7: 60000, 8: 70000, 9: 80000, 10: 90000, 11: 100000 },
        { month: 'Nov', 1: 50000, 2: 60000, 3: 70000, 4: 100000, 5: 130000, 6: 160000, 7: 70000, 8: 80000, 9: 90000, 10: 100000, 11: 110000 },
        { month: 'Jan', 1: 9000, 2: 10000, 3: 20000, 4: 50000, 5: 80000, 6: 100000, 7: 20000, 8: 30000, 9: 40000, 10: 50000, 11: 60000 },
    ],
    
    // Series: Defines which chart type and data to use
    series: [
        { type: 'line', xKey: 'month', yKey: '1' },
        { type: 'line', xKey: 'month', yKey: '2' },
        { type: 'line', xKey: 'month', yKey: '3' },
        { type: 'line', xKey: 'month', yKey: '4' },
        { type: 'line', xKey: 'month', yKey: '5' },
        { type: 'line', xKey: 'month', yKey: '6' },
        { type: 'line', xKey: 'month', yKey: '7' },
        { type: 'line', xKey: 'month', yKey: '8' },
        { type: 'line', xKey: 'month', yKey: '9' },
        { type: 'line', xKey: 'month', yKey: '10' }, 
        { type: 'line', xKey: 'month', yKey: '11' }, 
    ],
      
    }
  }
}
