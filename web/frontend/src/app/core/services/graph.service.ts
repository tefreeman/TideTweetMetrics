import { Injectable } from '@angular/core';
import { I_DisplayableData, I_DisplayableRequest } from '../interfaces/displayable-interface';
import { MetricContainer } from '../classes/metric-container';


@Injectable({
  providedIn: 'root'
})


export class GraphService {

  constructor() {

  }

  getMetricsForGraphs(graphs: I_DisplayableRequest[], metricContainer: MetricContainer) {
    let metrics: I_DisplayableData[] = []
    for (let graph of graphs) {
      let graphData = metricContainer.getMetricData(graph.stat_name, graph.owners);
      if (graphData.length > 0) {
        metrics.push({ ...graph, values: graphData });
      } else {
        console.log('No data for graph', graph);
      }
    }
    return metrics;
  }

}
