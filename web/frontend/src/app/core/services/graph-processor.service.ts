import { Injectable } from '@angular/core';
import { I_DisplayableData, I_DisplayableRequest, T_GraphType } from '../interfaces/displayable-interface';
import { MetricContainer } from '../classes/metric-container';


@Injectable({
  providedIn: 'root'
})


export class GraphProcessorService {

  constructor() {

  }

  convert(data: I_DisplayableData): T_GraphType {
  if (data.type === 'auto' || data.type === 'display') {
      return this.decisionTree(data);
    }
    return data.type;
  }


  decisionTree(data: I_DisplayableData): T_GraphType {
    const ownerCount = data.owners.length;
    const dataDimension = Array.isArray(data.values[0]) ? data.values[0].length : 1;
    const dataPoints = data.values.length
  
    if (ownerCount == 1 && dataDimension == 1 && dataPoints == 1)
      return "stat-value";

    if (ownerCount == 2 && dataDimension == 1 && dataPoints == 1)
      return "stat-comparison";

    if (ownerCount == 1 && dataDimension == 1 && dataPoints > 1)
      return "stat-trend";

    if (ownerCount == 1 && dataDimension == 2 && dataPoints > 1)
      return "graph-bar"

    if (ownerCount > 2 && dataDimension == 1 && dataPoints == 1)
      return "graph-bar"

    if (ownerCount > 1 && dataDimension == 2 && dataPoints > 1)
      return "graph-line"

    console.log("Fell through decision tree, returning line-graph")
    return "graph-line";
  }
}
