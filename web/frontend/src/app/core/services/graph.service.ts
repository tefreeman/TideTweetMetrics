import { Injectable } from '@angular/core';
import { GraphDataInterface, GraphRequestInterface } from '../interfaces/graphs-interface';
import { MetricService } from './metric.service';


@Injectable({
  providedIn: 'root'
})


export class GraphService {
  
  constructor() {

  }

  getMetricsForGraphs(graphs: GraphRequestInterface[], metric_service: MetricService) {
    let metrics: GraphDataInterface[] = []
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
