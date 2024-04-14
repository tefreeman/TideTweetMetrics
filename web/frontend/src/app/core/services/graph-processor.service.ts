import { inject, Injectable } from '@angular/core';
import { I_DisplayableData, I_DisplayableRequest, T_GraphType } from '../interfaces/displayable-interface';
import { DisplayProcessorService } from './display-processor.service';
import { first } from 'rxjs';


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
    const ownerCount = Object.keys(data.owners).length;
    //TODO: fix
    const firstOwner = Object.values(data.owners)[0];
    let dataPoints;
    const dataDimension = Array.isArray(firstOwner) ?
        (Array.isArray(firstOwner[0]) ? firstOwner[0].length : 1) :1;
    

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
