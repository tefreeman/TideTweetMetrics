import { inject, Injectable } from '@angular/core';
import { MetricService } from './metric.service';
import { DisplayRequestManagerService } from './display-request-manager.service';
import { IDisplayableData, I_DisplayableRequest } from '../interfaces/displayable-interface';
import { T_DisplayableDataType } from "../interfaces/displayable-data-interface";
import { combineLatestWith, forkJoin, Observable, of, Subject, switchMap, tap, map } from 'rxjs';
import { combineLatest } from 'rxjs';
import { DisplayableProcessorService } from './displayable-processor.service';
import { MetricContainer } from './metric-container';
import { DashboardPageManagerService } from './dashboard-page-manager.service';
import { I_GridEntry } from '../interfaces/pages-interface';

@Injectable({
  providedIn: 'root'
})
export class DisplayableProviderService {
private _graphService = inject(DisplayableProcessorService);
private _dashboardPageManagerService = inject(DashboardPageManagerService);
private _metricsService = inject(MetricService);
private _displayReqService = inject(DisplayRequestManagerService);


constructor() {
}

public getDisplayables(page: string, name: string, type: string): Observable<T_DisplayableDataType[]> {
  return  combineLatest([
    this._metricsService.getMetricContainer$(),
    this._displayReqService.getRequestsByName(page, name, type)
  ]).pipe(
    tap(([metricContainer, requests]) =>
      console.log('Processing requests', requests, metricContainer)
    ),
    switchMap(([metricContainer, requests]) =>
      of(this.processRequests(metricContainer, requests))
    )
  );
}

public getGrids$(pageName: string): Observable<any[]> { // Adjust the type as necessary
  return this._dashboardPageManagerService.getGrids$(pageName).pipe(
    // Map each grid entry to a new structure
    map(gridEntries => Object.entries(gridEntries).map(([gridName, gridDetails]) => ({
      name: gridName,
      displayables: gridDetails.displayables, // Directly use the displayable list without additional mapping
      type: gridDetails.type,
      order: gridDetails.order
    }))),
    // Sort the transformed grid entries based on their order
    map(gridArray => gridArray.sort((a, b) => a.order - b.order)),
  );
}

private processRequests(metricContainer: MetricContainer, requests: I_DisplayableRequest[]): T_DisplayableDataType[] {
  const displayables: T_DisplayableDataType[] = [];
  for (let request of requests) {
    let output = metricContainer.getMetricData(request);
    displayables.push(this._graphService.convert(output));
   }
   return displayables;
}
 

}
