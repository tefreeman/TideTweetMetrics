import { T_MetricValue } from './metrics-interface';

export type T_DisplayableTypeString =
  | 'stat-value'
  | 'stat-trend'
  | 'stat-comparison'
  | 'stat-comp'
  | 'graph-line'
  | 'graph-bar'
  | 'graph-pie'
  | 'display'
  | 'auto'
  | 'edit-mode'
  | 'auto-stat';

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
}

export interface IDisplayableData extends I_DisplayableRequest {
  owners: { [owner: string]: T_MetricValue };
}

export interface I_OwnerData {
  owner: string;
  value: T_MetricValue;
}
