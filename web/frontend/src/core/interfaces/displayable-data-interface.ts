/**
 * Represents the parameters for the owners.
 */
import { I_OwnersParams } from './displayable-interface';

/**
 * Represents the value of a metric.
 */
import { T_MetricValue } from './metrics-interface';

/**
 * Represents the data structure for a statistical value.
 */
export interface I_StatValueData {
  /**
   * The type of data, which is 'stat-value'.
   */
  type: 'stat-value';
  /**
   * The name of the metric.
   */
  metricName: string;
  /**
   * The parameters for the owners.
   */
  ownersParams: I_OwnersParams;
  /**
   * The owner of the metric.
   */
  owner: string;
  /**
   * The value of the metric.
   */
  value: T_MetricValue;
}

/**
 * Represents the data structure for statistical trend data.
 */
export interface I_StatTrendData {
  /**
   * The type of data, which is 'stat-trend'.
   */
  type: 'stat-trend';
  /**
   * The name of the metric.
   */
  metricName: string;
  /**
   * The parameters for the owners.
   */
  ownersParams: I_OwnersParams;
  /**
   * The owner of the metric.
   */
  owner: string;
  /**
   * The values of the metric.
   */
  values: Array<T_MetricValue>;
  /**
   * The times associated with the metric values.
   */
  times: Array<Number>;
  /**
   * The time period of the metric values.
   */
  time_period: string;
}

/**
 * Represents the data structure for statistical comparison data.
 */
export interface I_StatCompData {
  /**
   * The type of data, which is 'stat-comp'.
   */
  type: 'stat-comp';
  /**
   * The name of the metric.
   */
  metricName: string;
  /**
   * The parameters for the owners.
   */
  ownersParams: I_OwnersParams;
  /**
   * The values of the metric.
   */
  values: Array<T_MetricValue>;
  /**
   * The owners of the metric.
   */
  owners: Array<string>;
}

/**
 * Represents the data structure for graph bar data.
 */
export interface I_GraphBarData {
  /**
   * The type of data, which is 'graph-bar'.
   */
  type:
    | 'small-graph-bar'
    | 'large-graph-bar'
    | 'large-graph-bar-grouped'
    | 'small-graph-bar-grouped';
  /**
   * The name of the metric.
   */
  metricName: string;
  /**
   * The parameters for the owners.
   */

  metricNames?: Array<string>;

  ownersParams: I_OwnersParams;
  /**
   * The values of the metric.
   */
  values: Array<T_MetricValue>;
  valuesNested?: T_MetricValue[][];
  /**
   * The owners of the metric.
   */
  owners: Array<string>;

  groupId?: string;
}

/**
 * Represents the data structure for graph line data.
 */
export interface I_GraphLineData {
  /**
   * The type of data, which is 'graph-line'.
   */
  type: 'graph-line';
  /**
   * The name of the metric.
   */
  metricName: string;
  /**
   * The parameters for the owners.
   */
  metricNames?: Array<string>;
  ownersParams: I_OwnersParams;
  /**
   * The values of the metric.
   */
  values: Array<T_MetricValue>;
  valuesNested?: T_MetricValue[][];
  /**
   * The owners of the metric.
   */
  owners: Array<string>;
  /**
   * The Group ID for grouping metric Requests
   */
  groupId?: string;
}

export interface I_ScatterPlotData {
  /**
   * The type of data, which is 'scatter-line'.
   */
  type: 'graph-scatter';
  /**
   * The name of the metric.
   */
  metricName: string;
  /**
   * The parameters for the owners.
   */
  metricNames?: Array<string>;
  ownersParams: I_OwnersParams;
  /**
   * The values of the metric.
   */
  values: Array<T_MetricValue>;
  valuesNested?: T_MetricValue[][];
  /**
   * The owners of the metric.
   */
  owners: Array<string>;
  /**
   * The Group ID for grouping metric Requests
   */
  groupId?: string;
}

export interface I_GenericGraphData {
  /**
   * The type of data, which is 'scatter-line'.
   */
  type: 'auto';
  /**
   * The name of the metric.
   */
  metricName: string;
  /**
   * The parameters for the owners.
   */
  metricNames?: Array<string>;
  ownersParams: I_OwnersParams;
  /**
   * The values of the metric.
   */
  values: Array<T_MetricValue>;
  valuesNested?: T_MetricValue[][];
  /**
   * The owners of the metric.
   */
  owners: Array<string>;
  /**
   * The Group ID for grouping metric Requests
   */
  groupId?: string;
}
/**
 * Represents the type for displayable statistical data.
 */
export type T_DisplayableStat =
  | I_StatValueData
  | I_StatTrendData
  | I_StatCompData;

/**
 * Represents the type for grid data.
 */
export type T_GridType = 'stat' | 'graph';
export type T_GraphTypeStr =
  | 'small-graph-bar'
  | 'large-graph-bar'
  | 'large-graph-bar-grouped'
  | 'small-graph-bar-grouped'
  | 'graph-line'
  | 'graph-scatter'
  | 'auto';
/**
 * Represents the type for displayable graph data.
 */
export type T_DisplayableGraph =
  | I_GraphBarData
  | I_GraphLineData
  | I_ScatterPlotData;

/**
 * Represents the type for displayable data.
 */
export type T_DisplayableDataType =
  | T_DisplayableStat
  | T_DisplayableGraph
  | I_GenericGraphData;
