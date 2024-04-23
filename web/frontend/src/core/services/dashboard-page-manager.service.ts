import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, filter, first, map } from 'rxjs';
import {
  I_GridEntry,
  I_GridRequestEntry,
  I_GridRequestEntryWithName,
  I_PageMap,
} from '../interfaces/pages-interface';
import { AuthService } from './auth.service';
import { MockDataService } from './mock-data.service';

/**
 * Service responsible for managing the dashboard pages.
 */
@Injectable({
  providedIn: 'root',
})
export class DashboardPageManagerService {
  private _auth_service = inject(AuthService);
  private _mockDataService = inject(MockDataService);
  private pageMap$ = new BehaviorSubject<I_PageMap>({});

  /**
   * Observable that emits a null value whenever a change is detected.
   */
  public changeDetected$ = new BehaviorSubject<null>(null);
  private unsavedChanges = false;

  constructor() {
    this.initPages();
  }

  /**
   * Emits the changes made to the page map.
   * @param newPageMap - The updated page map.
   */
  private emitChanges(newPageMap: I_PageMap) {
    console.log('Emitting changes', newPageMap);
    this.pageMap$.next(newPageMap);
    this.unsavedChanges = true;
  }

  /**
   * Initializes the pages by retrieving them from the server.
   */
  private initPages(): void {
    this.getPages$().subscribe((requests) => {
      console.log('subscribing to getPages$');
      if (this._mockDataService.overrideProfile == true) {
        this.pageMap$.next(this._mockDataService.getMockData());
      } else {
        this.pageMap$.next(requests);
      }
    });
  }

  /**
   * Retrieves a specific page from the page map.
   * @param page - The name of the page.
   * @returns An observable that emits the grid entry of the specified page.
   */
  public getPage$(page: string): Observable<I_GridEntry> {
    return this.pageMap$.pipe(
      map((pages) => pages[page]),
      filter((page) => !!page)
    );
  }

  /**
   * Retrieves the entire page map.
   * @returns An observable that emits the page map.
   */
  private getPages$(): Observable<I_PageMap> {
    return this._auth_service.getProfileDoc().pipe(
      filter((profile) => !!profile), // Only continue if profile is truthy
      map((profile) => profile!.displays),
      first() // Complete after the first emission
    );
  }

  /**
   * Saves the current page map.
   */
  public savePage(): void {
    this.pageMap$.pipe(first()).subscribe((requests) => {
      console.log('SAVING: ', requests);
      this._auth_service
        .setProfileDoc({ displays: requests })
        .subscribe((response) => {
          console.log('Saved page', response);
          this.unsavedChanges = false;
        });
    });
  }

  /**
   * Retrieves the names of all the pages in the page map.
   * @returns An observable that emits an array of page names.
   */
  public getPageNames$(): Observable<string[]> {
    return this.pageMap$.pipe(map((pages) => Object.keys(pages)));
  }

  /**
   * Adds a new page to the page map.
   * @param page - The name of the new page.
   */
  public addNewPage$(page: string): void {
    this.pageMap$.pipe(first()).subscribe((requests) => {
      if (!requests[page]) {
        // Check if the page already exists
        requests[page] = {}; // Add a new page to the array
        this.emitChanges({ ...requests });
      } else {
        console.error(`Page "${page}" already exists`); // Handle edge case where page already exists
      }
    });
  }

  /**
   * Deletes a page from the page map.
   * @param page - The name of the page to delete.
   */
  public deletePage$(page: string): void {
    this.pageMap$.pipe(first()).subscribe((requests) => {
      if (requests[page]) {
        delete requests[page];
        this.emitChanges({ ...requests });
      } else {
        console.error(`Page "${page}" does not exist`);
      }
    });
  }

  /**
   * Retrieves a specific grid from a page in the page map.
   * @param pageName - The name of the page.
   * @param gridName - The name of the grid.
   * @returns An observable that emits the grid entry of the specified grid.
   */
  public getGrid$(pageName: string, gridName: string) {
    return this.getPage$(pageName).pipe(
      map((page) => page[gridName]),
      filter((grid) => !!grid),
      first()
    );
  }

  /**
   * Retrieves all the grids from a page in the page map.
   * @param pageName - The name of the page.
   * @returns An observable that emits the page's grid entries.
   */
  public getGrids$(pageName: string): Observable<I_GridEntry> {
    return this.getPage$(pageName);
  }

  /**
   * Deletes a specific grid from a page in the page map.
   * @param pageName - The name of the page.
   * @param gridName - The name of the grid to delete.
   */
  public deleteGrid$(pageName: string, gridName: string) {
    this.pageMap$.pipe(first()).subscribe((requests) => {
      if (requests[pageName]) {
        delete requests[pageName][gridName];
        this.emitChanges({ ...requests });
      } else {
        console.error(`Grid "${gridName}" does not exist`);
      }
    });
  }

  /**
   * Adds a new grid to a page in the page map.
   * @param pageName - The name of the page.
   * @param gridName - The name of the new grid.
   * @param gridEntry - The grid entry object.
   */
  public addGrid$(
    pageName: string,
    gridName: string,
    gridEntry: I_GridRequestEntry
  ) {
    this.pageMap$.pipe(first()).subscribe((requests) => {
      if (requests[pageName] && !requests[pageName]?.[gridName]) {
        requests[pageName][gridName] = gridEntry;
        this.emitChanges({ ...requests });
      } else {
        console.error(
          `Page "${pageName}" does not exist or grid "${gridName}" already exists`
        );
      }
    });
  }

  /**
   * Updates an existing grid in a page of the page map.
   * @param pageName - The name of the page.
   * @param gridName - The name of the grid to update.
   * @param gridEntry - The updated grid entry object.
   */
  public updateGrid$(
    pageName: string,
    gridName: string,
    gridEntry: I_GridRequestEntry
  ) {
    this.pageMap$.pipe(first()).subscribe((requests) => {
      if (requests[pageName] && requests[pageName]?.[gridName]) {
        requests[pageName][gridName] = gridEntry;
        this.emitChanges({ ...requests });
      } else {
        console.error(
          `Page "${pageName}" does not exist or grid "${gridName}" does not exist`
        );
      }
    });
  }

  /**
   * Updates multiple grids in a page of the page map.
   * @param pageName - The name of the page.
   * @param grids - An array of grid entries with names.
   */
  public updateGrids$(pageName: string, grids: I_GridRequestEntryWithName[]) {
    this.pageMap$.pipe(first()).subscribe((requests) => {
      let updatesMade = false;
      console.log('UPDATING GRIDS', grids);
      grids.forEach((grid) => {
        const { name, ...gridEntry } = grid;

        if (requests[pageName] && requests[pageName][name]) {
          requests[pageName][name] = gridEntry; // Update with gridEntry excluding the name
          updatesMade = true;
        } else {
          console.error(
            `Page "${pageName}" does not exist or grid "${name}" does not exist`
          );
        }
      });
      console.log('EMITTING REQUESTS', requests);
      if (updatesMade) {
        this.emitChanges({ ...requests });
      }
    });
  }
}
