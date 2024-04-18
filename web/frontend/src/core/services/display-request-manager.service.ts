import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { BehaviorSubject, filter, first, map, Observable } from 'rxjs';
import { I_DisplayableRequest, I_DisplayableRequestMap } from '../interfaces/displayable-interface';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root',
})
export class DisplayRequestManagerService {
  private _auth_service = inject(AuthService);
  private _mockDataService = inject(MockDataService);

  private requests$ = new BehaviorSubject<I_DisplayableRequestMap>({});

  constructor() {
    this.initRequests();
  }

  public getRequestsByName(page: string, name: string): Observable<I_DisplayableRequest[]> {
    return this.requests$.pipe(
      map(requests => {
        // Directly return the displayables if the key exists, otherwise an empty array
        return requests[page]?.[name]?.displayables || [];
      })
    );
  }

  private initRequests(): void {
    this.getRequests$().subscribe(requests => {
      if (this._mockDataService.overrideProfile == true) {
        this.requests$.next(this._mockDataService.getMockData());
      } else {
        this.requests$.next(requests);
      }
    });
  }

  public getRequests$(): Observable<I_DisplayableRequestMap> {
    return this._auth_service.getProfileDoc().pipe(
      filter(profile => !!profile), // Only continue if profile is truthy
      map(profile => profile!.displays),
      first() // Complete after the first emission
    );
  }

  addRequest(request: I_DisplayableRequest, type: 'graph' | 'stat', page: string, name: string): void {
    this.requests$.pipe(first()).subscribe(requests => {
      // Ensure the structure for page and name exists
      if (!requests[page]) {
        requests[page] = {};
      }
      if (!requests[page][name]) {
        requests[page][name] = { displayables: [], type };
      }
      // Add the new request
      requests[page][name].displayables.push(request);
      this.requests$.next({...requests}); // Emit the modified copy
    });
  }

  addDisplay(page: string, name: string, type: 'graph' | 'stat'): void {
    this.requests$.pipe(first()).subscribe(requests => {
      // Ensure the structure for page and name exists
      if (!requests[page]) {
        requests[page] = {};
      }
      if (!requests[page][name]) {
        requests[page][name] = { displayables: [], type };
      }

    });
  }

  removeDisplay(page: string, name: string): void {
    this.requests$.pipe(first()).subscribe(requests => {
      // Ensure the structure for page and name exists
      if (!requests[page]) {
        return;
      }
      if (!requests[page][name]) {
        return;
      }
      delete requests[page][name];

    });
  }
  
  removeRequest(page: string, name: string, index: number): void {
    this.requests$.pipe(first()).subscribe(requests => {
      let requestSet = requests[page]?.[name];
      if (requestSet && requestSet.displayables.length > index) {
        requestSet.displayables.splice(index, 1);
        this.requests$.next({...requests}); // Emit the modified requests map
      }
    });
  }

  editRequest(page: string, name: string, request: I_DisplayableRequest, index: number): void {
    this.requests$.pipe(first()).subscribe(requests => {
      let requestSet = requests[page]?.[name];
      if (requestSet && requestSet.displayables.length > index) {
        requestSet.displayables[index] = request;
        this.requests$.next({...requests}); // Emit the modified requests map
      }
    });
  }
}
