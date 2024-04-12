import { inject, Injectable } from '@angular/core';
import { MetricService } from './metric.service';
import { DisplayRequestService } from './display-request.service';
import { I_DisplayableData } from '../interfaces/displayable-interface';
import { combineLatestWith, Observable, Subject, switchMap, tap } from 'rxjs';
import { combineLatest } from 'rxjs';
import { GraphProcessorService } from './graph-processor.service';

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

private processRequests(metricContainer: any, requests: any): Observable<I_DisplayableData[]> {
  return new Observable(observer => {
    const displayables: I_DisplayableData[] = [];
    for (let request of requests) {
      let data = metricContainer.getMetricData(request.stat_name, request.owners);
      if (data.length > 0) {
        displayables.push({ ...request, values: data });
      } else {
        console.log('No data for request', request);
      }
    }
    for (let displayable of displayables) {
      displayable.type = this._graphService.convert(displayable);
    }
    observer.next(displayables);
  });
}

}
