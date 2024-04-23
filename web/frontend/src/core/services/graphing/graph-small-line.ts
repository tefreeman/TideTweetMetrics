import { AgChartOptions, AgChartTheme } from 'ag-charts-community';
import { I_GraphLineData } from '../../interfaces/displayable-data-interface';
import { BaseGraph } from './base-graph';

/**
 * Represents a small line graph.
 * @extends BaseGraph
 */
export class GraphSmallLine extends BaseGraph {
  constructor() {
    super();
  }

  /**
   * Checks if the data is grouped.
   * @param data - The graph line data.
   * @returns True if the data is grouped, false otherwise.
   */
  private isGrouped(data: I_GraphLineData): boolean {
    if (data.groupId) {
      return true;
    }
    return false;
  }

  /**
   * Gets the graph options.
   * @param data - The graph line data.
   * @returns The graph options.
   */
  public getGraph(data: I_GraphLineData): AgChartOptions {
    return this.getOptions(data);
  }

  /**
   * Gets the chart data.
   * @param data - The graph line data.
   * @returns The chart data.
   */
  getData(data: I_GraphLineData): any[] {
    const chartData: any[] = [];
    console.log('DATA-SMALLINE: ', data);
    if (data.values) {
      //@ts-ignore
      for (let i = 0; i < data.values[0].length; i++) {
        const dataOut: any = {};

        for (let j = 0; j < data.owners.length; j++) {
          const owner = data.owners[j];
          //@ts-ignore
          const valueArray = data.values[j][i] as any[];
          const epochTime = valueArray[0];
          const value = valueArray[1];

          if (!dataOut.time) {
            dataOut.time = epochTime;
          }

          dataOut[owner] = value;
        }

        chartData.push(dataOut);
      }
    }
    console.log('DATA-SMALL-OUT: ', chartData);
    return chartData;
  }

  /**
   * Gets the series for the graph.
   * @param data - The graph line data.
   * @returns The series for the graph.
   */
  getSeries(data: I_GraphLineData): any[] {
    const series: any[] = [];

    for (const owner of data.owners || []) {
      series.push({
        type: 'line',
        xKey: 'time',
        xName: 'Time',
        yKey: owner,
        yName: '@' + owner,
        tooltip: {
          renderer: ({ datum, xName, yName, xKey, yKey }: any) => {
            return {
              title: `${yName}: ${xName} ${datum[xKey]}`,
              content: datum[yKey],
            };
          },
        },
        marker: {   //Marker size should be strokeWidth*2, I think that looks good
          size: 4,
        },
        strokeWidth: 2,
      });
    }

    return series;
  }

  /**
   * Gets the graph options.
   * @param data - The graph line data.
   * @returns The graph options.
   */
  private getOptions(data: I_GraphLineData): AgChartOptions {
    const chartOptions: AgChartOptions = {
      // Data: Data to be displayed in the chart
      data: this.getData(data),
      title: {
        text: 'Likes (Bar/Large)',
      },
      series: this.getSeries(data),
      axes: [
        {
          type: 'time',
          position: 'bottom',
          title: {
            text: 'Time',
          },
        },
        {
          type: 'number',
          position: 'left',
          label: {
            formatter: ({ value }) => this.formatNumber(value),
          },
          crosshair: {
            label: {
              renderer: ({ value }) =>
                `<div style="padding: 0 7px; border-radius: 2px; line-height: 1.7em; background-color: rgb(71,71,71); color: rgb(255, 255, 255);">${this.formatNumber(
                  value
                )}</div>`,
            },
          },
        },
      ],

      theme: this.getTheme(),
    };
    return chartOptions;
  }

  /**
   * Gets the graph theme.
   * @returns The graph theme.
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
