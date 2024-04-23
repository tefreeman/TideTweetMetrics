import { Injectable } from '@angular/core';
import {
  I_GenericGraphData,
  I_GraphBarData,
  I_GraphLineData,
  I_ScatterPlotData,
  I_StatCompData,
  I_StatTrendData,
  I_StatValueData,
  T_DisplayableDataType,
} from '../../interfaces/displayable-data-interface';
import { IDisplayableData } from '../../interfaces/displayable-interface';
import { T_MetricValue } from '../../interfaces/metrics-interface';

/**
 * Service responsible for processing displayable data.
 */
@Injectable({
  providedIn: 'root',
})
export class DisplayableProcessorService {
  constructor() {}

  /**
   * Converts the given displayable data to the corresponding displayable type.
   * @param data The displayable data to convert.
   * @returns The converted displayable data or null if conversion fails.
   * @throws Error if the data type is invalid.
   */
  convert(data: IDisplayableData): T_DisplayableDataType | null {
    if (
      data.type === 'display' ||
      data.type === 'auto' ||
      data.type === 'auto-stat'
    ) {
      return this.decisionTree(data);
    }

    if (data.type === 'stat-value') {
      return this.toStatValue(data);
    } else if (data.type === 'stat-comp') {
      return this.toStatComparison(data);
    } else if (data.type === 'stat-trend') {
      return this.toStatTrend(data);
    } else if (data.type === 'small-graph-bar') {
      return this.toSmallGraphBar(data);
    } else if (data.type === 'large-graph-bar') {
      return this.toLareGraphBar(data);
    } else if (data.type === 'small-graph-bar-grouped') {
      return this.toSmallGraphBarGrouped(data);
    } else if (data.type === 'large-graph-bar-grouped') {
      return this.toLargeGraphBarGrouped(data);
    } else if (data.type === 'graph-scatter') {
      return this.toScatterPlot(data);
    } else if (data.type === 'graph-line') {
      return this.toGraphLine(data);
    } else {
      throw new Error('Invalid data type');
    }
  }

  /**
   * Processes the displayable data using a decision tree and returns the corresponding displayable type.
   * @param data The displayable data to process.
   * @returns The processed displayable data or null if processing fails.
   */
  decisionTree(data: IDisplayableData): T_DisplayableDataType | null {
    const ownerCount = Object.keys(data.owners).length;
    //TODO: fix
    const firstOwner = Object.values(data.owners)[0];
    let dataPoints;
    const dataDimension = Array.isArray(firstOwner)
      ? Array.isArray(firstOwner[0])
        ? firstOwner[0].length
        : 1
      : 1;

    // TODO: upgrade this to a switch statement
    if (Array.isArray(firstOwner)) {
      dataPoints = firstOwner.length;
    } else {
      dataPoints = 1;
    }

    if (data.type === 'auto-stat') {
      if (ownerCount == 1 && dataDimension == 1 && dataPoints == 1)
        return this.toStatValue(data);

      if (ownerCount == 2 && dataDimension == 1 && dataPoints == 1)
        return this.toStatComparison(data);

      if (ownerCount == 1 && dataDimension == 2 && dataPoints > 1)
        return this.toStatTrend(data);

      // we can't fall through to the next if statement if auto-stat
      return this.toStatValue(data);
    }
    return this.genericGraphData(data);
  }

  /**
   * Converts the displayable data to the stat-value type.
   * @param data The displayable data to convert.
   * @returns The converted stat-value data or null if conversion fails.
   */
  private toStatValue(data: IDisplayableData): I_StatValueData | null {
    if (Object.keys(data.owners).length < 1) {
      console.log('Invalid data for stat-value');
      return null;
    }

    if (typeof data.stat_name !== 'string') {
      console.log('Invalid data for stat-value');
      return null;
    }

    const owner = Object.keys(data.owners)[0];
    return {
      type: 'stat-value',
      metricName: data.stat_name,
      ownersParams: data.ownersParams,
      owner: owner,
      value: data.owners[owner],
    };
  }

