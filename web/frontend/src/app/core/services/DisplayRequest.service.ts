import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { MetricService } from './metric.service';
import { BehaviorSubject, combineLatestWith, filter, first, Subject } from 'rxjs';
import { MetricContainer } from '../classes/metric-container';
import { I_DisplayableRequest } from '../interfaces/displayable-interface';


@Injectable({
  providedIn: 'root',
})
export class DisplayRequestService {
  private _auth_service = inject(AuthService);
  private _metric_service = inject(MetricService);

  private requests: I_DisplayableRequest[] = [];
  public requests$ = new Subject<I_DisplayableRequest[]>;

  constructor() {
    this._auth_service.getProfileDoc().pipe(
      filter(profile => !!profile), // Only continue if profile is truthy (not null, undefined, etc.)lete after the first valid profile is received
    ).subscribe((profile: any) => {
      console.log(profile);
      this.requests = profile.displays;
      this.requests$.next(this.requests);
    });
  }

  addRequest(request: I_DisplayableRequest, index: number): void {
    this.requests.splice(index, 0, request);
    this.requests$.next(this.requests);
  }

  removeRequest(index: number): void {
    this.requests.splice(index, 1);
    this.requests$.next(this.requests);
  }

  editRequest(request: I_DisplayableRequest, index: number): void {
    this.requests[index] = request;
    this.requests$.next(this.requests);
  }
}
