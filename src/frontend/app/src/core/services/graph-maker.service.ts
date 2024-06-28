import { Injectable } from '@angular/core';
import { AgChartOptions } from 'ag-charts-community';
import {
  I_BarGraphCard,
  I_BarGroupedGraphCard,
  I_BaseGraphCard,
  I_LineGraphCard,
  I_ScatterGraphCard,
} from '../interfaces/displayable-data-interface';
import { GraphLargeBar } from './graphing/graph-large-bars';
import { GraphLargeMutliBar } from './graphing/graph-large-multi-bar';
import { GraphScatter } from './graphing/graph-scatter';
import { GraphSmallBar } from './graphing/graph-small-bar';
import { GraphSmallLine } from './graphing/graph-small-line';
import { GraphSmallMultiBar } from './graphing/graph-small-multi-bar';
@Injectable({
  providedIn: 'root',
})
export class GraphMakerService {
  private graphSmallBar: GraphSmallBar = new GraphSmallBar();
  private graphLargeBar: GraphLargeBar = new GraphLargeBar();
  private graphSmallMultiBar: GraphSmallMultiBar = new GraphSmallMultiBar();
  private graphLargeMutliBar: GraphLargeMutliBar = new GraphLargeMutliBar();
  private graphSmallLine: GraphSmallLine = new GraphSmallLine();
  private graphScatter: GraphScatter = new GraphScatter();
  constructor() {}

  createChart(graphData: I_BaseGraphCard): AgChartOptions | null {
    if (graphData) {
      if (graphData.metricNames.length === 0 || graphData.owners.length === 0) {
        console.warn('unable to create chart');
        return null;
      }

      if (graphData.type === 'graph-bar') {
        if (graphData.owners.length <= 10)
          return this.graphSmallBar.getGraph(graphData as I_BarGraphCard);
        else return this.graphLargeBar.getGraph(graphData as I_BarGraphCard);
      } else if (graphData.type === 'graph-bar-grouped') {
        if (graphData.owners.length * graphData.metricNames.length  <= 10)
          return this.graphSmallMultiBar.getGraph(
            graphData as I_BarGroupedGraphCard
          );
        else
          return this.graphLargeMutliBar.getGraph(
            graphData as I_BarGroupedGraphCard
          );
      } else if (graphData.type === 'graph-line') {
        return this.graphSmallLine.getGraph(graphData as I_LineGraphCard);
      } else if (graphData.type === 'graph-scatter') {
        return this.graphScatter.getGraph(graphData as I_ScatterGraphCard);
      } else {
        throw new Error('Invalid graph type');
      }
    } else {
      console.warn('unable to create chart');
      return null;
    }
  }
}
