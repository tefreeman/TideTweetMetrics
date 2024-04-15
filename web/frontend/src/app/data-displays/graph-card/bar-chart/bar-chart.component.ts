import { Component, inject, Input, OnInit} from '@angular/core';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions, AgChartTheme, AgChartThemeName } from 'ag-charts-community';
import {I_GraphBarData } from '../../../core/interfaces/displayable-interface';
import { KeyTranslatorService } from '../../../core/services/key-translator.service';
@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [AgChartsAngular],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss',
})
export class BarChartComponent implements OnInit{
  @Input({required: true}) displayableData!: I_GraphBarData;
  private keyTranslatorService: KeyTranslatorService = inject(KeyTranslatorService);

  // Chart Options
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
      data: [],
    
    // Series: Defines which chart type and data to use
    series: [],
  }

}

ngOnInit(): void {
    const chartData: any[] = []
    for (let i = 0; i < this.displayableData.owners.length; i++) {
      const data: any = {}
      data["owner"] = this.displayableData.owners[i];
      data["1"] = this.displayableData.values[i];
      chartData.push(data);
    }
    this.chartOptions.data = chartData;
    this.chartOptions.series = [
      { type: 'bar', xKey: 'owner', yKey:'1'}
    ]

    if (this.chartOptions.title)
      this.chartOptions.title.text = this.keyTranslatorService.translateKey(this.displayableData.metricName) as string;


}
}
