import { inject, Injectable } from '@angular/core';
import { MetricService } from './metric.service';
import { DisplayRequestService } from './display-request.service';
import { I_DisplayableData, I_DisplayableRequest, T_DisplayableData } from '../interfaces/displayable-interface';
import { combineLatestWith, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { combineLatest } from 'rxjs';
import { GraphProcessorService } from './graph-processor.service';
import { MetricContainer } from './metric-container';

@Injectable({
  providedIn: 'root'
})
export class DisplayProcessorService {
private _graphService = inject(GraphProcessorService);
private _metricsService = inject(MetricService);
private _displayReqService = inject(DisplayRequestService);

public displayables$: Observable<T_DisplayableData[]>;

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

private processRequests(metricContainer: MetricContainer, requests: I_DisplayableRequest[]): T_DisplayableData[] {
  const displayables: T_DisplayableData[] = [];
  for (let request of requests) {
    let output = metricContainer.getMetricData(request);
    displayables.push(this._graphService.convert(output));
   }
   return displayables;
}
 

}
