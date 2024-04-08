
type NumberOrString = Number | string;
export type MetricValue = NumberOrString | Array<NumberOrString>


export interface MetricOwners {
    [owner: string]: MetricValue
  };

export interface MetricsInterface {
  [stat_name: string]: MetricOwners
}




