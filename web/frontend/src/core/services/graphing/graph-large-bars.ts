import { AgChartOptions, AgChartTheme } from 'ag-charts-community';
import { I_GraphBarData } from '../../interfaces/displayable-data-interface';
import { BaseGraph } from './base-graph';

/**
 * Represents a class for creating a large bar graph.
 * @class
 */
export class GraphLargeBar extends BaseGraph {
  constructor() {
    super();
  }

  /**
   * Gets the graph options for the large bar graph.
   * @param {I_GraphBarData} data - The data for the graph.
   * @returns {AgChartOptions} The graph options.
   */
  public getGraph(data: I_GraphBarData): AgChartOptions {
    return this.getOptions(data);
  }

  /**
   * Gets the chart data for the large bar graph.
   * @param {I_GraphBarData} data - The data for the graph.
   * @returns {any[]} The chart data.
   */
  getData(data: I_GraphBarData): any[] {
    const chartData: any[] = [];

    for (let i = 0; i < data.owners.length; i++) {
      const dataOut: any = {};
      dataOut['owner'] = data.owners[i];
      dataOut['1'] = data.values[i];
      chartData.push(dataOut);
    }

    return chartData;
  }

  /**
   * Gets the bar series for the large bar graph.
   * @param {I_GraphBarData} data - The data for the graph.
   * @returns {any[]} The bar series.
   */
  getBarSeries(data: I_GraphBarData): any[] {
    return [
      {
        type: 'bar',
        xKey: 'owner',
        yKey: '1',
        cornerRadius: 15,
        /*formatter: ({ datum, yKey }: any) => ({
          fillOpacity: getOpacity(datum[yKey], yKey, 0.8, 1, getData()),
        }),
        */
        formatter: ({ datum, yKey }: any) => ({
          fillOpacity: this.getOpacity(
            datum[yKey],
            yKey,
            0.8,
            1,
            this.getData(data)
          ),
        }),
        tooltip: {
          renderer: ({ datum, xKey, yKey }: any) => {
            return { title: datum[xKey], content: datum[yKey] };
          },
        },
      },
    ];
  }

  /**
   * Gets the options for the large bar graph.
   * @param {I_GraphBarData} data - The data for the graph.
   * @returns {AgChartOptions} The graph options.
   */
  private getOptions(data: I_GraphBarData): AgChartOptions {
    const chartOptions: AgChartOptions = {
      // Data: Data to be displayed in the chart

      data: this.getData(data),
      title: {
        text: "",
      },
      series: this.getBarSeries(data),
      axes: [
        {
          type: 'category',
          position: 'bottom',
          title: {
            text: 'Accounts',
          },
          label: {
            enabled: false,
          },
        },
        {
          type: 'number',
          position: 'left',

          crosshair: {
            label: {
              renderer: ({ value }) =>
                `<div style="padding: 0 7px; border-radius: 2px; line-height: 1.7em; background-color: rgb(71,71,71); color: rgb(255, 255, 255);">${value}</div>`,
            },
          },
        },
      ],

      theme: this.getTheme(),
    };
    return chartOptions;
  }

  /**
   * Gets the theme for the large bar graph.
   * @returns {AgChartTheme} The graph theme.
   */
  private getTheme(): AgChartTheme {
    return {
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
        strokes: ['#fff'],
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
  }
}
