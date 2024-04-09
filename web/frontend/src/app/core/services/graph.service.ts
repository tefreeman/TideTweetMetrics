import { Injectable } from '@angular/core';
import { I_GraphDataInterface, I_DisplayableRequest } from '../interfaces/displayable-interface';
import { MetricService } from './metric.service';


@Injectable({
  providedIn: 'root'
})


export class GraphService {
  
  constructor() {

  }

  getMetricsForGraphs(graphs: I_DisplayableRequest[], metric_service: MetricService) {
    let metrics: I_GraphDataInterface[] = []
    for (let graph of graphs) {
      let graphData = metric_service.MetricContainer.getMetricData(graph.stat_name, graph.owners);
      if (graphData.length > 0) {
        metrics.push({ ...graph, values: graphData });
      } else {
        console.log('No data for graph', graph);
      }
    }
    return metrics;
  }

}
