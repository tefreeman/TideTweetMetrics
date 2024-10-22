/**
 * Represents the scatter-large view.
 */
import { AgChartOptions, AgChartTheme } from 'ag-charts-community';

/**
 * Retrieves the data for scatter-large view.
 *
 * @returns An object containing data for different categories.
 */
function getData() {
  return {
    alabama_cs: [
      { likes: 10, follows: 20 },
      { likes: 14, follows: 25 },
      { likes: 108, follows: 122 },
    ],
    auburnidk: [
      { likes: 15, follows: 25 },
      { likes: 21, follows: 32 },
      { likes: 28, follows: 39 },
      { likes: 133, follows: 157 },
      { likes: 140, follows: 165 },
    ],
  };
}

/**
 * Represents a chart with scatter plot.
 */
export class Chart6 {
  /**
   * The theme of the chart.
   */
  chartTheme: AgChartTheme = {
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

  /**
   * The options of the chart.
   */
  chartOptions: AgChartOptions = {
    container: document.getElementById('myChart'),
    title: {
      text: 'Follower Count vs Likes (Scatter/large)',
    },
    theme: this.chartTheme,
    series: Object.entries(getData()).map(([username, data]) => ({
      data,
      type: 'scatter',
      xKey: 'likes',
      xName: 'Likes',
      yKey: 'follows',
      yName: 'Follows',
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
  };
}
