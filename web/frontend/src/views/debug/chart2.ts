import { AgChartOptions, AgChartTheme } from 'ag-charts-community';

export class Chart2 {
  chartTheme: AgChartTheme = {
    palette: {
      fills: ['#e8d5b7', '#b7e8cc'],
      strokes: ['#7a4e1e', '#1e7a4e'],
    },
  };

  chartOptions: AgChartOptions = {
    // Data: Data to be displayed in the chart

    data: [
      { month: 'Jan', avgTemp: 2.3, iceCreamSales: 162000 },
      { month: 'Mar', avgTemp: 6.3, iceCreamSales: 302000 },
      { month: 'May', avgTemp: 16.2, iceCreamSales: 800000 },
      { month: 'Jul', avgTemp: 22.8, iceCreamSales: 1254000 },
      { month: 'Sep', avgTemp: 14.5, iceCreamSales: 950000 },
      { month: 'Nov', avgTemp: 8.9, iceCreamSales: 200000 },
    ],
    // Series: Defines which chart type and data to use
    series: [{ type: 'bar', xKey: 'month', yKey: 'iceCreamSales' }],

    theme: this.chartTheme,
  };
}
