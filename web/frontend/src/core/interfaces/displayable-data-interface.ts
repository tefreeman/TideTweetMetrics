import { I_OwnersParams } from './displayable-interface';

import { T_MetricValue } from './metrics-interface';

export interface I_StatValueData {
  type: 'stat-value';
  metricName: string;
  ownersParams: I_OwnersParams;
  owner: string;
  value: T_MetricValue;
}

export interface I_StatTrendData {
  type: 'stat-trend';
  metricName: string;
  ownersParams: I_OwnersParams;
  owner: string;
  values: Array<T_MetricValue>;
  times: Array<Number>;
  time_period: string;
}

export interface I_StatCompData {
  type: 'stat-comp';
  metricName: string;
  ownersParams: I_OwnersParams;
  values: Array<T_MetricValue>;
  owners: Array<string>;
}

export interface I_GraphBarData {
  type:
    | 'small-graph-bar'
    | 'large-graph-bar'
    | 'large-graph-bar-grouped'
    | 'small-graph-bar-grouped';
  metricName: string;

  metricNames?: Array<string>;

  ownersParams: I_OwnersParams;
  values: Array<T_MetricValue>;
  valuesNested?: T_MetricValue[][];
  owners: Array<string>;

  groupId?: string;
}

export interface I_GraphLineData {
  type: 'graph-line';
  metricName: string;
  metricNames?: Array<string>;
  ownersParams: I_OwnersParams;
  values: Array<T_MetricValue>;
  valuesNested?: T_MetricValue[][];
  owners: Array<string>;
  groupId?: string;
}

export interface I_ScatterPlotData {
  type: 'graph-scatter';
  metricName: string;
  metricNames?: Array<string>;
  ownersParams: I_OwnersParams;
  values: Array<T_MetricValue>;
  valuesNested?: T_MetricValue[][];
  owners: Array<string>;
  groupId?: string;
}

export interface I_GenericGraphData {
  type: 'auto';
  metricName: string;
  metricNames?: Array<string>;
  ownersParams: I_OwnersParams;
  values: Array<T_MetricValue>;
  valuesNested?: T_MetricValue[][];
  owners: Array<string>;
  groupId?: string;
}
export type T_DisplayableStat =
  | I_StatValueData
  | I_StatTrendData
  | I_StatCompData;

export type T_GridType = 'stat' | 'graph';
export type T_GraphTypeStr =
  | 'small-graph-bar'
  | 'large-graph-bar'
  | 'large-graph-bar-grouped'
  | 'small-graph-bar-grouped'
  | 'graph-line'
  | 'graph-scatter'
  | 'auto';
export type T_DisplayableGraph =
  | I_GraphBarData
  | I_GraphLineData
  | I_ScatterPlotData;

export type T_DisplayableDataType =
  | T_DisplayableStat
  | T_DisplayableGraph
  | I_GenericGraphData;
