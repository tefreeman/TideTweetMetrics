import { T_MetricValue } from "./metrics-interface";

export interface I_DisplayableRequest {
    stat_name: string;
    owners: string[];
    type: "stat-value" | "stat-trend" | "stat-comparsion" | "line" | "bar" | "display";
  }

export interface I_DisplayableData extends I_DisplayableRequest {
  values: T_MetricValue[];
}
  