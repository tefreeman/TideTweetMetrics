/**
 * Represents a number or string value.
 */
type NumberOrString = Number; // may need to change this to include astring later

/**
 * Represents a metric value that can be either a number, string, or an array of numbers or strings.
 */
export type T_MetricValue = NumberOrString | Array<NumberOrString>;

/**
 * Represents the owners of a metric and their corresponding metric values.
 */
export interface I_MetricOwners {
  [owner: string]: T_MetricValue;
}

/**
 * Represents the metrics interface, which contains a collection of metric names and their corresponding metric owners.
 */
export interface I_MetricsInterface {
  [stat_name: string]: I_MetricOwners;
}
