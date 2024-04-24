import { AgChartOptions, AgChartTheme } from 'ag-charts-community';
import { I_LineGraphCard } from '../../interfaces/displayable-data-interface';
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
   * Gets the graph options.
   * @param lineGraphCard - The graph line data.
   * @returns The graph options.
   */
  public getGraph(lineGraphCard: I_LineGraphCard): AgChartOptions {
    return this.getOptions(lineGraphCard);
  }

  /**
   * Gets the series for the graph.
   * @param lineGraphCard - The graph line data.
   * @returns The series for the graph.
   */
  getSeries(lineGraphCard: I_LineGraphCard): any[] {
    const series: any[] = [];

    for (const owner of lineGraphCard.owners || []) {
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
        marker: {
          //Marker size should be strokeWidth*2, I think that looks good
          size: 4,
        },
        strokeWidth: 2,
      });
    }

    return series;
  }

  /**
   * Gets the graph options.
   * @param lineGraphCard - The graph line data.
   * @returns The graph options.
   */
  private getOptions(lineGraphCard: I_LineGraphCard): AgChartOptions {
    const chartOptions: AgChartOptions = {
      // Data: Data to be displayed in the chart
      data: lineGraphCard.data,
      title: {
        enabled: false,
      },
      series: this.getSeries(lineGraphCard),
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
