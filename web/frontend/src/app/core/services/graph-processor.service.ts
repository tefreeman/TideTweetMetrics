import { inject, Injectable } from '@angular/core';
import {
  I_DisplayableData,
  I_DisplayableRequest,
  I_GraphBarData,
  I_GraphLineData,
  I_StatCompData,
  I_StatTrendData,
  I_StatValueData,
  T_DisplayableData,
  T_GraphType,
} from '../interfaces/displayable-interface';
import { DisplayProcessorService } from './display-processor.service';
import { first } from 'rxjs';
import { T_MetricValue } from '../interfaces/metrics-interface';

@Injectable({
  providedIn: 'root',
})
export class GraphProcessorService {
  constructor() {}

  convert(data: I_DisplayableData): T_DisplayableData {
    if (data.type === 'display' || data.type === 'auto') {
      return this.decisionTree(data);
    }
    
    if (data.type === 'stat-value') {
      return this.toStatValue(data);
    }
    else if (data.type === 'stat-comp') {
      return this.toStatComparison(data);
    }
    else if (data.type === 'stat-trend') {
      return this.toStatTrend(data);
    }
    else if (data.type === 'graph-bar') {
      return this.toGraphBar(data);
    }
    else if (data.type === 'graph-line') {
      return this.toGraphLine(data);
    }
    else {
      throw new Error('Invalid data type');
    }
  }

  decisionTree(data: I_DisplayableData): T_DisplayableData {
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
      if (Array.isArray(firstOwner[0])) {
        dataPoints = firstOwner[0].length;
      } else {
        dataPoints = firstOwner.length;
      }
    } else {
      dataPoints = 1;
    }

    if (ownerCount == 1 && dataDimension == 1 && dataPoints == 1)
      return this.toStatValue(data);

    if (ownerCount == 2 && dataDimension == 1 && dataPoints == 1)
      return this.toStatComparison(data);

    if (ownerCount == 1 && dataDimension == 2 && dataPoints == 1)
      return this.toStatTrend(data);

    if (ownerCount == 1 && dataDimension == 2 && dataPoints > 1)
      return this.toGraphBar(data);

    if (ownerCount > 2 && dataDimension == 1 && dataPoints == 1)
      return this.toGraphBar(data);

    if (ownerCount > 1 && dataDimension == 2 && dataPoints > 1)
      return this.toGraphLine(data);

    console.log('Fell through decision tree, returning line-graph');
    return this.toGraphLine(data);
  }

  private toStatValue(data: I_DisplayableData): I_StatValueData {
    if (Object.keys(data.owners).length != 1) {
      throw new Error('Invalid data for stat-value');
    }

    const owner = Object.keys(data.owners)[0];
    return {
      type: 'stat-value',
      metricName: data.stat_name,
      owner: owner,
      value: data.owners[owner],
    };
  }

  private toStatComparison(data: I_DisplayableData): I_StatCompData {
    if (Object.keys(data.owners).length != 2) {
      throw new Error('Invalid data for stat-comparison');
    }

    return {
      type: 'stat-comp',
      metricName: data.stat_name,
      values: Object.values(data.owners),
      owners: Object.keys(data.owners),
    };
  }

  private toStatTrend(data: I_DisplayableData): I_StatTrendData {
    if (Object.keys(data.owners).length != 1) {
      throw new Error('Invalid data for stat-trend');
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
        owner: owner,
        times: times,
        time_period: 'monthes', // Hardcoded for now TODO: fix
        values: value_arr,
      };
    } else {
      throw new Error('Invalid data for stat-trend');
    }
  }

  private toGraphBar(data: I_DisplayableData): I_GraphBarData {
  return {
    type: 'graph-bar',
    metricName: data.stat_name,
    values: Object.values(data.owners),
    owners: Object.keys(data.owners),
  };
}

private toGraphLine(data: I_DisplayableData): I_GraphLineData {
  return {
    type: 'graph-line',
    metricName: data.stat_name,
    values: Object.values(data.owners),
    owners: Object.keys(data.owners),
  };
}

}
