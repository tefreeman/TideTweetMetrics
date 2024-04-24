import { T_MetricValue } from './metrics-interface';

export type T_DisplayableTypeString =
  | 'stat-value'
  | 'stat-trend'
  | 'stat-comparison'
  | 'stat-comp'
  | 'graph-line'
  | 'display'
  | 'auto'
  | 'edit-mode'
  | 'auto-stat'
  | 'small-graph-bar'
  | 'large-graph-bar'
  | 'large-graph-bar-grouped'
  | 'small-graph-bar-grouped'
  | 'graph-scatter';

export type T_OwnerType = 'all' | 'top' | 'bottom' | 'specific';

export interface I_OwnersParams {
  type: T_OwnerType;
  count?: number;
  owners: string[];
}

export interface I_DisplayableRequest {
  stat_name: string;
  ownersParams: I_OwnersParams;
  type: T_DisplayableTypeString;
  groupId?: string;

  metric_names?: string[];
}

export interface IDisplayableData extends I_DisplayableRequest {
  owners: { [owner: string]: T_MetricValue };
}

export interface I_OwnerData {
  owner: string;
  value: T_MetricValue;
}