  /**
   * Converts the displayable data to the stat-comp type.
   * @param data The displayable data to convert.
   * @returns The converted stat-comp data or null if conversion fails.
   */
  // Jerry rigged this to work need to go over
  private toStatComparison(data: IDisplayableData): I_StatCompData | null {
    if (Object.keys(data.owners).length != 2) {
      console.log('Invalid data for stat-comp');
      return null;
    }

    if (typeof data.stat_name !== 'string') {
      console.log('Invalid data for stat-value');
      return null;
    }
    const values = Object.values(data.owners).map((value) => {
      return Array.isArray(value) ? value[value.length - 1] : value;
    });

    if (
      values.length !== 2 ||
      Array.isArray(values[0]) ||
      Array.isArray(values[1])
    ) {
      console.log('Invalid data for stat-comp');
      return null;
    }

    console.log('VALUE: ', values);
    return {
      type: 'stat-comp',
      metricName: data.stat_name,
      ownersParams: data.ownersParams,
      values: values, // Directly use the processed 'values' array
      owners: Object.keys(data.owners),
    };
  }

  /**
   * Converts the displayable data to the stat-trend type.
   * @param data The displayable data to convert.
   * @returns The converted stat-trend data or null if conversion fails.
   */
  private toStatTrend(data: IDisplayableData): I_StatTrendData | null {
    console.log('TREND: ', data);

    if (Object.keys(data.owners).length != 1) {
      console.log('Invalid data for stat-trend');
      return null;
    }

    if (typeof data.stat_name !== 'string') {
      console.log('Invalid data for stat-value');
      return null;
    }
    const owner = Object.keys(data.owners)[0];
    const values: T_MetricValue[] = Object.values(
      data.owners
    )[0] as T_MetricValue[];

    const times: T_MetricValue = [];
    const value_arr: T_MetricValue[] = [];

    values.forEach(([val1, val2]: any) => {
      times.push(val1);
      value_arr.push(val2);
    });

    if (Array.isArray(values)) {
      return {
        type: 'stat-trend',
        metricName: data.stat_name,
        ownersParams: data.ownersParams,
        owner: owner,
        times: times,
        time_period: 'monthes', // Hardcoded for now TODO: fix
        values: value_arr,
      };
    } else {
      throw new Error('Invalid data for stat-trend');
    }
  }

  private genericGraphData(data: IDisplayableData): I_GenericGraphData {
    return {
      type: 'auto',
      metricName: data.stat_name,
      ownersParams: data.ownersParams,
      values: Object.values(data.owners),
      owners: Object.keys(data.owners),
    };
  }
  /**
   * Converts the displayable data to the graph-bar type.
   * @param data The displayable data to convert.
   * @returns The converted graph-bar data.
   */
  private toSmallGraphBar(data: IDisplayableData): I_GraphBarData {
    return {
      type: 'small-graph-bar',
      metricName: data.stat_name,
      ownersParams: data.ownersParams,
      values: Object.values(data.owners),
      owners: Object.keys(data.owners),
    };
  }

  private toLareGraphBar(data: IDisplayableData): I_GraphBarData {
    return {
      type: 'large-graph-bar',
      metricName: data.stat_name,
      ownersParams: data.ownersParams,
      values: Object.values(data.owners),
      owners: Object.keys(data.owners),
    };
  }

  private toSmallGraphBarGrouped(data: IDisplayableData): I_GraphBarData {
    return {
      type: 'small-graph-bar-grouped',
      metricName: data.stat_name,
      ownersParams: data.ownersParams,
      values: Object.values(data.owners),
      owners: Object.keys(data.owners),
    };
  }

  private toLargeGraphBarGrouped(data: IDisplayableData): I_GraphBarData {
    return {
      type: 'large-graph-bar-grouped',
      metricName: data.stat_name,
      ownersParams: data.ownersParams,
      values: Object.values(data.owners),
      owners: Object.keys(data.owners),
    };
  }
  /**
   * Converts the displayable data to the graph-line type.
   * @param data The displayable data to convert.
   * @returns The converted graph-line data.
   */
  private toGraphLine(data: IDisplayableData): I_GraphLineData {
    return {
      type: 'graph-line',
      metricName: data.stat_name,
      ownersParams: data.ownersParams,
      values: Object.values(data.owners),
      owners: Object.keys(data.owners),
    };
  }

  private toScatterPlot(data: IDisplayableData): I_ScatterPlotData {
    return {
      type: 'graph-scatter',
      metricName: data.stat_name,
      ownersParams: data.ownersParams,
      values: Object.values(data.owners),
      owners: Object.keys(data.owners),
    };
  }
}
