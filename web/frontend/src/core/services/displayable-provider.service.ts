import { inject, Injectable } from '@angular/core';
import { combineLatest, map, Observable, of, switchMap, tap } from 'rxjs';
import { T_DisplayableDataType } from '../interfaces/displayable-data-interface';
import { I_DisplayableRequest } from '../interfaces/displayable-interface';
import { DashboardPageManagerService } from './dashboard-page-manager.service';
import { DisplayRequestManagerService } from './display-request-manager.service';
import { DisplayableProcessorService } from './displayable-processor.service';
import { MetricContainer } from './metric-container';
import { MetricService } from './metric.service';

@Injectable({
  providedIn: 'root',
})
export class DisplayableProviderService {
  private _graphService = inject(DisplayableProcessorService);
  private _dashboardPageManagerService = inject(DashboardPageManagerService);
  private _metricsService = inject(MetricService);
  private _displayReqService = inject(DisplayRequestManagerService);

  constructor() {}

  public getDisplayables(
    page: string,
    name: string,
    type: string
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

  public processRequests(
    metricContainer: MetricContainer,
    requests: I_DisplayableRequest[]
  ): T_DisplayableDataType[] {
    const displayables: T_DisplayableDataType[] = [];
    for (let request of requests) {
      console.log('RESQUEST: ', request);
      let output = metricContainer.getMetricData(request);
      console.log('OUTPUT: ', output);
      const result = this._graphService.convert(output);
      if (result) {
        console.log('PUSH', result);
        displayables.push(result);
      }
    }
    return displayables;
  }
}
