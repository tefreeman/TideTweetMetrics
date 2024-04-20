import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { BehaviorSubject, filter, first, map, Observable, take, tap } from 'rxjs';
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
  private getName(type:string, name: string) {
    return name + "-" + type;
  }

  private getNonKeyName(name: string) {
    return name.split('-')[0];
  }

  public saveRequests(): void {
    this.requests$.pipe(first()).subscribe(requests => {
      this._auth_service.setProfileDoc({ displays: requests });
    });
  }
  
  public getRequests$(): Observable<I_DisplayableRequestMap> {
    return this._auth_service.getProfileDoc().pipe(
      filter(profile => !!profile), // Only continue if profile is truthy
      map(profile => profile!.displays),
      first() // Complete after the first emission
    );
  }

  public getPageNames$(): Observable<string[]> {
    return this.requests$.pipe(
      map(requests => Object.keys(requests))
    );
  }

  public addPage$(page: string): void {
    this.requests$.pipe(first()).subscribe(requests => {
      if (!requests[page]) { // Check if the page already exists
        requests[page] = {}; // Add a new page to the array
        this.requests$.next({ ...requests }); // Emit the modified copy
      } else {
        console.error(`Page "${page}" already exists`); // Handle edge case where page already exists
      }
    });
  }
  

  addRequest(request: I_DisplayableRequest, type: 'graph' | 'stat', page: string, name: string): void {
    this.requests$.pipe(first()).subscribe(requests => {
      // Ensure the structure for page and name exists
      if (!requests[page]) {
        requests[page] = {};
      }
      if (!requests[page][this.getName(type, name)]) {
        requests[page][this.getName(type, name)] = { displayables: [], type };
      }
      // Add the new request
      requests[page][this.getName(type, name)].displayables.push(request);
      this.requests$.next({...requests}); // Emit the modified copy
    });
  }

  addDisplay(page: string, name: string, type: 'graph' | 'stat'): void {
    this.requests$.pipe(first()).subscribe(requests => {
      // Ensure the structure for page and name exists
      if (!requests[page]) {
        requests[page] = {};
      }
      if (!requests[page][this.getName(type, name)]) {
        requests[page][this.getName(type, name)] = { displayables: [], type };
      }

    });
  }

  getDisplayNames$(page: string, type: 'graph' | 'stat'): Observable<string[]> {
    return this.requests$.pipe(
      take(1),
      map(requests => {
        return Object.keys(requests[page] || {}).filter(name => requests[page][name].type === type)
        .map(name => this.getNonKeyName(name));
      })
    );
  }
  removeDisplay(page: string, name: string, type: string): void {
    this.requests$.pipe(first()).subscribe(requests => {
      // Ensure the structure for page and name exists
      if (!requests[page]) {
        return;
      }
      if (!requests[page][this.getName(type, name)]) {
        return;
      }
      delete requests[page][this.getName(type, name)];

    });
  }

  removeRequest(page: string, name: string, type:string, index: number): void {
    this.requests$.pipe(first()).subscribe(requests => {
      let requestSet = requests[page]?.[this.getName(type, name)];
      if (requestSet && requestSet.displayables.length > index) {
        requestSet.displayables.splice(index, 1);
        this.requests$.next({...requests}); // Emit the modified requests map
      }
    });
  }

  editRequest(page: string, name: string, type: string, request: I_DisplayableRequest, index: number): void {
    this.requests$.pipe(first()).subscribe(requests => {
      let requestSet = requests[page]?.[this.getName(type, name)];
      if (requestSet && requestSet.displayables.length > index) {
        requestSet.displayables[index] = request;
        this.requests$.next({...requests}); // Emit the modified requests map
      }
    });
  }


}
