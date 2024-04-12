import { T_MetricValue } from "./metrics-interface";

export type T_GraphType =  "stat-value" | "stat-trend" | "stat-comparison" | "graph-line" | "graph-bar" | "graph-pie" |"display" | "auto";
export interface I_DisplayableRequest {
    stat_name: string;
    owners: string[];
    type: T_GraphType;
  }

export interface I_DisplayableData extends I_DisplayableRequest {
  values: T_MetricValue[];
}
  