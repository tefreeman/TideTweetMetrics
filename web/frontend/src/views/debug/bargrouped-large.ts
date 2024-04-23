import { AgChartOptions, AgChartTheme } from 'ag-charts-community';

/**
 * Retrieves data for the chart.
 * @returns {Array<Object>} The data for the chart.
 */
function getData() {
  const data = [
    {
      year: '@alabama_cs',
      likes: 20,
      follows: 20,
      retweets: 10,
      shares: 15,
      comments: 5,
    },
    {
      year: '@auburnidk',
      likes: 34,
      follows: 10,
      retweets: 4,
      shares: 22,
      comments: 9,
    },
    {
      year: '@otherschool',
      likes: 46,
      follows: 30,
      retweets: 20,
      shares: 35,
      comments: 15,
    },
    {
      year: '@otherschool1',
      likes: 8,
      follows: 26,
      retweets: 10,
      shares: 10,
      comments: 3,
    },
  ];

  for (let i = 1; i <= 15; i++) {
    const newEntry = {
      year: `@newSchool${i}`,
      likes: Math.floor(Math.random() * 50),
      follows: Math.floor(Math.random() * 50),
      retweets: Math.floor(Math.random() * 20),
      shares: Math.floor(Math.random() * 30), // New: Random number of shares between 0 and 29
      comments: Math.floor(Math.random() * 25), // New: Random number of comments between 0 and 24
    };
    data.push(newEntry);
  }
  return data;
}

// In the Chart3 class, update the series part of chartOptions
/**
 * Represents a chart configuration for displaying likes, follows, retweets, shares, and comments.
 */
export class Chart3 {
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
    data: getData(),
    title: {
      text: 'Likes/Follows/Retweets/Shares/Comments (Bar/Large)',
    },
    series: [
      {
        type: 'bar',
        xKey: 'year',
        yKey: 'likes',
        cornerRadius: 15,
        tooltip: {
          renderer: ({ datum, xKey, yKey }) => {
            return { title: datum[xKey], content: datum[yKey] };
          },
        },
      },
      {
        type: 'bar',
        xKey: 'year',
        yKey: 'follows',
        cornerRadius: 15,
        tooltip: {
          renderer: ({ datum, xKey, yKey }) => {
            return { title: datum[xKey], content: datum[yKey] };
          },
        },
      },
      {
        type: 'bar',
        xKey: 'year',
        yKey: 'retweets',
        cornerRadius: 15,
        tooltip: {
          renderer: ({ datum, xKey, yKey }) => {
            return { title: datum[xKey], content: datum[yKey] };
          },
        },
      },
      {
        type: 'bar', // Added for shares
        xKey: 'year',
        yKey: 'shares',
        cornerRadius: 15,
        tooltip: {
          renderer: ({ datum, xKey, yKey }) => {
            return { title: datum[xKey], content: datum[yKey] };
          },
        },
      },
      {
        type: 'bar', // Added for comments
        xKey: 'year',
        yKey: 'comments',
        cornerRadius: 15,
        tooltip: {
          renderer: ({ datum, xKey, yKey }) => {
            return { title: datum[xKey], content: datum[yKey] };
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
        label: {
          enabled: true,
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

    theme: this.chartTheme,
  };
}
