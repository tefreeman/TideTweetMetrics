import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, defaultIfEmpty, distinctUntilChanged, filter, first, map, mergeMap, of, tap } from 'rxjs';
import { I_GridRequestEntry, I_GridEntry, I_PageMap } from '../interfaces/pages-interface';
import { AuthService } from './auth.service';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})

export class DashboardPageManagerService {

  private _auth_service = inject(AuthService);
  private _mockDataService = inject(MockDataService);
  private  pageMap$ = new BehaviorSubject<I_PageMap>({});

  public changeDetected$ = new BehaviorSubject<null>(null);
  private unsavedChanges = false;

  constructor() {
    this.initPages();
   }


   private emitChanges(newPageMap: I_PageMap) {
    console.log('Emitting changes', newPageMap);
    this.pageMap$.next(newPageMap);
    this.unsavedChanges = true;
   }


   private initPages(): void {
    this.getPages$().subscribe(requests => {
      console.log("subscribing to getPages$");
      if (this._mockDataService.overrideProfile == true) {
        this.pageMap$.next(this._mockDataService.getMockData());
      } else {
        this.pageMap$.next(requests);
      }
    });
  }

  public getPage$(page: string): Observable<I_GridEntry> {
    return this.pageMap$.pipe(
      map(pages => pages[page]),
      filter(page => !!page),
      first()
    );
  }

  private getPages$(): Observable<I_PageMap> {
    return this._auth_service.getProfileDoc().pipe(
      filter(profile => !!profile), // Only continue if profile is truthy
      map(profile => profile!.displays),
      first() // Complete after the first emission
    );
  }

  public savePage(): void {
    this.pageMap$.pipe(first()).subscribe(requests => {
      console.log("SAVING: ", requests);
      this._auth_service.setProfileDoc({ displays: requests }).subscribe((response) => {
        console.log('Saved page', response);
        this.unsavedChanges = false;
      });
    });
  }

  public getPageNames$(): Observable<string[]> {
    return this.pageMap$.pipe(
      map(pages => Object.keys(pages))
    );
  }

  public addNewPage$(page: string): void {
    this.pageMap$.pipe(first()).subscribe(requests => {
      if (!requests[page]) { // Check if the page already exists
        requests[page] = {}; // Add a new page to the array
        this.emitChanges({ ...requests }); 
      } else {
        console.error(`Page "${page}" already exists`); // Handle edge case where page already exists
      }
    });
  }
  

  public deletePage$(page: string): void {
    this.pageMap$.pipe(first()).subscribe(requests => {
      if (requests[page]) { 
        delete requests[page]; 
        this.emitChanges({ ...requests });
      } else {
        console.error(`Page "${page}" does not exist`); 
      }
    });
  }


  public getGrid$(pageName: string, gridName: string) {
    return this.getPage$(pageName).pipe(
      map(page => page[gridName]),
      filter(grid => !!grid),
      first()
    );
  }

  public getGrids$(pageName: string): Observable<I_GridEntry> {
    return this.getPage$(pageName);
  }


  public deleteGrid$(pageName: string, gridName: string) {
    this.pageMap$.pipe(first()).subscribe(requests => {
      if (requests[pageName]) {
        delete requests[pageName][gridName];
        this.emitChanges({ ...requests });
      } else {
        console.error(`Grid "${gridName}" does not exist`);
      }
    });
  }

  public addGrid$(pageName: string, gridName: string, gridEntry: I_GridRequestEntry) {
    this.pageMap$.pipe(first()).subscribe(requests => {
      if (requests[pageName] && !requests[pageName]?.[gridName]) {
        requests[pageName][gridName] = gridEntry;
        this.emitChanges({ ...requests });
      } else {
        console.error(`Page "${pageName}" does not exist or grid "${gridName}" already exists`);
      }
    });
  }

  public updateGrid$(pageName: string, gridName: string, gridEntry: I_GridRequestEntry) {
    this.pageMap$.pipe(first()).subscribe(requests => {
      if (requests[pageName] && requests[pageName]?.[gridName]) {
        requests[pageName][gridName] = gridEntry;
        this.emitChanges({ ...requests });
      } else {
        console.error(`Page "${pageName}" does not exist or grid "${gridName}" does not exist`);
      }
    });
  }
}
