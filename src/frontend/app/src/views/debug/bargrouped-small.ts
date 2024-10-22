import { AgChartOptions, AgChartTheme } from 'ag-charts-community';

/**
 * Retrieves data for the bar grouped chart.
 * @returns An array of objects representing the data.
 */
function getData() {
  return [
    { year: '@alabama_cs', likes: 20, follows: 20, retweets: 10 },
    { year: '@auburnidk', likes: 34, follows: 10, retweets: 4 },
    { year: '@otherschool', likes: 46, follows: 30, retweets: 20 },
    { year: '@otherschool1', likes: 8, follows: 26, retweets: 10 },
  ];
}
/**
 * Formats a number as a string.
 * 
 * @param value - The number to format.
 * @returns The formatted number as a string.
 */
function formatNumber(value: any) {
  return `${value}`;
}

/**
 * Represents a chart configuration for displaying likes, follows, and retweets.
 */
export class Chart2 {
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

  chartOptions: AgChartOptions = {
    // Data: Data to be displayed in the chart

    data: getData(),
    title: {
      text: 'Likes and Follows',
    },
    series: [
      {
        type: 'bar',
        xKey: 'year',
        yKey: 'likes',
        cornerRadius: 15,
        label: {
          formatter: ({ value }) => formatNumber(value),
        },
        tooltip: {
          renderer: ({ datum, xKey, yKey }) => {
            return { title: datum[xKey], content: formatNumber(datum[yKey]) };
          },
        },
      },
      {
        type: 'bar',
        xKey: 'year',
        yKey: 'follows',
        cornerRadius: 15,
        label: {
          formatter: ({ value }) => formatNumber(value),
        },
        tooltip: {
          renderer: ({ datum, xKey, yKey }) => {
            return { title: datum[xKey], content: formatNumber(datum[yKey]) };
          },
        },
      },
      {
        type: 'bar',
        xKey: 'year',
        yKey: 'retweets',
        cornerRadius: 15,
        label: {
          formatter: ({ value }) => formatNumber(value),
        },
        tooltip: {
          renderer: ({ datum, xKey, yKey }) => {
            return { title: datum[xKey], content: formatNumber(datum[yKey]) };
          },
        },
      },
    ],
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
          formatter: ({ value }) => formatNumber(value),
        },
        crosshair: {
          label: {
            renderer: ({ value }) =>
              `<div style="padding: 0 7px; border-radius: 2px; line-height: 1.7em; background-color: rgb(71,71,71); color: rgb(255, 255, 255);">${formatNumber(
                value
              )}</div>`,
          },
        },
      },
    ],

    theme: this.chartTheme,
  };
}
