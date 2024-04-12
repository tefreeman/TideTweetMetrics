import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { MetricService } from './metric.service';
import { BehaviorSubject, combineLatestWith, filter, first, map, Observable, Subject, take } from 'rxjs';
import { MetricContainer } from '../classes/metric-container';
import { I_DisplayableRequest } from '../interfaces/displayable-interface';
import { MockDataService } from './mock-data.service';


@Injectable({
  providedIn: 'root',
})
export class DisplayRequestService {
  private _auth_service = inject(AuthService);
  private _metric_service = inject(MetricService);
  _mockDataService = inject(MockDataService);
  private requests: I_DisplayableRequest[] = [];
  public requests$ = new BehaviorSubject<I_DisplayableRequest[]>([]);


  constructor() {
    this.initRequests();
    this._mockDataService;
}

private initRequests(): void {
    this.getRequests$().subscribe(requests => {
        this.requests = requests;
        if (this._mockDataService.overrideProfile == true)
          this.requests = this._mockDataService.getMockData();
        else
          this.requests = this.requests.concat(this._mockDataService.getMockData());


        this.requests$.next(this.requests); // Emit a copy of the requests array
    });
}

public getRequests$(): Observable<I_DisplayableRequest[]> {
    return this._auth_service.getProfileDoc().pipe(
        filter(profile => !!profile), // Only continue if profile is truthy (not null, undefined, etc.)
        map(profile => profile!.displays),
        take(1) // Emit the value from the source Observable and then complete, after emitting once
    );
}

addRequest(request: I_DisplayableRequest, index: number): void {
    const newRequests = [...this.requests];         // Copy the array
    newRequests.splice(index, 0, request);          // Modify the copy
    this.requests$.next(newRequests);               // Emit the modified copy
    this.requests = newRequests;                    // Update the internal state
}

removeRequest(index: number): void {
    const newRequests = [...this.requests];
    newRequests.splice(index, 1);
    this.requests$.next(newRequests);
    this.requests = newRequests;
}

editRequest(request: I_DisplayableRequest, index: number): void {
    const newRequests = [...this.requests];
    newRequests[index] = request;
    this.requests$.next(newRequests);
    this.requests = newRequests;
}
}