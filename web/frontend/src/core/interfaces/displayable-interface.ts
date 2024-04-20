import { T_MetricValue } from "./metrics-interface";

export type T_GraphType =  "stat-value" | "stat-trend" | "stat-comparison" | "stat-comp" | "graph-line" | "graph-bar" | "graph-pie" |"display" | "auto" | "edit-mode";
export type T_OwnerType = "all" | "top" | "bottom" | "specific";

export interface I_OwnerConfig {
    type: T_OwnerType;
    count?: number;
    owners: string[];
}
export interface I_DisplayableRequestEntry {
  displayables: I_DisplayableRequest[];
  type: 'graph' | 'stat';
  order: number;
}

export interface I_DisplayableRequestMap {
    [page: string]: {
      [name: string]: I_DisplayableRequestEntry;
  }
}

export interface I_DisplayableRequest {
    stat_name: string;
    ownersConfig: I_OwnerConfig;
    type: T_GraphType;
  }

export interface IDisplayableStats extends I_DisplayableRequest {
  owners: { [owner: string]: T_MetricValue}
}

export interface I_OwnerData {
  owner: string;
  value: T_MetricValue;
}

export interface I_StatValueData {
  type: "stat-value";
  metricName: string;
  owner: string;
  value: T_MetricValue;
}

export interface I_StatTrendData {
  type: "stat-trend";
  metricName: string;
  owner: string;
  values: Array<T_MetricValue>;
  times: Array<Number>;
  time_period: string;
}

export interface I_StatCompData {
  type: "stat-comp";
  metricName: string;
  values: Array<T_MetricValue>;
  owners: Array<string>;
}

export interface I_GraphBarData {
  type: "graph-bar";
  metricName: string;
  values: Array<T_MetricValue>;
  owners: Array<string>;
}

export interface I_GraphLineData {
  type: "graph-line";
  metricName: string;
  values: Array<T_MetricValue>;
  owners: Array<string>;
}


export type T_DisplayableStat = I_StatValueData | I_StatTrendData | I_StatCompData;
export type T_DisplayableGraph = I_GraphBarData | I_GraphLineData;
export type  T_DisplayableDataType = T_DisplayableStat | T_DisplayableGraph;