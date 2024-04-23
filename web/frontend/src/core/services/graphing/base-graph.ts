import { AgChartOptions, AgChartTheme } from 'ag-charts-community';
import { T_DisplayableGraph } from '../../interfaces/displayable-data-interface';

const _baseTheme: AgChartTheme = {
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

export abstract class BaseGraph {
  chartOptions: AgChartOptions;

  constructor() {
    this.chartOptions = {};
  }

  public getChart() {
    return this.chartOptions;
  }

  abstract getGraph(data: any): AgChartOptions;

  protected getOpacity(
    value: number,
    key: any,
    minOpacity: any,
    maxOpacity: any,
    data: any
  ) {
    const [min, max] = this.getDomain(key, data);
    if (max === min) return maxOpacity; // If there's no range, return max opacity to avoid division by zero
    let alpha = (value - min) / (max - min); // Normalize value to 0-1 range
    alpha = Math.max(0, Math.min(alpha, 1)); // Clamp alpha to ensure it's within [0, 1]
    return this.mapForOpacity(alpha, 0, 1, minOpacity, maxOpacity);
  }

  protected mapForOpacity(
    value: number,
    start1: number,
    end1: number,
    start2: number,
    end2: number
  ) {
    // Scale and map value from its current range to the target range
    return ((value - start1) / (end1 - start1)) * (end2 - start2) + start2;
  }

  protected formatNumber(value: number) {
    if (isNaN(value)) return `${value}`;
    return `${value.toFixed(2)}`;
  }
  protected getGraphStructure(graphData: T_DisplayableGraph) {
    const dataDimension = Array.isArray(graphData.values[0])
      ? graphData.values[0].length
      : 1;
    const ownerCount = graphData.owners.length;
    const dataPoints = graphData.values.length;

    return { dataDimension, ownerCount, dataPoints };
  }

  protected getDomain(key: string, data: any[]) {
    const values = data.map((item) => item[key]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return [min, max];
  }
}
