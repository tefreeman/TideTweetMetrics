import { inject, Injectable } from '@angular/core';
import { combineLatest, map, Observable, of, switchMap, tap } from 'rxjs';
import {
  T_BaseCard,
  T_GridType,
} from '../../interfaces/displayable-data-interface';
import { I_DisplayableRequest } from '../../interfaces/displayable-interface';
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
  ): Observable<T_BaseCard[]> {
    return combineLatest([
      this._metricsService.metricContainer$,
      this._displayReqService.getRequestsByName(page, name, type),
    ]).pipe(
      tap(([metricContainer, requests]) =>
        console.log('Processing requests', requests, metricContainer)
      ),
      switchMap(
        ([metricContainer, requests]) =>
          of(
            this.processRequests(metricContainer, requests, type).filter(
              (x) => x !== null
            )
          ) as Observable<T_BaseCard[]>
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

  public processRequestsWithMetrics(
    requests: I_DisplayableRequest[],
    type: T_GridType
  ): Observable<T_BaseCard[]> {
    // Fetch the latest metricContainer
    return this._metricsService.metricContainer$.pipe(
      switchMap((metricContainer) => {
        const results = this.processRequests(metricContainer, requests, type);
        const filteredResults: T_BaseCard[] = [];
        for (let i = 0; i < results.length; i++) {
          if (results[i] !== null)
            if (Object.keys(results[i]!.data).length !== 0)
              filteredResults.push(results[i] as T_BaseCard);
        }
        return of(filteredResults);
      })
    ) as Observable<T_BaseCard[]>;
  }

  /**
   * Processes the displayable requests and returns an array of displayable data.
   * @param metricContainer - The metric container.
   * @param requests - The displayable requests.
   * @returns An array of displayable data.
   */
  public processRequests(
    metricContainer: MetricContainer,
    requests: I_DisplayableRequest[],
    type: T_GridType
  ): (T_BaseCard | null)[] {
    // Process each request
    const results: Array<T_BaseCard | null> = [];
    requests.forEach((request) => {
      if (request.metricNames.length === 0) {
        results.push(null);
      } else {
        const result = this._graphService.convert(
          metricContainer.getMetricData(request),
          request
        );
        results.push(result);
      }
    });
    return results;
    // Now process grouped items
  }
}
