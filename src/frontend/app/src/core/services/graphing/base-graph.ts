import { AgChartOptions, AgChartTheme } from 'ag-charts-community';

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

/**
 * Base class for graphing functionality.
 */
export abstract class BaseGraph {
  chartOptions: AgChartOptions;

  constructor() {
    this.chartOptions = {};
  }

  /**
   * Get the chart options.
   * @returns The chart options.
   */
  public getChart() {
    return this.chartOptions;
  }

  /**
   * Get the graph options based on the provided data.
   * @param data - The data for the graph.
   * @returns The graph options.
   */
  abstract getGraph(data: any): AgChartOptions;

  /**
   * Get the opacity value based on the provided parameters.
   * @param value - The value to calculate opacity for.
   * @param key - The key to access the value in the data.
   * @param minOpacity - The minimum opacity value.
   * @param maxOpacity - The maximum opacity value.
   * @param data - The data to calculate the domain from.
   * @returns The opacity value.
   */
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

  /**
   * Map a value from one range to another for opacity calculation.
   * @param value - The value to map.
   * @param start1 - The start of the current range.
   * @param end1 - The end of the current range.
   * @param start2 - The start of the target range.
   * @param end2 - The end of the target range.
   * @returns The mapped value.
   */
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

  /**
   * Format a number value.
   * @param value - The number value to format.
   * @returns The formatted number value.
   */
  protected formatNumber(value: any) {
    if (typeof value !== 'number' || isNaN(value)) return `${value}`;
    return `${value.toFixed(2)}`;
  }

  /**
   * Get the structure of the graph data.
   * @param graphData - The graph data.
   * @returns The structure of the graph data.
   */

  /**
   * Get the domain (minimum and maximum values) for a given key in the data.
   * @param key - The key to access the value in the data.
   * @param data - The data to calculate the domain from.
   * @returns The domain values.
   */
  protected getDomain(key: string, data: any[]) {
    const values = data.map((item) => item[key]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return [min, max];
  }
}
