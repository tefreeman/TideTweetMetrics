import { AgChartOptions, AgChartTheme } from 'ag-charts-community';
import {
  I_GraphBarData,
  I_ScatterPlotData,
} from '../../interfaces/displayable-data-interface';
import { BaseGraph } from './base-graph';

export class GraphScatter extends BaseGraph {
  constructor() {
    super();
  }

  private isGrouped(data: I_GraphBarData): boolean {
    if (data.groupId) {
      return true;
    }
    return false;
  }

  public getGraph(data: I_ScatterPlotData): AgChartOptions {
    return this.getOptions(data);
  }

  getData(data: I_ScatterPlotData): { [key: string]: any[] } {
    const chartData: { [key: string]: any[] } = {};
    console.log('DATA: ', data);

    if (data.valuesNested && data.metricNames) {
      for (let i = 0; i < data.owners.length; i++) {
        const owner = data.owners[i];

        // Initialize with an empty array for each owner.
        const ownerDataArray: any[] = [];

        for (let j = 0; j < data.metricNames.length; j++) {
          const metricName = data.metricNames[j];
          const values = data.valuesNested[i][j];

          // Check if values is an array and has multiple data points.
          if (Array.isArray(values)) {
            // Iterate through each value in the array.
            values.forEach((value, index) => {
              // Ensure there's an object at this index.
              // If not, create a new object.
              if (!ownerDataArray[index]) {
                ownerDataArray[index] = {};
              }
              // Assign the metric name and value to the object at this index.
              ownerDataArray[index][metricName] = value;
            });
          } else {
            // If it's not an array, treat it as a single value metric.
            // Ensure there's at least one object in the ownerDataArray.
            if (ownerDataArray.length === 0) ownerDataArray.push({});
            // Assign the metric name and value to the first object.
            ownerDataArray[0][metricName] = values;
          }
        }

        chartData[owner] = ownerDataArray;
      }
    }
    console.log('GET SCATTER DATA: ', chartData);
    return chartData;
  }
  getSeries(data: I_GraphBarData): any[] {
    return [];
  }

  private getOptions(gData: I_ScatterPlotData): AgChartOptions {
    let metricOne: string;
    let metricTwo: string;
    if (gData.metricNames) {
      [metricOne, metricTwo] = gData.metricNames;
    }
    const chartOptions: AgChartOptions = {
      // Data: Data to be displayed in the chart

      title: {
        text: 'Likes (Bar/Large)',
      },
      series: Object.entries(this.getData(gData)).map(([username, data]) => ({
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
          title: {
            text: 'Likes',
          },
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
