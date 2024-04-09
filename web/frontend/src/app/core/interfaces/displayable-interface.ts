import { T_MetricValue } from "./metrics-interface";

export interface I_DisplayableRequest {
    stat_name: string;
    owners: string[];
    type: "display" | "line" | "bar";
  }

export interface I_GraphDataInterface extends I_DisplayableRequest {
  values: T_MetricValue[];
}
  