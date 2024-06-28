import { T_BaseGraphId, T_BaseMetricId } from './displayable-data-interface';

export type T_DisplayableTypeString =
  | 'edit-mode'
  | 'auto-stat'
  | 'auto-graph'
  | T_BaseMetricId
  | T_BaseGraphId;

export type T_OwnerType = 'all' | 'top' | 'bottom' | 'specific';

export interface I_OwnersParams {
  type: T_OwnerType;
  count?: number;
  owners: string[];
}

export interface I_DisplayableRequest {
  metricNames: string[];
  ownersParams: I_OwnersParams;
  type: T_DisplayableTypeString;
}

export interface I_MetricSubset {
  [metricName: string]: I_OwnerKeyVal;
}

export interface I_OwnerKeyVal {
  [owner: string]: T_MetricValue;
}

export type T_MetricValue = number | number[] | [string | number, number][];

export interface I_MetricJsonData extends I_MetricSubset {}
