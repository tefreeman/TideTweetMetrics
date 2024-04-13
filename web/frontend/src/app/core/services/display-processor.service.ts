import { inject, Injectable } from '@angular/core';
import { MetricService } from './metric.service';
import { DisplayRequestService } from './display-request.service';
import { I_DisplayableData, I_DisplayableRequest } from '../interfaces/displayable-interface';
import { combineLatestWith, Observable, Subject, switchMap, tap } from 'rxjs';
import { combineLatest } from 'rxjs';
import { GraphProcessorService } from './graph-processor.service';
import { MetricContainer } from '../classes/metric-container';

@Injectable({
  providedIn: 'root'
})
export class DisplayProcessorService {
private _graphService = inject(GraphProcessorService);
private _metricsService = inject(MetricService);
private _displayReqService = inject(DisplayRequestService);

public displayables$: Observable<I_DisplayableData[]>;

constructor() {
  this.displayables$ = combineLatest([
    this._metricsService.getMetricContainer$(),
    this._displayReqService.requests$
  ]).pipe(
    tap(([metricContainer, requests]) =>
      console.log('Processing requests', requests, metricContainer)
    ),
    switchMap(([metricContainer, requests]) =>
      this.processRequests(metricContainer, requests)
    )
  );
}

private processRequests(metricContainer: MetricContainer, requests: I_DisplayableRequest[]): Observable<I_DisplayableData[]> {
  return new Observable(observer => {
    const displayables: I_DisplayableData[] = [];
    for (let request of requests) {
      let output = metricContainer.getMetricData(request);
        displayables.push(output);
    }
    for (let displayable of displayables) {
      displayable.type = this._graphService.convert(displayable);
    }
    observer.next(displayables);
  });
}
 

}
