import { MetricValue } from "./metrics-interface";

export interface GraphRequestInterface {
    stat_name: string;
    owners: string[];
    type: "display" | "line" | "bar";
  }

export interface GraphDataInterface extends GraphRequestInterface {
  values: MetricValue[];
}
  