import { AgChartOptions, AgChartTheme } from 'ag-charts-community';

/**
 * Retrieves data for the bar-large view.
 * 
 * @returns An array of objects containing year and visitors data.
 */
function getData() {
  let data = [];
  for (let i = 0; i < 100; i++) { // 30 repetitions of 6 entries each = 180
    let yearLabel = `@otherschool${i}`;
    let visitors = Math.floor(Math.random() * 50); // Base number of visitors

    data.push({ year: yearLabel, visitors: visitors });
  }
  return data;
}

/**
 * Calculates the domain (minimum and maximum values) for a given key in the data array.
 * 
 * @param key - The key to calculate the domain for.
 * @param data - The data array.
 * @returns An array containing the minimum and maximum values for the given key.
 */
function getDomain(key: string, data: any[]) {
  const values = data.map(item => item[key]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return [min, max];
}

/**
 * Calculates the opacity value for a given value and key, based on the minimum and maximum values of the key in the data array.
 * 
 * @param value - The value to calculate the opacity for.
 * @param key - The key to calculate the opacity for.
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
  return map(alpha, 0, 1, minOpacity, maxOpacity);
}

/**
 * Maps a value from one range to another range.
 * 
 * @param value - The value to map.
 * @param start1 - The start of the first range.
 * @param end1 - The end of the first range.
 * @param start2 - The start of the second range.
 * @param end2 - The end of the second range.
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
 * Represents a chart with bar series displaying likes data.
 */
export class Chart1 {
  /**
   * The theme for the chart.
   */
  chartTheme: AgChartTheme = {
    baseTheme: 'ag-default',
    palette: {
      fills: ['#a51e36', '#ff7f7f', '#ffa07a', '#ffd700', '#9acd32', '#87ceeb', '#6a5acd', '#9370db', '#8a2be2', '#00ced1', '#32cd32'],
      strokes: ['#fff']
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
    }
  };

  /**
   * The options for the chart.
   */
  chartOptions: AgChartOptions = {
    data: getData(),
    title: {
      text: "Likes (Bar/Large)",
    },
    series: [
      {
        type: "bar",
        xKey: "year",
        yKey: "visitors",
        cornerRadius: 15,
        formatter: ({ datum, yKey }: any) => ({
          fillOpacity: getOpacity(datum[yKey], yKey, 0.5, 1, getData()),
        }),
        tooltip: {
          renderer: ({ datum, xKey, yKey }) => {
            return { title: datum[xKey], content: (datum[yKey]) };
          },
        },
      },
    ],
    axes: [
      {
        type: "category",
        position: "bottom",
        title: {
          text: "Accounts",
        },
        label: {
          enabled: false,
        }
      },
      {
        type: "number",
        position: "left",
        crosshair: {
          label: {
            renderer: ({ value }) =>
              `<div style="padding: 0 7px; border-radius: 2px; line-height: 1.7em; background-color: rgb(71,71,71); color: rgb(255, 255, 255);">${(value)}</div>`,
          },
        },
      },
    ],
    theme: this.chartTheme,
  };
}
