import { inject, Injectable } from '@angular/core';
import { MetricService } from './metric.service';
import { DisplayRequestManagerService } from './display-request-manager.service';
import { IDisplayableData, I_DisplayableRequest } from '../interfaces/displayable-interface';
import { T_DisplayableDataType } from "../interfaces/displayable-data-interface";
import { combineLatestWith, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { combineLatest } from 'rxjs';
import { DisplayableProcessorService } from './displayable-processor.service';
import { MetricContainer } from './metric-container';

@Injectable({
  providedIn: 'root'
})
export class DisplayableProviderService {
private _graphService = inject(DisplayableProcessorService);
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
private processRequests(metricContainer: MetricContainer, requests: I_DisplayableRequest[]): T_DisplayableDataType[] {
  const displayables: T_DisplayableDataType[] = [];
  for (let request of requests) {
    let output = metricContainer.getMetricData(request);
    displayables.push(this._graphService.convert(output));
   }
   return displayables;
}
 

}
