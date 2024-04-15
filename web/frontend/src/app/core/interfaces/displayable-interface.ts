import { T_MetricValue } from "./metrics-interface";

export type T_GraphType =  "stat-value" | "stat-trend" | "stat-comparison" | "stat-comp" | "graph-line" | "graph-bar" | "graph-pie" |"display" | "auto";
export type T_OwnerType = "all" | "top" | "bottom" | "specific";

export interface I_OwnerConfig {
    type: T_OwnerType;
    count?: number;
    owners: string[];
}

export interface I_DisplayableRequest {
    stat_name: string;
    ownersConfig: I_OwnerConfig;
    type: T_GraphType;
  }

export interface I_DisplayableData extends I_DisplayableRequest {
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

export type  T_DisplayableData = I_StatValueData | I_StatTrendData | I_StatCompData | I_GraphBarData | I_GraphLineData;