import { Injectable } from '@angular/core';
import {
  I_BarGraphCard,
  I_BarGroupedGraphCard,
  I_BasicMetricCard,
  I_CompMetricCard,
  I_LineGraphCard,
  I_ScatterGraphCard,
  I_TrendMetricCard,
  T_BaseCard,
} from '../../interfaces/displayable-data-interface';
import {
  I_DisplayableRequest,
  I_MetricSubset,
  T_MetricValue,
} from '../../interfaces/displayable-interface';
enum MetricValType {
  Number = 1,
  NumberArray,
  EmptyArray,
  StringNumberTupleArray,
  Unknown,
}

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
  convert(
    data: I_MetricSubset,
    request: I_DisplayableRequest
  ): T_BaseCard | null {
    if (request.type === 'auto-graph' || request.type === 'auto-stat') {
      return this.decisionTree(data, request);
    }

    if (request.type === 'metric-value') {
      return this.toMetricValue(data);
    } else if (request.type === 'metric-comp') {
      return this.toMetricComp(data);
    } else if (request.type === 'metric-trend') {
      return this.toMetricTrend(data);
    } else if (request.type === 'graph-bar') {
      return this.toBarGraph(data);
    } else if (request.type === 'graph-bar-grouped') {
      return this.toBarGraph(data);
    } else if (request.type === 'graph-line') {
      return this.toLineGraph(data);
    } else if (request.type === 'graph-scatter') {
      return this.toScatterGraph(data);
    } else {
      throw new Error('Invalid data type');
    }
  }

  /**
   * Processes the displayable data using a decision tree and returns the corresponding displayable type.
   * @param data The displayable data to process.
   * @returns The processed displayable data or null if processing fails.
   */
  decisionTree(
    data: I_MetricSubset,
    request: I_DisplayableRequest
  ): T_BaseCard | null {
    const metricCount = request.metricNames.length;
    const ownerCount = Object.keys(Object.values(data)[0]).length;
    const MetricValTypeEnum: MetricValType = this.determineMetricValType(data);

    if (request.type === 'auto-stat') {
      if (metricCount === 1 && ownerCount === 1) {
        if (MetricValTypeEnum === MetricValType.Number) {
          return this.toMetricValue(data);
        } else if (MetricValTypeEnum === MetricValType.StringNumberTupleArray) {
          return this.toMetricTrend(data);
        }
      } else {
        if (ownerCount === 2) {
          return this.toMetricComp(data);
        }
      }
      console.warn(
        'Failed to process auto-stat displayable data',
        data,
        request
      );
      return null;
    }

    if (request.type === 'auto-graph') {
      if (
        metricCount === 1 &&
        ownerCount >= 1 &&
        MetricValTypeEnum === MetricValType.Number
      ) {
        return this.toBarGraph(data);
      } else if (
        metricCount > 1 &&
        ownerCount >= 1 &&
        MetricValTypeEnum === MetricValType.Number
      ) {
        return this.toBarGroupedGraph(data);
      } else if (
        metricCount === 1 &&
        ownerCount >= 1 &&
        MetricValTypeEnum === MetricValType.StringNumberTupleArray
      ) {
        return this.toLineGraph(data);
      } else if (
        metricCount === 2 &&
        ownerCount >= 1 &&
        MetricValTypeEnum === MetricValType.NumberArray
      ) {
        return this.toScatterGraph(data);
      }
      console.warn(
        'Failed to process auto-graph displayable data',
        data,
        request
      );
      return null;
    }
    console.warn('Invalid displayable type for decision tree processing');
    return null;
  }

  private toMetricValue(data: I_MetricSubset): I_BasicMetricCard | null {
    if (Object.keys(data).length !== 1) {
      console.warn('Invalid data for metric-value displayable');
      return null;
    }

    const metricName = Object.keys(data)[0];
    const ownerName = Object.keys(data[metricName])[0];
    const metricValue = data[metricName][ownerName];

    if (typeof metricValue !== 'number') {
      console.warn('Invalid metric value for metric-value displayable');
      return null;
    }

    return {
      type: 'metric-value',
      metricName,
      owner: ownerName,
      value: metricValue,
    };
  }

  private toMetricTrend(data: I_MetricSubset): I_TrendMetricCard | null {
    if (Object.keys(data).length !== 1) {
      console.warn('Invalid data for metric-trend displayable');
      return null;
    }

    const metricName = Object.keys(data)[0];
    const ownerName = Object.keys(data[metricName])[0];
    const fullValuesArr = data[metricName][ownerName];

    // Ensuring fullValuesArr is an array of [number, number] tuples.
    if (!Array.isArray(fullValuesArr) || fullValuesArr.length < 2) {
      console.warn(
        'Invalid or insufficient metric values for metric-trend displayable'
      );
      return null;
    }

    // Take the last two elements of the provided array
    const lastTwoValues = fullValuesArr.slice(-2) as [number, number][];

    // Validate the structure of the last two elements
    if (
      lastTwoValues.some(
        (val) =>
          !Array.isArray(val) ||
          val.length !== 2 ||
          !val.every((num) => typeof num === 'number')
      )
    ) {
      console.warn('Invalid structure for the last two metric values');
      return null;
    }

    // Assuming the structure [[time, value], [time, value]]
    const times: [number, number] = [lastTwoValues[0][0], lastTwoValues[1][0]];
    const values: [number, number] = [lastTwoValues[0][1], lastTwoValues[1][1]];

    return {
      type: 'metric-trend',
      metricName,
      owner: ownerName,
      times: times,
      values: values,
    };
  }
  private toMetricComp(data: I_MetricSubset): I_CompMetricCard | null {
    if (Object.keys(data).length !== 1) {
      console.warn('Invalid data for metric-comp displayable');
      return null;
    }

    const metricName = Object.keys(data)[0];
    const owners = Object.keys(data[metricName]);

    // Ensure exactly two owners are provided for the comparison.
    if (owners.length !== 2) {
      console.warn(
        'Invalid owners count for metric-comp displayable, expected 2 owners'
      );
      return null;
    }

    // Extract values for both owners as numbers
    const valuesForOwners = owners.map((owner) => data[metricName][owner]);

    // Check if the extracted values are numbers
    const values = valuesForOwners.every((value) => typeof value === 'number')
      ? (valuesForOwners as [number, number])
      : null; // Safely cast to [number, number] since we checked all are numbers

    if (!values) {
      console.warn(
        'Invalid or missing values for owner in metric-comp displayable'
      );
      return null;
    }

    return {
      type: 'metric-comp',
      metricName,
      owners: [owners[0], owners[1]],
      values,
    };
  }

  // Assuming these interfaces are imported or exist in the same file.
  toBarGraph(data: I_MetricSubset): I_BarGraphCard | null {
    // Initialize the data array for the bar graph.
    let graphData: { owner: string; metricValue: number }[] = [];
    let metricNames: string[] = [];
    let owners: string[] = [];

    for (const metricName in data) {
      metricNames.push(metricName); // Collect metric names.
      for (const owner in data[metricName]) {
        // Make sure owner is unique.
        if (!owners.includes(owner)) {
          owners.push(owner);
        }

        const value: T_MetricValue = data[metricName][owner];

        // Check if the value is a number. If not, console.warn and return null.
        if (typeof value !== 'number') {
          console.warn(
            `Value for metric '${metricName}' by '${owner}' is not a number.`
          );
          return null;
        }

        // Add to graph data if it's a valid number.
        graphData.push({ owner, metricValue: value });
      }
    }

    // Create the bar graph card with the accumulated data.
    const barGraphCard: I_BarGraphCard = {
      type: 'graph-bar',
      metricNames,
      owners,
      data: graphData,
    };

    return barGraphCard;
  }
  toBarGroupedGraph(data: I_MetricSubset): I_BarGroupedGraphCard | null {
    let graphData: { owner: string; [metricName: string]: string | number }[] =
      [];
    let metricNames: string[] = [];
    let owners: string[] = [];

    // First pass: Check for invalid values and collect metric names and owners.
    for (const metricName in data) {
      if (!metricNames.includes(metricName)) {
        metricNames.push(metricName);
      }

      for (const owner in data[metricName]) {
        if (!owners.includes(owner)) {
          owners.push(owner);
        }

        const value = data[metricName][owner];
        if (typeof value !== 'number') {
          console.warn(
            `Value for metric '${metricName}' by '${owner}' is not a number.`
          );
          return null;
        }
      }
    }

    // Check if we have at least two metrics for a grouped bar graph.
    if (metricNames.length < 2) {
      console.warn(
        'A grouped bar graph requires at least two different metric names.'
      );
      return null;
    }

    // Second pass: Construct the data array according to the I_BarGroupedGraphCard format.
    owners.forEach((owner) => {
      // Define dataEntry with an index signature to allow dynamic string keys.
      const dataEntry: { owner: string; [key: string]: string | number } = {
        owner,
      };

      metricNames.forEach((metricName) => {
        if (data[metricName] && typeof data[metricName][owner] === 'number') {
          dataEntry[metricName] = data[metricName][owner] as any;
        }
      });

      graphData.push(dataEntry);
    });

    const groupedGraphCard: I_BarGroupedGraphCard = {
      type: 'graph-bar-grouped',
      metricNames,
      owners,
      data: graphData,
    };

    return groupedGraphCard;
  }

  toLineGraph(data: I_MetricSubset): I_LineGraphCard | null {
    const metricNames = Object.keys(data);

    // Ensure there is exactly one metric
    if (metricNames.length !== 1) {
      console.warn('toLineGraph expects data for exactly one metric.');
      return null;
    }

    // Prepare for transformation
    const metricName = metricNames[0];
    const ownersData = data[metricName];
    const owners = Object.keys(ownersData);
    const lineGraphData: { time: number; [owner: string]: number }[] = [];
    const processedTimes = new Set<number>();

    for (const owner of owners) {
      const metricValues = ownersData[owner];

      // Verify and cast the metric value to the expected tuple format
      if (Array.isArray(metricValues)) {
        for (const value of metricValues) {
          if (
            Array.isArray(value) &&
            value.length === 2 &&
            typeof value[0] === 'number' &&
            typeof value[1] === 'number'
          ) {
            const [time, val] = value;
            if (!processedTimes.has(time)) {
              // Initialize or update lineGraphData with this time point for all owners
              let dataPoint = lineGraphData.find((dp) => dp.time === time);
              if (!dataPoint) {
                dataPoint = { time, [owner]: val };
                lineGraphData.push(dataPoint);
              } else {
                dataPoint[owner] = val;
              }
              processedTimes.add(time);
            } else {
              // Update the existing entry for a specific time point
              const dataPoint = lineGraphData.find((dp) => dp.time === time);
              if (dataPoint) {
                dataPoint[owner] = val;
              }
            }
          } else {
            console.warn(
              'Metric values are not in the expected [Number, Number] format.'
            );
            return null;
          }
        }
      } else {
        console.warn('Invalid metric value format.');
        return null;
      }
    }

    return {
      type: 'graph-line',
      metricNames: [metricName],
      owners,
      data: lineGraphData,
    };
  }

  toScatterGraph(data: I_MetricSubset): I_ScatterGraphCard | null {
    const metricNames = Object.keys(data);

    // Check if there are exactly two metrics
    if (metricNames.length !== 2) {
      console.warn('toGraphScatter expects data for exactly two metrics.');
      return null;
    }

    const scatterData: I_ScatterGraphCard['data'] = {};
    const [metricName1, metricName2] = metricNames;

    for (const metricName of metricNames) {
      const ownersData = data[metricName];

      for (const [owner, value] of Object.entries(ownersData)) {
        if (
          !Array.isArray(value) ||
          value.some((val) => typeof val !== 'number')
        ) {
          console.warn(
            `${metricName} for ${owner} is not in the expected number[] format.`
          );
          return null; // Here, returning null if there's a format error remains correct
        }

        if (!scatterData[owner]) {
          scatterData[owner] = [];
        }

        value.forEach((val) => {
          let entry = scatterData[owner].find((entry) =>
            entry.hasOwnProperty(metricName)
          );
          if (!entry) {
            entry = {}; // Initialize a new entry if not found
            scatterData[owner].push(entry);
          }
          entry[metricName] = val as number;
        });
      }
    }

    return {
      type: 'graph-scatter',
      metricNames: [metricName1, metricName2],
      owners: Object.keys(scatterData),
      data: scatterData,
    };
  }

  private determineMetricValType(data: I_MetricSubset): MetricValType {
    // Assuming we're inspecting the first metric for simplicity.
    // In real applications, you might need to loop through or otherwise dynamically select which metric to inspect.
    const firstMetricKey = Object.keys(data)[0];
    const firstOwnerKey = Object.keys(data[firstMetricKey])[0];
    const firstMetricValue = data[firstMetricKey][firstOwnerKey];

    // Determine the type based on the characteristics of the firstMetricValue
    if (typeof firstMetricValue === 'number') {
      return MetricValType.Number;
    } else if (Array.isArray(firstMetricValue)) {
      if (firstMetricValue.length === 0) {
        // If the array is empty, it's more difficult to determine the intended structure.
        return MetricValType.EmptyArray;
      } else {
        // Inspect the first element of the array to determine its structure.
        const firstElement = firstMetricValue[0];
        if (typeof firstElement === 'number') {
          return MetricValType.NumberArray;
        } else if (
          Array.isArray(firstElement) &&
          (typeof firstElement[0] === 'string' ||
            typeof firstElement[0] === 'number') &&
          typeof firstElement[1] === 'number'
        ) {
          return MetricValType.StringNumberTupleArray;
        } else {
          return MetricValType.Unknown;
        }
      }
    } else {
      return MetricValType.Unknown;
    }
  }
}
