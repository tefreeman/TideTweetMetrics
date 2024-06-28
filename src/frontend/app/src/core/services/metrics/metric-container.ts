import {
  I_DisplayableRequest,
  I_MetricJsonData,
  I_MetricSubset,
  I_OwnerKeyVal,
  T_MetricValue,
} from '../../interfaces/displayable-interface';

/**
 * Represents a container for metrics.
 */
export class MetricContainer {
  _metrics: I_MetricJsonData = {};

  /**
   * Constructs a new MetricContainer instance.
   */
  constructor() {}

  /**
   * Sets the metrics for the container.
   * @param metrics - The metrics to set.
   */
  setMetrics(metrics: I_MetricJsonData): void {
    this._metrics = metrics;
    console.log('metrics set', this._metrics);
  }

  /**
   * Gets the keys of the statistics.
   * @returns An array of statistic keys.
   */
  getStatKeys(): string[] {
    return this._metrics ? Object.keys(this._metrics) : [];
  }

  /**
   * Gets the statistic by owner.
   * @param stat_name - The name of the statistic.
   * @param owner - The owner of the statistic.
   * @returns The metric owners.
   */
  getStatByOwner(stat_name: string, owner: string): I_OwnerKeyVal {
    return this._metrics[stat_name];
  }

  /**
   * Checks if a metric is defined.
   * @param stat_name - The name of the statistic.
   * @param owner - The owner of the statistic.
   * @returns A boolean indicating if the metric is defined.
   */
  isMetricDefined(stat_name: string, owner: string): boolean {
    return (
      this._metrics &&
      stat_name in this._metrics &&
      owner in this._metrics[stat_name]
    );
  }

  /**
   * Gets all owner names for a statistic.
   * @param stat_name - The name of the statistic.
   * @returns An array of owner names.
   */
  getAllOwnerNamesByStat(stat_name: string): string[] {
    if (this._metrics && this._metrics[stat_name])
      return Object.keys(this._metrics[stat_name]);
    return [];
  }

  /**
   * Gets the count of owners for a statistic.
   * @param stat_name - The name of the statistic.
   * @returns The count of owners.
   */
  getOwnersCountForStat(stat_name: string): number {
    if (this._metrics && this._metrics[stat_name])
      return Object.keys(this._metrics[stat_name]).length;
    return 0;
  }

  /**
   * Adds specific owner data to the displayable request.
   * @param displayable - The displayable request.
   * @returns The displayable data.
   */
  /**
   * This section assumes `this._metrics` has the appropriately typed structure matching `I_MetricJsonData`
   * and utility methods such as `isMetricDefined` are appropriately adjusted or reimplemented to work with
   * the new structure if needed.
   */

  addSpecificData(displayable: I_DisplayableRequest): I_MetricSubset {
    const subSet: I_MetricSubset = {};

    displayable.metricNames.forEach((metricName) => {
      subSet[metricName] = {};

      displayable.ownersParams.owners?.forEach((owner) => {
        if (this.isMetricDefined(metricName, owner)) {
          subSet[metricName][owner] = this._metrics[metricName][owner];
        }
      });
    });

    return subSet;
  }

  getMetricData(displayable: I_DisplayableRequest): I_MetricSubset {
    if (displayable.metricNames.length === 0) {
      console.warn('Cannot get metric data for an empty metricNames array.');
      return {};
    }
    if (displayable.ownersParams.type === 'specific') {
      return this.addSpecificData(displayable);
    }

    let subSet: I_MetricSubset = {};

    displayable.metricNames.forEach((metricName) => {
      subSet[metricName] = {}; // Initialize as empty object for each metric

      const owners = this.getAllOwnerNamesByStat(metricName);
      owners.forEach((owner) => {
        if (this.isMetricDefined(metricName, owner)) {
          subSet[metricName][owner] = this._metrics[metricName][owner];
        }
      });

      if (
        displayable.ownersParams.type === 'top' ||
        displayable.ownersParams.type === 'bottom'
      ) {
        const getAverage = (value: T_MetricValue): number => {
          if (typeof value === 'number') {
            return value;
          } else if (Array.isArray(value)) {
            if (value.length === 0) {
              return 0; // Return 0 for an empty array
            }

            const firstElement = value[0];
            if (typeof firstElement === 'number') {
              // Number[]
              return (
                value.reduce((sum: any, num) => sum + num, 0) / value.length
              );
            } else if (Array.isArray(firstElement)) {
              // [string | number, number][]
              return (
                value.reduce((sum: any, tuple: any) => sum + tuple[1], 0) /
                value.length
              );
            }
          }
          return 0; // Default value if the type is not recognized
        };

        const isTop = displayable.ownersParams.type === 'top';
        const cutOff = displayable.ownersParams.count
          ? displayable.ownersParams.count +
            (displayable.ownersParams.owners
              ? displayable.ownersParams.owners.length
              : 0)
          : Object.keys(subSet[metricName]).length;

        subSet[metricName] = Object.entries(subSet[metricName])
          .sort(([, valueA], [, valueB]) => {
            const avgA = getAverage(valueA);
            const avgB = getAverage(valueB);

            return isTop ? avgB - avgA : avgA - avgB;
          })
          .slice(0, cutOff)
          .reduce((obj, [owner, value]) => {
            obj[owner] = value;
            return obj;
          }, {} as I_OwnerKeyVal);
      }
    });
    return subSet;
  }

  /**
   * Gets the metrics as a JSON object.
   * @returns The metrics as a JSON object.
   */
  getJson(): I_MetricJsonData {
    return this._metrics;
  }
}
