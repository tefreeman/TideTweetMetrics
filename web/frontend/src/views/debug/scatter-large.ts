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
      { likes: 19, follows: 29 },
      { likes: 23, follows: 35 },
      { likes: 30, follows: 40 },
      { likes: 34, follows: 46 },
      { likes: 41, follows: 50 },
      { likes: 45, follows: 56 },
      { likes: 50, follows: 60 },
      { likes: 55, follows: 66 },
      { likes: 60, follows: 70 },
      { likes: 66, follows: 76 },
      { likes: 70, follows: 82 },
      { likes: 76, follows: 87 },
      { likes: 82, follows: 93 },
      { likes: 88, follows: 98 },
      { likes: 93, follows: 104 },
      { likes: 97, follows: 110 },
      { likes: 103, follows: 116 },
      { likes: 108, follows: 122 },
    ],
    auburnidk: [
      { likes: 15, follows: 25 },
      { likes: 21, follows: 32 },
      { likes: 28, follows: 39 },
      { likes: 35, follows: 47 },
      { likes: 41, follows: 53 },
      { likes: 48, follows: 61 },
      { likes: 54, follows: 68 },
      { likes: 61, follows: 76 },
      { likes: 67, follows: 83 },
      { likes: 74, follows: 91 },
      { likes: 80, follows: 98 },
      { likes: 87, follows: 106 },
      { likes: 93, follows: 113 },
      { likes: 100, follows: 121 },
      { likes: 107, follows: 128 },
      { likes: 113, follows: 136 },
      { likes: 120, follows: 143 },
      { likes: 126, follows: 150 },
      { likes: 133, follows: 157 },
      { likes: 140, follows: 165 },
    ],
    newSchool1: Array.from({ length: 20 }, (_, i) => ({ likes: 12 + 10 * i, follows: 22 + 10 * i })),
    newSchool2: Array.from({ length: 20 }, (_, i) => ({ likes: 18 + 10 * i, follows: 28 + 10 * i })),
    newSchool3: Array.from({ length: 20 }, (_, i) => ({ likes: 11 + 10 * i, follows: 21 + 10 * i })),
    newSchool4: Array.from({ length: 20 }, (_, i) => ({ likes: 10 + 10 * i, follows: 25 + 10 * i })),
    newSchool5: Array.from({ length: 20 }, (_, i) => ({ likes: 17 + 10 * i, follows: 27 + 10 * i })),
    newSchool6: Array.from({ length: 20 }, (_, i) => ({ likes: 5 + 10 * i, follows: 15 + 10 * i })),
    newSchool7: Array.from({ length: 20 }, (_, i) => ({ likes: 8 + 10 * i, follows: 18 + 10 * i })),

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
   * The options of the chart.
   */
  chartOptions: AgChartOptions = {
    container: document.getElementById("myChart"),
    title: {
      text: "Follower Count vs Likes (Scatter/large)",
    },
    theme: this.chartTheme,
    series: Object.entries(getData()).map(([username, data]) => ({
      data,
      type: "scatter",
      xKey: "likes",
      xName: "Likes",
      yKey: "follows",
      yName: "Follows",
      title: username,

      // TODO: Trevor FIX THIS
      marker: {
        size: 10,
      },
    })),
    axes: [
      {
        position: "bottom",
        type: "number",
        nice: false,
        title: {
          text: "Likes",
        },
        crosshair: {
          label: {
            renderer: ({ value }) =>
              `<div style="padding: 0 7px; border-radius: 2px; line-height: 1.7em; background-color: rgb(71,71,71); color: rgb(255, 255, 255);">${Math.round(value / 1000)}K</div>`,
          },
        },
      },
      {
        position: "left",
        type: "number",
        nice: false,
        title: {
          text: "Follows",
        },
      },
    ],
    legend: {
      position: "right",
      item: {
        marker: {
          size: 10,
        },
      },
    },
  };
}
