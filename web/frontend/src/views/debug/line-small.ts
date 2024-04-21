import { AgChartOptions, AgChartTheme } from 'ag-charts-community';

function getData() {
  return [
    {
        month: 1,
        alabama_cs: 1,
        auburnidk: 2,
        otherschool: 3,
        otherschool1: 4,
      },
      {
        month: 2,
        alabama_cs: 2,
        auburnidk: 3,
        otherschool: 4,
        otherschool1: 5,
      },
      {
        month: 3,
        alabama_cs: 3,
        auburnidk: 4,
        otherschool: 5,
        otherschool1: 6,
      },
      {
        month: 4,
        alabama_cs: 1,
        auburnidk: 2,
        otherschool: 3,
        otherschool1: 4,
      },
      {
        month: 5,
        alabama_cs: 4,
        auburnidk: 5,
        otherschool: 6,
        otherschool1: 7,
      },
  ];
}
function formatNumber(value: any) {
  return `${value}`;
}

export class Chart4 {
  chartTheme: AgChartTheme = {
    baseTheme: 'ag-default',
    palette: {
        fills: ['#a51e36', '#ff7f7f', '#ffa07a', '#ffd700', '#9acd32', '#87ceeb', '#6a5acd', '#9370db', '#8a2be2', '#00ced1', '#32cd32'],      
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
        text: "Likes per Month",
    },
    series: [
    {
        type: "line",
        xKey: "month",
        xName: "Month",
        yKey: "alabama_cs",
        yName: "@alabama_cs",
        tooltip: {
            renderer: ({ datum, yName, xKey, yKey }) => {
            return { title: `${yName}: ${datum[xKey]}`, content: datum[yKey] };
            },
        },
    },
    {
      type: "line",
      xKey: "month",
      xName: "Month",
      yKey: "auburnidk",
      yName: "@auburnidk",
      tooltip: {
        renderer: ({ datum, yName, xKey, yKey }) => {
        return { title: `${yName}: ${datum[xKey]}`, content: datum[yKey] };
        },
    },
    },
    {
      type: "line",
      xKey: "month",
      xName: "Month",
      yKey: "otherschool",
      yName: "@otherschool",
      tooltip: {
        renderer: ({ datum, yName, xKey, yKey }) => {
        return { title: `${yName}: ${datum[xKey]}`, content: datum[yKey] };
        },
    },
    },
    {
        type: "line",
        xKey: "month",
        xName: "Month",
        yKey: "otherschool1",
        yName: "@otherschool1",
        tooltip: {
            renderer: ({ datum, yName, xKey, yKey }) => {
            return { title: `${yName}: ${datum[xKey]}`, content: datum[yKey] };
            },
        },
    },
    
  ],
  axes: [
    {
      position: "bottom",
      type: "category",
      title: {
        text: "Month",
      },
    },
    {
      position: "left",
      type: "number",
      title: {
        text: "Likes",
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
