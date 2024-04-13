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

  export interface I_OwnerData {
    owner: string;
    value: T_MetricValue;

}
export interface I_DisplayableData extends I_DisplayableRequest {
  owners: { [owner: string]: T_MetricValue}
}
  