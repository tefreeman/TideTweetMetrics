import { T_MetricValue } from './metrics-interface';

/**
 * @module TideTweetMetrics
 * @description This module contains interfaces related to displayable data and metrics.
 */

/**
 * Represents the value of a metric.
 */

/**
 * Represents the string type of a displayable element.
 */
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


/**

 * Represents the type of owner.
 */
export type T_OwnerType = 'all' | 'top' | 'bottom' | 'specific';

/**
 * Represents the parameters for owners.

 */
export interface I_OwnersParams {
  /**
   * The type of owner.
   */
  type: T_OwnerType;
  /**
   * The count of owners.
   */
  count?: number;
  /**
   * The list of owners.
   */
  owners: string[];
}


/**
 * Represents a displayable request.
 */

export interface I_DisplayableRequest {
  /**
   * The name of the statistic.
   */
  stat_name: string;
  /**
   * The parameters for owners.
   */
  ownersParams: I_OwnersParams;
  /**
   * The type of displayable element.
   */
  type: T_DisplayableTypeString;
}

/**
 * Represents displayable data.
 */
export interface IDisplayableData extends I_DisplayableRequest {
  /**
   * The owners and their metric values.
   */
  owners: { [owner: string]: T_MetricValue };
}

/**
 * Represents owner data.
 */
export interface I_OwnerData {
  /**
   * The owner name.
   */
  owner: string;
  /**
   * The metric value.
   */
  value: T_MetricValue;
}