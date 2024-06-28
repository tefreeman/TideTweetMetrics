import { AgChartOptions, AgChartTheme } from 'ag-charts-community';
import { I_ScatterGraphCard } from '../../interfaces/displayable-data-interface';
import { BaseGraph } from './base-graph';

export class GraphScatter extends BaseGraph {
  constructor() {
    super();
  }

  public getGraph(scatterCard: I_ScatterGraphCard): AgChartOptions {
    return this.getOptions(scatterCard);
  }

  getSeries(data: I_ScatterGraphCard): any[] {
    return [];
  }

  private getOptions(scatterCard: I_ScatterGraphCard): AgChartOptions {
    let metricOne: string;
    let metricTwo: string;
    if (scatterCard.metricNames) {
      [metricOne, metricTwo] = scatterCard.metricNames;
    }
    const chartOptions: AgChartOptions = {
      // Data: Data to be displayed in the chart

      title: {
        enabled: false,
      },
      series: Object.entries(scatterCard).map(([username, data]) => ({
        data,
        type: 'scatter',
        xKey: metricOne,
        xName: metricOne,
        yKey: metricTwo,
        yName: metricTwo,
        title: username,

        // TODO: Trevor FIX THIS
        marker: {
          size: 10,
        },
      })),
      axes: [
        {
          position: 'bottom',
          type: 'number',
          nice: false,
          crosshair: {
            label: {
              renderer: ({ value }) =>
                `<div style="padding: 0 7px; border-radius: 2px; line-height: 1.7em; background-color: rgb(71,71,71); color: rgb(255, 255, 255);">${Math.round(
                  value / 1000
                )}K</div>`,
            },
          },
        },
        {
          position: 'left',
          type: 'number',
          nice: false,
          title: {
            text: 'Follows',
          },
        },
      ],
      legend: {
        position: 'right',
        item: {
          marker: {
            size: 10,
          },
        },
      },
      theme: this.getTheme(),
    };

    return chartOptions;
  }

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
