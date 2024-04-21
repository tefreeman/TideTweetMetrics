import { AgChartOptions, AgChartTheme } from 'ag-charts-community';

function getData() {
    let data = [];
    for (let i = 0; i < 100; i++) { // 30 repetitions of 6 entries each = 180
      let yearLabel = `@otherschool${i}`;
      let visitors = Math.floor(Math.random() * 50); // Base number of visitors
    

      
      data.push({ year: yearLabel, visitors: visitors });
    }
    return data;
}


export class Chart1 {
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
    text: "Likes (Bar/Large)",
  },
  series: [
    {
      type: "bar",
      xKey: "year",
      yKey: "visitors",
      cornerRadius: 15,
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
