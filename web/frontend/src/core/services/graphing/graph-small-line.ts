import { AgChartOptions, AgChartTheme } from 'ag-charts-community';
import { I_GraphBarData } from '../../interfaces/displayable-data-interface';
import { BaseGraph } from './base-graph';

export class GraphSmallLine extends BaseGraph {
  constructor() {
    super();
  }

  private isGrouped(data: I_GraphBarData): boolean {
    if (data.groupId) {
      return true;
    }
    return false;
  }

  public getGraph(data: I_GraphBarData): AgChartOptions {
    return this.getOptions(data);
  }

  getData(data: I_GraphBarData): any[] {
    const chartData: any[] = [];
    console.log('DATA: ', data);

    for (let i = 0; i < data.owners.length; i++) {
      const dataOut: any = {};
      dataOut['owner'] = data.owners[i];

      if (data.valuesNested) {
        for (let j = 0; j < data.metricNames!.length; j++) {
          const metricName = data.metricNames![j];
          const value = data.valuesNested[i][j];
          dataOut[metricName] = value;
        }
      }

      chartData.push(dataOut);
    }

    return chartData;
  }

  getSeries(data: I_GraphBarData): any[] {
    const series: any[] = [];

    for (const owner of data.owners || []) {
      series.push({
        time: 'line',
        xKey: 'month',
        xName: 'Month',
        yKey: owner,
        yName: '@' + owner,
        tooltip: {
          renderer: ({ datum, xName, yName, xKey, yKey }) => {
            return {
              title: `${yName}: ${xName} ${datum[xKey]}`,
              content: datum[yKey],
            };
          },
        },
      });
    }

    return series;
  }

  private getOptions(data: I_GraphBarData): AgChartOptions {
    const chartOptions: AgChartOptions = {
      // Data: Data to be displayed in the chart

      data: this.getData(data),
      title: {
        text: 'Likes (Bar/Large)',
      },
      series: this.getSeries(data),
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
