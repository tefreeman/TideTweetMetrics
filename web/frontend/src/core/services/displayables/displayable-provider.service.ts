import { inject, Injectable } from '@angular/core';
import { combineLatest, map, Observable, of, switchMap, tap } from 'rxjs';
import {
  T_DisplayableDataType,
  T_DisplayableGraph,
  T_GridType,
} from '../../interfaces/displayable-data-interface';
import { I_DisplayableRequest } from '../../interfaces/displayable-interface';
import { T_MetricValue } from '../../interfaces/metrics-interface';
import { DashboardPageManagerService } from '../dashboard-page-manager.service';
import { MetricContainer } from '../metrics/metric-container';
import { MetricService } from '../metrics/metric.service';
import { DisplayRequestManagerService } from './display-request-manager.service';
import { DisplayableProcessorService } from './displayable-processor.service';

@Injectable({
  providedIn: 'root',
})
export class DisplayableProviderService {
  private _graphService = inject(DisplayableProcessorService);
  private _dashboardPageManagerService = inject(DashboardPageManagerService);
  private _metricsService = inject(MetricService);
  private _displayReqService = inject(DisplayRequestManagerService);

  constructor() {}

  /**
   * Retrieves the displayable data for a given page, name, and type.
   * @param page - The page name.
   * @param name - The displayable name.
   * @param type - The grid type.
   * @returns An observable that emits an array of displayable data.
   */
  public getDisplayables(
    page: string,
    name: string,
    type: T_GridType
  ): Observable<T_DisplayableDataType[]> {
    return combineLatest([
      this._metricsService.metricContainer$,
      this._displayReqService.getRequestsByName(page, name, type),
    ]).pipe(
      tap(([metricContainer, requests]) =>
        console.log('Processing requests', requests, metricContainer)
      ),
      switchMap(([metricContainer, requests]) =>
        of(this.processRequests(metricContainer, requests))
      )
    );
  }

  /**
   * Retrieves the grids for a given page name.
   * @param pageName - The page name.
   * @returns An observable that emits an array of grid data.
   */
  public getGrids$(pageName: string): Observable<any[]> {
    // Adjust the type as necessary
    return this._dashboardPageManagerService.getGrids$(pageName).pipe(
      // Map each grid entry to a new structure
      map((gridEntries) =>
        Object.entries(gridEntries).map(([gridName, gridDetails]) => ({
          name: gridName,
          displayables: gridDetails.displayables, // Directly use the displayable list without additional mapping
          type: gridDetails.type,
          order: gridDetails.order,
        }))
      ),
      // Sort the transformed grid entries based on their order
      map((gridArray) => gridArray.sort((a, b) => a.order - b.order))
    );
  }

  /**
   * Processes the displayable requests and returns an array of displayable data.
   * @param metricContainer - The metric container.
   * @param requests - The displayable requests.
   * @returns An array of displayable data.
   */
  public processRequests(
    metricContainer: MetricContainer,
    requests: I_DisplayableRequest[]
  ): T_DisplayableDataType[] {
    const groupedResults: { [key: string]: T_DisplayableDataType[] } = {};
    const individualResults: T_DisplayableDataType[] = [];

    requests.forEach((request) => {
      const output = metricContainer.getMetricData(request);
      const result = this._graphService.convert(output);

      if (result) {
        if (request.groupId) {
          if (!groupedResults[request.groupId]) {
            groupedResults[request.groupId] = [];
          }
          groupedResults[request.groupId].push(result);
        } else {
          individualResults.push(result);
        }
      }
    });

    // Now process grouped items
    const mergedGroupResults = this.mergeGroupedResults(groupedResults);

    return [...individualResults, ...mergedGroupResults];
  }

  private mergeGroupedResults(groupedResults: {
    [key: string]: T_DisplayableDataType[];
  }): T_DisplayableDataType[] {
    const mergedResults: T_DisplayableDataType[] = [];

    Object.values(groupedResults).forEach((group) => {
      if (group.length > 0 && 'owners' in group[0]) {
        const base = group[0] as T_DisplayableGraph;

        try {
          const ownerValueMap: { [owner: string]: T_MetricValue[] } = {};

          for (let i = 0; i < group.length; i++) {
            const currentItem = group[i];
            if ('owners' in currentItem) {
              const typedItem = currentItem as T_DisplayableGraph;
              typedItem.owners.forEach((owner, index) => {
                if (!(owner in ownerValueMap)) {
                  ownerValueMap[owner] = [];
                }
                ownerValueMap[owner].push(typedItem.values[index]);
              });
              if ('metricName' in base && 'metricName' in currentItem) {
                base.metricNames = Array.isArray(base.metricName)
                  ? base.metricName
                  : [base.metricName];
                base.metricNames.push(typedItem.metricName);
              }
            }
          }

          const lengths = Object.values(ownerValueMap).map(
            (values) => values.length
          );
          const medianLength = lengths.sort((a, b) => a - b)[
            Math.floor(lengths.length / 2)
          ];

          base.owners = Object.keys(ownerValueMap);
          base.valuesNested = base.owners.map((owner) => {
            const values = ownerValueMap[owner];
            if (values.length === medianLength) {
              return values;
            } else {
              console.warn(
                `Skipping owner '${owner}' due to inconsistent value length.`
              );
              return [];
            }
          });

          mergedResults.push(base);
        } catch (error) {
          console.error('Error merging group items: ', error);
          // Handle errors as needed
        }
      }
    });

    console.log('MERGED IS OVER: ', mergedResults);
    return mergedResults;
  }
}
