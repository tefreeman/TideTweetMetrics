import { inject } from '@angular/core';
import { AgChartOptions, AgChartTheme } from 'ag-charts-community';
import { I_BarGraphCard } from '../../interfaces/displayable-data-interface';
import { KeyTranslatorService } from '../key-translator.service';
import { BaseGraph } from './base-graph';

/**
 * Represents a small bar graph for displaying likes data.
 */
export class GraphSmallBar extends BaseGraph {
  private keyt: KeyTranslatorService = inject(KeyTranslatorService);

  constructor() {
    super();
  }

  /**
   * Generates the graph options for the small bar graph.
   * @param data - The data used to generate the graph.
   * @returns The graph options.
   */
  public getGraph(data: I_BarGraphCard): AgChartOptions {
    return this.getOptions(data);
  }

  /**
   * Generates the bar series for the small bar graph.
   * @param data - The data used to generate the bar series.
   * @returns The bar series.
   */
  getBarSeries(data: I_BarGraphCard): any[] {
    return [
      {
        type: 'bar',
        xKey: 'owner',
        yKey: 'metricValue',
        yName: 'value',
        cornerRadius: 15,
        /*formatter: ({ datum, yKey }: any) => ({
          fillOpacity: getOpacity(datum[yKey], yKey, 0.8, 1, getData()),
        }),
        */
        label: {
          formatter: ({ value }: any) => this.formatNumber(value),
        },
        tooltip: {
          renderer: ({ datum, xKey, yKey }: any) => {
            return {
              title: datum[xKey],
              content: this.formatNumber(datum[yKey]),
            };
          },
        },
      },
    ];
  }

  /**
   * Generates the graph options for the small bar graph.
   * @param barCard - The data used to generate the graph options.
   * @returns The graph options.
   */
  private getOptions(barCard: I_BarGraphCard): AgChartOptions {
    const chartOptions: AgChartOptions = {
      // Data: Data to be displayed in the chart
      data: barCard.data,
      title: {
        text: this.keyt.keyToFullString(barCard.metricNames[0]),
      },
      series: this.getBarSeries(barCard),
      axes: [
        {
          type: 'category',
          position: 'bottom',
          title: {
            text: 'Accounts',
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
   * Retrieves the theme for the small bar graph.
   * @returns The theme.
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
