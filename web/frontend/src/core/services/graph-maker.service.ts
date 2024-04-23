import { Injectable, inject } from '@angular/core';
import { AgChartOptions, AgChartTheme } from 'ag-charts-community';
import {
  I_GraphBarData,
  I_GraphLineData,
  T_DisplayableGraph,
} from '../interfaces/displayable-data-interface';
import { GraphLargeBar } from './graphing/graph-large-bars';
import { GraphSmallBar } from './graphing/graph-small-bar';
import { GraphSmallLine } from './graphing/graph-small-line';
import { GraphSmallMultiBar } from './graphing/graph-small-multi-bar';
import { KeyTranslatorService } from './key-translator.service';
@Injectable({
  providedIn: 'root',
})
export class GraphMakerService {
  private keyTranslatorService: KeyTranslatorService =
    inject(KeyTranslatorService);
  private graphSmallBar: GraphSmallBar = new GraphSmallBar();
  private graphLargeBar: GraphLargeBar = new GraphLargeBar();
  private graphSmallMultiBar: GraphSmallMultiBar = new GraphSmallMultiBar();
  private graphSmallLine: GraphSmallLine = new GraphSmallLine();
  constructor() {}

  /**
   * Retrieves the structure of the graph data.
   * @param graphData - The displayable graph data.
   * @returns The structure of the graph data including data dimension, owner count, and data points.
   */
  getGraphStructure(graphData: T_DisplayableGraph) {
    const dataDimension = Array.isArray(graphData.values[0])
      ? graphData.values[0].length
      : 1;
    const ownerCount = graphData.owners.length;
    const dataPoints = graphData.values.length;

    return { dataDimension, ownerCount, dataPoints };
  }

  /**
   * Creates options for a line chart.
   * @param graphLineData - The line chart data.
   * @returns The chart options for a line chart.
   */
  createLineChart(graphLineData: I_GraphLineData): AgChartOptions {
    return this.graphSmallLine.getGraph(graphLineData);
  }

  createBarChart(graphBarData: I_GraphBarData): AgChartOptions {
    if (graphBarData.owners.length < 15) {
      return this.graphSmallMultiBar.getGraph(graphBarData);
    } else {
      return this.graphSmallMultiBar.getGraph(graphBarData);
    }
  }
  getTheme(): AgChartTheme {
    const theme: AgChartTheme = {
      baseTheme: 'ag-default',
      palette: {
        fills: [
          '#a51e36',
          '#ff7f7f',
          '#ffa07a',
          '#ffd700',
          '#9acd32',
          '#87ceeb',
          '#6a5acd',
          '#9370db',
          '#8a2be2',
          '#00ced1',
          '#32cd32',
        ],
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
      },
    };

    return theme;
  }

  /**
   * Retrieves the data for a bar chart.
   * @param graphBarData - The bar chart data.
   * @returns The chart data for a bar chart.
   */
  getBarData(graphBarData: I_GraphBarData): any[] {
    const chartData: any[] = [];
    for (let i = 0; i < graphBarData.owners.length; i++) {
      const data: any = {};
      data['owner'] = graphBarData.owners[i];
      data['1'] = graphBarData.values[i];
      chartData.push(data);
    }
    return chartData;
  }

  /**
   * Retrieves the series for a bar chart.
   * @param data - The bar chart data.
   * @returns The series for a bar chart.
   */
  getBarSeries(data: I_GraphBarData): any[] {
    return [
      {
        type: 'bar',
        xKey: 'owner',
        yKey: '1',
        formatter: ({ datum, yKey }: any) => ({
          fillOpacity: this.getOpacity(datum[yKey], yKey, 0.4, 1, data.values),
        }),
      },
    ];
  }

  /**
   * Retrieves the data for a line chart.
   * @param graphBarData - The line chart data.
   * @returns The chart data for a line chart.
   */
  getLineData(graphBarData: I_GraphLineData): any[] {
    const chartData: any[] = [];
    for (let i = 0; i < graphBarData.owners.length; i++) {
      const data: any = {};
      data['owner'] = graphBarData.owners[i];
      data['1'] = graphBarData.values[i];
      chartData.push(data);
    }
    return chartData;
  }

  /**
   * Calculates the opacity for a bar chart.
   * @param value - The value of the bar.
   * @param key - The key of the bar.
   * @param minOpacity - The minimum opacity.
   * @param maxOpacity - The maximum opacity.
   * @param data - The chart data.
   * @returns The opacity value.
   */
  getOpacity(
    value: number,
    key: any,
    minOpacity: any,
    maxOpacity: any,
    data: any
  ) {
    const [min, max] = this.getDomain(key, data);
    let alpha = Math.round(((value - min) / (max - min)) * 10) / 10;
    //console.log(min, max, value);
    return this.map(alpha, 0, 1, minOpacity, maxOpacity);
  }

  /**
   * Retrieves the domain for a chart.
   * @param key - The key of the chart.
   * @param data - The chart data.
   * @returns The domain of the chart.
   */
  getDomain(key: string | number, data: any) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    return [min, max];
  }

  /**
   * Maps a value from one range to another range.
   * @param value - The value to map.
   * @param start1 - The start of the first range.
   * @param end1 - The end of the first range.
   * @param start2 - The start of the second range.
   * @param end2 - The end of the second range.
   * @returns The mapped value.
   */
  map = (
    value: number,
    start1: number,
    end1: number,
    start2: number,
    end2: number
  ) => {
    return ((value - start1) / (end1 - start1)) * (end2 - start2) + start2;
  };

  /**
   * Retrieves the series for a line chart.
   * @param data - The line chart data.
   * @returns The series for a line chart.
   */
  getLineSeries(data: I_GraphLineData): any[] {
    const dataLength = data.values.length;

    // Define a strategy for strokeWidth based on the data size
    let strokeWidth = this.calculateStrokeWidth(dataLength);

    return [
      {
        type: 'line',
        xKey: 'owner',
        yKey: '1',
        strokeWidth: strokeWidth, // Use dynamic strokeWidth based on data size
        marker: {
          enabled: false,
        },
      },
    ];
  }

  /**
   * Calculates the strokeWidth based on the data size.
   * @param dataLength - The length of the data.
   * @returns The strokeWidth value.
   */
  calculateStrokeWidth(dataLength: number): number {
    if (dataLength <= 10) {
      return 4;
    } else if (dataLength <= 50) {
      return 3;
    } else if (dataLength <= 100) {
      return 2;
    } else {
      return 1;
    }
  }
}
