import { Injectable } from '@angular/core';
import { AgChartOptions, AgChartTheme, AgChartThemeName } from 'ag-charts-community';
import { I_GraphBarData, T_DisplayableGraph } from '../interfaces/displayable-interface';

@Injectable({
  providedIn: 'root'
})
export class GraphMakerService {


  constructor() { }

  
  create_bar_chart(data: I_GraphBarData): AgChartOptions {
    const chartOptions = {
      theme: this.get_theme(),
      title: {
        text: data.metricName,
      },
      data: this.get_bar_data(data),
      series: this.get_bar_series(data),
    }

    return chartOptions;
  }
  get_theme(): AgChartTheme {
    return {
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
  }

  get_bar_data(graphBarData: I_GraphBarData): any[] {
    const chartData: any[] = []
    for (let i = 0; i < graphBarData.owners.length; i++) {
      const data: any = {}
      data["owner"] = graphBarData.owners[i];
      data["1"] = graphBarData.values[i];
      chartData.push(data);
    }
    return chartData;
  }

  get_bar_series(data: I_GraphBarData): any[] {
    return [{ type: 'bar', xKey: 'owner', yKey:'1'}]
  }

}
