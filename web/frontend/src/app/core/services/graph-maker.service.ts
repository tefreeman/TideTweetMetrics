import { Injectable } from '@angular/core';
import { AgChartOptions, AgChartTheme, AgChartThemeName } from 'ag-charts-community';
import { I_GraphBarData, I_GraphLineData, T_DisplayableGraph, T_GraphType } from '../interfaces/displayable-interface';

@Injectable({
  providedIn: 'root'
})
export class GraphMakerService {


  constructor() { }

  getGraphStructure(graphData: T_DisplayableGraph) {
    const dataDimension = Array.isArray(graphData.values[0]) ? graphData.values[0].length : 1;
    const ownerCount = graphData.owners.length;
    const dataPoints =  graphData.values.length;

    return {dataDimension, ownerCount, dataPoints}
  }

  createLineChart(graphLineData: I_GraphLineData): AgChartOptions {
    const chartOptions = {
      theme: this.getTheme(),
      title: {
        text: graphLineData.metricName,
      },
      data: this.getLineData(graphLineData),
      series: this.getLineSeries(graphLineData),
    }

    return chartOptions;
  }
  
  createBarChart(graphBarData: I_GraphBarData): AgChartOptions {
    const chartOptions = {
      theme: this.getTheme(),
      title: {
        text: graphBarData.metricName,
      },
      data: this.getBarData(graphBarData),
      series: this.getBarSeries(graphBarData),
    }

    return chartOptions;
  }

  getTheme(): AgChartTheme {
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

  getBarData(graphBarData: I_GraphBarData): any[] {
    const chartData: any[] = []
    for (let i = 0; i < graphBarData.owners.length; i++) {
      const data: any = {}
      data["owner"] = graphBarData.owners[i];
      data["1"] = graphBarData.values[i];
      chartData.push(data);
    }
    return chartData;
  }

  getBarSeries(data: I_GraphBarData): any[] {
    return [{ type: 'bar', xKey: 'owner', yKey:'1'}]
  }


  getLineData(graphBarData: I_GraphLineData): any[] {
    const chartData: any[] = []
    for (let i = 0; i < graphBarData.owners.length; i++) {
      const data: any = {}
      data["owner"] = graphBarData.owners[i];
      data["1"] = graphBarData.values[i];
      chartData.push(data);
    }
    return chartData;
  }

  getLineSeries(data: I_GraphLineData

    
  ): any[] {
    return [{ type: 'bar', xKey: 'owner', yKey:'1'}]
  }

}
