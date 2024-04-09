import { inject, Injectable } from '@angular/core';
import { MetricService } from './metric.service';
import { DisplayRequestService } from './DisplayRequest.service';
import { I_DisplayableData } from '../interfaces/displayable-interface';
import { combineLatestWith, Subject } from 'rxjs';
import { combineLatest } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DisplayProcessorService {

private _metricsService = inject(MetricService);
private _displayReqService = inject(DisplayRequestService);

public displayables$ = new Subject<I_DisplayableData[]>();

constructor() {
  combineLatest([
    this._metricsService.metricContainer$,
    this._displayReqService.requests$
  ]).subscribe(([metricContainer, requests]) => {

    console.log('Processing requests', requests, metricContainer);
    this.processRequests(metricContainer, requests);
  });
}

private processRequests(metricContainer: any, requests: any) {
  for (let request of requests) {
    let data = metricContainer.getMetricData(request.stat_name, request.owners);
    const displayables = [];
    if (data.length > 0) {
      displayables.push({ ...request, values: data });
    } else {
      console.log('No data for request', request);
    }
    this.displayables$.next(displayables);
  }
}

}
