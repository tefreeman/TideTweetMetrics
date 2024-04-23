import { Injectable, inject } from '@angular/core';
import { AgChartOptions } from 'ag-charts-community';
import {
  I_GenericGraphData,
  I_GraphBarData,
  I_GraphLineData,
  I_ScatterPlotData,
  T_DisplayableGraph,
} from '../interfaces/displayable-data-interface';
import { GraphLargeBar } from './graphing/graph-large-bars';
import { GraphLargeMutliBar } from './graphing/graph-large-multi-bar';
import { GraphScatter } from './graphing/graph-scatter';
import { GraphSmallBar } from './graphing/graph-small-bar';
import { GraphSmallLine } from './graphing/graph-small-line';
import { GraphSmallMultiBar } from './graphing/graph-small-multi-bar';
import { KeyTranslatorService } from './key-translator.service';
@Injectable({
  providedIn: 'root',
})
export class GraphMakerService {
  private keyTranslatorService: KeyTranslatorService =
    inject(KeyTranslatorService);
  private graphSmallBar: GraphSmallBar = new GraphSmallBar();
  private graphLargeBar: GraphLargeBar = new GraphLargeBar();
  private graphSmallMultiBar: GraphSmallMultiBar = new GraphSmallMultiBar();
  private graphLargeMutliBar: GraphLargeMutliBar = new GraphLargeMutliBar();
  private graphSmallLine: GraphSmallLine = new GraphSmallLine();
  private graphScatter: GraphScatter = new GraphScatter();
  constructor() {}

  /**
   * Retrieves the structure of the graph data.
   * @param graphData - The displayable graph data.
   * @returns The structure of the graph data including data dimension, owner count, and data points.
   */
  getGraphStructure(graphData: T_DisplayableGraph) {
    let dataDimension;
    if (graphData.valuesNested && Array.isArray(graphData.valuesNested[0])) {
      // If valuesNested exists and its first element is an array, calculate based on it
      dataDimension = graphData.valuesNested[0].length;
    } else if (Array.isArray(graphData.values[0])) {
      // If the first case isn't true but the first element of values is an array, calculate based on it
      dataDimension = graphData.values[0].length;
    } else {
      // Fall back to 1 if neither of the above cases are true
      dataDimension = 1;
    }
    const ownerCount = graphData.owners.length;
    const dataPoints = graphData.values.length;

    return { dataDimension, ownerCount, dataPoints };
  }

  createChart(graphData: T_DisplayableGraph): AgChartOptions {
    if (graphData.type === 'graph-line') {
      return this.graphSmallLine.getGraph(graphData as I_GraphLineData);
    } else if (graphData.type === 'small-graph-bar') {
      return this.graphSmallBar.getGraph(graphData as I_GraphBarData);
    } else if (graphData.type === 'large-graph-bar') {
      return this.graphLargeBar.getGraph(graphData as I_GraphBarData);
    } else if (graphData.type === 'small-graph-bar-grouped') {
      return this.graphSmallMultiBar.getGraph(graphData as I_GraphBarData);
    } else if (graphData.type === 'large-graph-bar-grouped') {
      return this.graphLargeMutliBar.getGraph(graphData as I_GraphBarData);
    } else if (graphData.type === 'graph-scatter') {
      return this.graphScatter.getGraph(graphData as I_ScatterPlotData);
    } else {
      //@ts-ignore
      return this.guessGraph(graphData);
    }
  }

  //@ts-ignore
  guessGraph(graphData: I_GenericGraphData): AgChartOptions {
    const { dataDimension, ownerCount, dataPoints } = this.getGraphStructure(
      graphData as any
    );
    console.log(
      'DataDimension: ',
      dataDimension,
      'OwnerCount: ',
      ownerCount,
      'DataPoints: ',
      dataPoints
    );

    if (graphData.valuesNested) {
      if (ownerCount <= 10) {
        return this.graphSmallMultiBar.getGraph(
          graphData as unknown as I_GraphBarData
        );
      } else {
        return this.graphLargeMutliBar.getGraph(
          graphData as unknown as I_GraphBarData
        );
      }
    }

    if (dataDimension === 1) {
      if (dataPoints <= 10) {
        return this.graphSmallBar.getGraph(
          graphData as unknown as I_GraphBarData
        );
      } else {
        return this.graphLargeBar.getGraph(
          graphData as unknown as I_GraphBarData
        );
      }
    }

    if (dataDimension === 2) {
      return this.graphSmallLine.getGraph(
        graphData as unknown as I_GraphLineData
      );
    }
  }

  /**
   * Calculates the strokeWidth based on the data size.
   * @param dataLength - The length of the data.
   * @returns The strokeWidth value.
   */
  calculateStrokeWidth(dataLength: number): number {
    if (dataLength <= 10) {
      return 4;
    } else if (dataLength <= 50) {
      return 3;
    } else if (dataLength <= 100) {
      return 2;
    } else {
      return 1;
    }
  }
}
