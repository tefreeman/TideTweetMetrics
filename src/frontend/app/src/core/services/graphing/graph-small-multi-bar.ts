import { inject } from '@angular/core';
import { AgChartOptions, AgChartTheme } from 'ag-charts-community';
import { I_BarGroupedGraphCard } from '../../interfaces/displayable-data-interface';
import { KeyTranslatorService } from '../key-translator.service';
import { BaseGraph } from './base-graph';

/**
 * Represents a small multi-bar graph.
 */
export class GraphSmallMultiBar extends BaseGraph {
  private keyt: KeyTranslatorService = inject(KeyTranslatorService);

  constructor() {
    super();
  }

  /**
   * Gets the graph options.
   * @param barGroupCard - The graph bar data.
   * @returns The graph options.
   */
  public getGraph(barGroupCard: I_BarGroupedGraphCard): AgChartOptions {
    return this.getOptions(barGroupCard);
  }

  /**
   * Gets the series for the graph.
   * @param barGroupedCard - The graph bar data.
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
        label: {
          formatter: ({ value }: any) => this.formatNumber(value),
        },
        tooltip: {
          renderer: ({ datum, xKey, yKey }: any) => {
            return {
              title: this.keyt.keyToFullString(datum[xKey]),
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
   * @param barGroupedCard - The graph bar data.
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
