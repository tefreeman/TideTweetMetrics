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
    let dataPoints;
    let dataDimension; // Dimension of each data point

    // Determine if we're dealing with values or valuesNested
    const primaryData = graphData.valuesNested
      ? graphData.valuesNested
      : graphData.values;

    if (Array.isArray(primaryData[0])) {
      // We're dealing with at least a 2D array
      if (Array.isArray(primaryData[0][0])) {
        // It's a 3D array
        dataPoints = primaryData[0].length; // The size of the second level array
        dataDimension = primaryData[0][0].length; // The size of the innermost array
      } else {
        // It's a 2D array
        dataPoints = primaryData.length; // In case of 2D, consider the first dimension size as data points
        dataDimension = 1; // Since it's 2D, the data dimension is 1
      }
    } else {
      // If primaryData[0] isn't an array, then we've misunderstood the structure. Default to safe values.
      dataPoints = 1;
      dataDimension = 1; // Assuming each value is a single data point with one dimension
    }

    const ownerCount = graphData.owners.length;

    return { dataPoints, ownerCount, dataDimension };
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
      'Object:',
      graphData,
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
      if (dataPoints == 1) {
        if (ownerCount <= 10) {
          return this.graphSmallBar.getGraph(
            graphData as unknown as I_GraphBarData
          );
        } else {
          return this.graphLargeBar.getGraph(
            graphData as unknown as I_GraphBarData
          );
        }
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
