import { inject } from '@angular/core';
import { AgChartOptions, AgChartTheme } from 'ag-charts-community';
import { I_BarGraphCard } from '../../interfaces/displayable-data-interface';
import { KeyTranslatorService } from '../key-translator.service';
import { BaseGraph } from './base-graph';

/**
 * Represents a class for creating a large bar graph.
 * @class
 */
export class GraphLargeBar extends BaseGraph {
  private keyt: KeyTranslatorService = inject(KeyTranslatorService);

  constructor() {
    super();
  }

  /**
   * Gets the graph options for the large bar graph.
   * @param {I_BarGraphCard} barCard - The data for the graph.
   * @returns {AgChartOptions} The graph options.
   */
  public getGraph(barCard: I_BarGraphCard): AgChartOptions {
    return this.getOptions(barCard);
  }

  /**
   * Gets the bar series for the large bar graph.
   * @param {I_BarGraphCard} bardCard - The data for the graph.
   * @returns {any[]} The bar series.
   */
  getBarSeries(bardCard: I_BarGraphCard): any[] {
    return [
      {
        type: 'bar',
        xKey: 'owner',
        yKey: 'metricValue',
        YName: 'value',
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
            bardCard.data
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
   * @param {I_BarGraphCard} barCard - The data for the graph.
   * @returns {AgChartOptions} The graph options.
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
