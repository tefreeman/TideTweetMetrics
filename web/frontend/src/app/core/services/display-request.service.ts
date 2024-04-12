import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { MetricService } from './metric.service';
import { BehaviorSubject, combineLatestWith, filter, first, map, Observable, Subject, take } from 'rxjs';
import { MetricContainer } from '../classes/metric-container';
import { I_DisplayableRequest } from '../interfaces/displayable-interface';


@Injectable({
  providedIn: 'root',
})
export class DisplayRequestService {
  private _auth_service = inject(AuthService);
  private _metric_service = inject(MetricService);

  private requests: I_DisplayableRequest[] = [];
  public requests$ = new BehaviorSubject<I_DisplayableRequest[]>([]);

  constructor() {

    this.initRequests();
  }

  private initRequests(): void {
    this.getRequests$().subscribe(requests => {
      this.requests = requests;
      this.requests$.next(this.requests);
    });
  }

  public getRequests$(): Observable<I_DisplayableRequest[]> {
    return this._auth_service.getProfileDoc().pipe(
      filter(profile => !!profile), // Only continue if profile is truthy (not null, undefined, etc.)
      map((profile: any) => {
        console.log(profile);
        return profile.displays;
      }),
      take(1) // Emit the value from the source Observable and then complete, after emitting once
    );
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
