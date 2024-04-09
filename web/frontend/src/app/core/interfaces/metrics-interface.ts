
type NumberOrString = Number | string;
export type T_MetricValue = NumberOrString | Array<NumberOrString>


export interface I_MetricOwners {
    [owner: string]: T_MetricValue
  };

export interface I_MetricsInterface {
  [stat_name: string]: I_MetricOwners
}




