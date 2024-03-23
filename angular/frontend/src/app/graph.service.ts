import { Injectable } from '@angular/core';

export interface IChartData {
    labels: string[];
    datasets: IDataset[];
}

export interface IDataset {
  label: string;
  data: string[]; // Represents numbers as strings; consider using number[] if the data are always numeric
}

export interface IGraph {
  name: string;
  id: string;
  type: string; // "line", "bar"
  data: IChartData;
}

@Injectable({
  providedIn: 'root'
})

export class GraphService {

  constructor() { }

  getGraphs(): IGraph[] {
    return [{
      name: "g1",
      id: "canvas1",
      type: "line",
      data: {
        labels: ['2022-05-10', '2022-05-11', '2022-05-12', '2022-05-13',
          '2022-05-14', '2022-05-15', '2022-05-16', '2022-05-17'],
        datasets: [
          {
            label: "UA",
            data: ['467', '576', '572', '79', '92',
              '574', '573', '576'],
          },
          {
            label: "Other Universities",
            data: ['542', '542', '536', '327', '17',
              '0.00', '538', '541'],
          }
        ]
      }
    },
    {
      name: "g2",
      id: "canvas2",
      type: "line",
      data: {
        labels: ['2022-05-10', '2022-05-11', '2022-05-12', '2022-05-13',
          '2022-05-14', '2022-05-15', '2022-05-16', '2022-05-17'],
        datasets: [
          {
            label: "UA",
            data: ['467', '576', '572', '79', '92',
              '574', '573', '576'],
          },
          {
            label: "Other Universities",
            data: ['542', '542', '536', '327', '17',
              '0.00', '538', '541'],
          }
        ]
      }
    },
    {
      name: "g3",
      id: "canvas3",
      type: "line",
      data: {
        labels: ['2022-05-10', '2022-05-11', '2022-05-12', '2022-05-13',
          '2022-05-14', '2022-05-15', '2022-05-16', '2022-05-17'],
        datasets: [
          {
            label: "UA",
            data: ['467', '576', '572', '79', '92',
              '574', '573', '576'],
          },
          {
            label: "Other Universities",
            data: ['542', '542', '536', '327', '17',
              '0.00', '538', '541'],
          }
        ]
      }
    },
    {
      name: "g4",
      id: "canvas4",
      type: "bar",
      data: {
        labels: ['All Time', 'Last 3 Months', 'Last Week'],
        datasets: [
          {
            label: "UA",
            data: ['467', '576', '572'],
          },
          {
            label: "Other Universities",
            data: ['542', '542', '536'],
          }
        ]
      }
    }]
  }
}
