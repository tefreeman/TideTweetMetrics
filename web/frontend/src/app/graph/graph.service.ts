import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

type NumberOrString = Number | string;
export type MetricValue = NumberOrString | Array<NumberOrString>
export interface Metrics {
  [stat_name: string]: MetricOwners
};

export interface MetricOwners {
  [owner: string]: MetricValue
};

export interface GraphRequest {
  stat_name: string;
  owners: string[];
  type: "display" | "line" | "bar";
}

@Injectable({
  providedIn: 'root'
})


export class GraphService {
  private _metrics: Metrics = {"tweet_count-sum": {"alabama_cs": 1000, "auburn_cs": 2000}, "tweet_count-avg": {"alabama_cs": 100, "auburn_cs": 200}, "tweet_count-max": {"alabama_cs": 10000, "auburn_cs": 20000}, "tweet_count-min": {"alabama_cs": 10, "auburn_cs": 20}, "tweet_count_std": {"alabama_cs": 100, "auburn_cs": 200}, "tweet_count_var": {"alabama_cs": 10000, "auburn_cs": 20000}};
  private _graphRequests: GraphRequest[] = [{stat_name: "tweet_count-sum", owners: ["alabama_cs"], type: "display"}];
  constructor() { }


  getStatKeys(): string[] {
    return this._metrics ? Object.keys(this._metrics) : [];
  }

  getOwnersForStat(stat_name: string): string[] {
    if (this._metrics && this._metrics[stat_name])
      return Object.keys(this._metrics[stat_name]);
    return [];
  }

  getMetricData(stat_name: string, owners: string[]): MetricValue[] {
    let metrics: MetricValue[] = []
    for (let owner of owners) {
      if (this._metrics && this._metrics[stat_name] && this._metrics[stat_name][owner])
        metrics.push(this._metrics[stat_name][owner]);
    }
    return metrics;
  }

  setMetrics(metrics: Metrics): void {
    this._metrics = metrics;
  }

  getGraphRequests(): GraphRequest[] {
    return this._graphRequests;
  }

}
