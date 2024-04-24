import { AgChartOptions, AgChartTheme } from 'ag-charts-community';
import { I_BarGroupedGraphCard } from '../../interfaces/displayable-data-interface';
import { BaseGraph } from './base-graph';

/**
 * Represents a large multi-bar graph.
 */
export class GraphLargeMutliBar extends BaseGraph {
  constructor() {
    super();
  }

  /**
   * Gets the graph options.
   * @param barGroupedCard - The graph data.
   * @returns The graph options.
   */
  public getGraph(barGroupedCard: I_BarGroupedGraphCard): AgChartOptions {
    return this.getOptions(barGroupedCard);
  }

  /**
   * Gets the series for the graph.
   * @param barGroupedCard - The graph data.
   * @returns The series for the graph.
   */
  getSeries(barGroupedCard: I_BarGroupedGraphCard): any[] {
    const series: any[] = [];

    for (const metricName of barGroupedCard.metricNames || []) {
      series.push({
        type: 'bar',
        xKey: 'owner',
        yKey: metricName,
        cornerRadius: 15,
        tooltip: {
          renderer: ({ datum, xKey, yKey }: any) => {
            return {
              title: datum[xKey],
              content: this.formatNumber(datum[yKey]),
            };
          },
        },
      });
    }

    return series;
  }

  /**
   * Gets the graph options.
   * @param barGroupedCard - The graph data.
   * @returns The graph options.
   */
  private getOptions(barGroupedCard: I_BarGroupedGraphCard): AgChartOptions {
    const chartOptions: AgChartOptions = {
      // Data: Data to be displayed in the chart

      data: barGroupedCard.data,
      title: {
        enabled: false,
      },
      series: this.getSeries(barGroupedCard),
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
          label: {
            formatter: ({ value }) => value,
          },
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
