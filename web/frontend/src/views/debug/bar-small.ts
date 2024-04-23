import { AgChartOptions, AgChartTheme } from 'ag-charts-community';

/**
 * Retrieves data for the bar chart.
 * @returns An array of objects representing the data.
 */
function getData() {
  return [
    { year: '@alabama_cs', visitors: 20 },
    { year: '@auburnidk', visitors: 34 },
    { year: '@otherschool', visitors: 51 },
    { year: '@otherschool1', visitors: 48 },
    { year: '@otherschool2', visitors: 47 },
    { year: '@otherschool3', visitors: 47 },
    { year: '@otherschool4', visitors: 49 },
    { year: '@otherschool5', visitors: 50 },
  ];
}

/**
 * Formats a number as a string.
 * @param value - The number to format.
 * @returns The formatted number as a string.
 */
function formatNumber(value: any) {
  return `${value}`;
}

/**
 * Gets the domain (minimum and maximum values) for a given key in the data.
 * @param key - The key to get the domain for.
 * @param data - The data array.
 * @returns An array containing the minimum and maximum values for the key.
 */
function getDomain(key: string, data: any[]) {
  const values = data.map((item) => item[key]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return [min, max];
}

/**
 * Calculates the opacity of a value based on its position within the domain.
 * @param value - The value to calculate the opacity for.
 * @param key - The key to calculate the domain for.
 * @param minOpacity - The minimum opacity value.
 * @param maxOpacity - The maximum opacity value.
 * @param data - The data array.
 * @returns The calculated opacity value.
 */
function getOpacity(
  value: number,
  key: any,
  minOpacity: any,
  maxOpacity: any,
  data: any
) {
  const [min, max] = getDomain(key, data);
  let alpha = Math.round(((value - min) / (max - min)) * 10) / 10;
  //console.log(min, max, value);
  return map(alpha, 0, 1, minOpacity, maxOpacity);
}

/**
 * Maps a value from one range to another range.
 * @param value - The value to map.
 * @param start1 - The start of the input range.
 * @param end1 - The end of the input range.
 * @param start2 - The start of the output range.
 * @param end2 - The end of the output range.
 * @returns The mapped value.
 */
const map = (
  value: number,
  start1: number,
  end1: number,
  start2: number,
  end2: number
) => {
  return ((value - start1) / (end1 - start1)) * (end2 - start2) + start2;
};

/**
 * Represents a chart.
 */
export class Chart {
  /**
   * The theme for the chart.
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
   * The options for the chart.
   */
  chartOptions: AgChartOptions = {
    // Data: Data to be displayed in the chart

    data: getData(),
    title: {
      text: 'Likes (Bar/Small)',
    },
    series: [
      {
        type: 'bar',
        xKey: 'year',
        yKey: 'visitors',
        cornerRadius: 15,
        /*formatter: ({ datum, yKey }: any) => ({
        fillOpacity: getOpacity(datum[yKey], yKey, 0.8, 1, getData()),
      }),
      */
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
