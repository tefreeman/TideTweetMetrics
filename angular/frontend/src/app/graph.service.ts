import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom, map } from 'rxjs';

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
interface DataEntry {
  avg_likes: number;
}

interface ApiResponse {
  [key: string]: DataEntry;
}

@Injectable({
  providedIn: 'root'
})

export class GraphService {

  constructor(private http: HttpClient) {
  }

  getClassifierData(): Promise<Number> {
    return firstValueFrom(this.http.get<any>("http://73.58.28.154:8000/metrics/get_user_responses_count"));
  }
  getGraphsHttp(): Promise<IGraph[]> {
    return firstValueFrom(this.http.get<any>("http://73.58.28.154:8000/metrics/test/52"));
  }

  getPostLengthMetrics(): Observable<any> {
    return this.http.get<ApiResponse>("http://73.58.28.154:8000/metrics/post_length_metric/").pipe(
      map(data => {
        const labels: string[] = Object.keys(data);
        const avgLikes: number[] = Object.values(data).map(entry => entry.avg_likes);
        return {
          name: "PostLengthMetric",
          id: "PostLengthMetric",
          type: "line",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Average Likes",
                data: avgLikes,
              }
            ]
          },
          options: {
            scales: {
              y: {
                title: {
                  display: true,
                  text: "Average Likes"
                }
              },
              x: {
                title: {
                  display: true,
                  text: "Post Length" // Assuming your X axis represents post length
                }
              }
            }
          }
        };
      })
    );
  }
  

  getGraphs(): IGraph[] {
    return [
    {
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
      "name": "g2",
      "id": "canvas2",
      "type": "line",
      "data": {
        "labels": [
          '2022-05-10', '2022-05-11', '2022-05-12', '2022-05-13', '2022-05-14'
        ],
        "datasets": [
          {
            "label": "1",
            "data": ['467', '576', '572', '79', '92']
          },
          {
            "label": "2",
            "data": ['542', '542', '536', '327', '17']
          },
          {
            "label": "3",
            "data": ['231', '425', '602', '2', '31']
          },
          {
            "label": "4",
            "data": ['526', '750', '321', '452', '502']
          },
          {
            "label": "5",
            "data": ['23', '200', '421', '21', '40']
          },
          {
            "label": "6",
            "data": ['574', '573', '576', '590', '450']
          },
          {
            "label": "7",
            "data": ['0.00', '538', '541', '550', '560']
          },
          {
            "label": "8",
            "data": ['850', '750', '670', '680', '700']
          },
          {
            "label": "9",
            "data": ['400', '600', '200', '220', '240']
          },
          {
            "label": "10",
            "data": ['100', '0', '30', '50', '70']
          },
          {
            "label": "11",
            "data": ['530', '500', '480', '550', '570']
          },
          {
            "label": "12",
            "data": ['570', '580', '590', '600', '610']
          },
          {
            "label": "13",
            "data": ['720', '730', '740', '750', '760']
          },
          {
            "label": "14",
            "data": ['260', '280', '300', '320', '340']
          },
          {
            "label": "15",
            "data": ['130', '150', '170', '190', '210']
          },
          {
            "label": "16",
            "data": ['590', '600', '620', '630', '640']
          },
          {
            "label": "17",
            "data": ['780', '790', '800', '810', '820']
          },
          {
            "label": "18",
            "data": ['400', '420', '440', '460', '480']
          },
          {
            "label": "19",
            "data": ['250', '270', '290', '310', '330']
          },
          {
            "label": "20",
            "data": ['550', '570', '590', '610', '630']
          }
        ]
      }
    },
    {
      name: "g3",
      id: "canvas3",
      type: "bar",
      data: {
        labels: ['All Time', 'Last 3 Months', 'Last Week'],
        datasets: [
          {
            label: "UA",
            data: ['132', '230', '67'],
          },
          {
            label: "Other Universities",
            data: ['321', '240', '203'],
          }
        ]
      }
    },
    {
      "name": "g4",
      "id": "canvas4",
      "type": "bar",
      "data": {
        "labels": [
          '2022-05-10', '2022-05-11', '2022-05-12', '2022-05-13', '2022-05-14'
        ],
        "datasets": [
          {
            "label": "1",
            "data": ['467', '576', '572', '79', '92']
          },
          {
            "label": "2",
            "data": ['542', '542', '536', '327', '17']
          },
          {
            "label": "3",
            "data": ['231', '425', '602', '2', '31']
          },
          {
            "label": "4",
            "data": ['526', '750', '321', '452', '502']
          },
          {
            "label": "5",
            "data": ['23', '200', '421', '21', '40']
          },
          {
            "label": "6",
            "data": ['574', '573', '576', '590', '450']
          },
          {
            "label": "7",
            "data": ['0.00', '538', '541', '550', '560']
          },
          {
            "label": "8",
            "data": ['850', '750', '670', '680', '700']
          },
          {
            "label": "9",
            "data": ['400', '600', '200', '220', '240']
          },
          {
            "label": "10",
            "data": ['100', '0', '30', '50', '70']
          },
          {
            "label": "11",
            "data": ['530', '500', '480', '550', '570']
          },
          {
            "label": "12",
            "data": ['570', '580', '590', '600', '610']
          },
          {
            "label": "13",
            "data": ['720', '730', '740', '750', '760']
          },
          {
            "label": "14",
            "data": ['260', '280', '300', '320', '340']
          },
          {
            "label": "15",
            "data": ['130', '150', '170', '190', '210']
          },
          {
            "label": "16",
            "data": ['590', '600', '620', '630', '640']
          },
          {
            "label": "17",
            "data": ['780', '790', '800', '810', '820']
          },
          {
            "label": "18",
            "data": ['400', '420', '440', '460', '480']
          },
          {
            "label": "19",
            "data": ['250', '270', '290', '310', '330']
          },
          {
            "label": "20",
            "data": ['550', '570', '590', '610', '630']
          }
        ]
      }
    }
    
    ]
  }
}
