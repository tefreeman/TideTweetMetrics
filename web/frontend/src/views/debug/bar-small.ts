import { AgChartOptions, AgChartTheme } from 'ag-charts-community';

function getData() {
  return [
    { year: "@alabama_cs", visitors: 20 },
    { year: "@auburnidk", visitors: 34 },
    { year: "@otherschool", visitors: 51 },
    { year: "@otherschool1", visitors: 48 },
    { year: "@otherschool2", visitors: 47 },
    { year: "@otherschool3", visitors: 47 },
    { year: "@otherschool4", visitors: 49 },
    { year: "@otherschool5", visitors: 50 },
  ];
}
function formatNumber(value: any) {
  return `${value}`;
}

export class Chart {
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

  chartOptions: AgChartOptions = {
    // Data: Data to be displayed in the chart

    data: getData(),
  title: {
    text: "Likes (Bar/Small)",
  },
  series: [
    {
      type: "bar",
      xKey: "year",
      yKey: "visitors",
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
      type: "category",
      position: "bottom",
      title: {
        text: "Accounts",
      },
    },
    {
      type: "number",
      position: "left",
      label: {
        formatter: ({ value }) => formatNumber(value),
      },
      crosshair: {
        label: {
          renderer: ({ value }) =>
            `<div style="padding: 0 7px; border-radius: 2px; line-height: 1.7em; background-color: rgb(71,71,71); color: rgb(255, 255, 255);">${formatNumber(value)}</div>`,
        },
      },
    },
  ],

    theme: this.chartTheme,
  };
}
