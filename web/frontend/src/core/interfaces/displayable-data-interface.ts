import { I_DisplayableRequest, T_MetricValue } from './displayable-interface';

export type T_GridType = 'graph' | 'metric';
export type T_BaseMetricId = 'metric-value' | 'metric-trend' | 'metric-comp';
export type T_BaseCard = I_BaseMetricCard | I_BaseGraphCard;

export interface I_BaseMetricCard {
  type: T_BaseMetricId;
  metricName: string;
  data?: any;
}

export interface I_BaseMetricCardWithRequest extends I_BaseMetricCard {
  request: I_DisplayableRequest;
}

export interface I_BasicMetricCard extends I_BaseMetricCard {
  type: 'metric-value';
  owner: string;
  value: T_MetricValue;
}

export interface I_TrendMetricCard extends I_BaseMetricCard {
  type: 'metric-trend';
  owner: string;
  values: [number, number];
  times: [number, number];
}

export interface I_CompMetricCard extends I_BaseMetricCard {
  type: 'metric-comp';
  owners: [string, string];
  values: [number, number];
}

export type T_BaseGraphId =
  | 'graph-bar'
  | 'graph-bar-grouped'
  | 'graph-line'
  | 'graph-scatter';

export interface I_BaseGraphCard {
  type: T_BaseGraphId;
  metricNames: Array<string>;
  owners: Array<string>;
  data?: any;
}

export interface I_BarGraphCard extends I_BaseGraphCard {
  type: 'graph-bar';
  data: { owner: string; metricValue: number }[];
}

export interface I_BarGroupedGraphCard extends I_BaseGraphCard {
  type: 'graph-bar-grouped';
  data: { owner: string; [metricName: string]: string | number }[];
}

export interface I_LineGraphCard extends I_BaseGraphCard {
  type: 'graph-line';
  data: { time: number; [owner: string]: number }[];
}

export interface I_ScatterGraphCard extends I_BaseGraphCard {
  type: 'graph-scatter';
  data: {
    [owner: string]: {
      [metricName: string]: number;
    }[];
  };
}
