import { inject, Injectable } from '@angular/core';
import { MetricService } from './metric.service';
import { DisplayRequestManagerService } from './display-request-manager.service';
import { IDisplayableStats, I_DisplayableRequest, T_DisplayableDataType } from '../interfaces/displayable-interface';
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

public displayables$: Observable<T_DisplayableDataType[]>;

constructor() {
  this.displayables$ = combineLatest([
    this._metricsService.getMetricContainer$(),
    this._displayReqService.requests$
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
