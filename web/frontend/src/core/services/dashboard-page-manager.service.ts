import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(private router: Router) {
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
        if (requests) {
          this.pageMap$.next(requests);
        } else {
          this.router.navigate(['dashboard/start']);
        }
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
   * Checks if a page exists in the page map.
   * @param page - The name of the page to check.
   * @returns An observable that emits true if the page exists, else false.
   */
  public isAPage$(page: string): Observable<boolean> {
    return this.pageMap$.pipe(
      map((requests) => !!requests[page]) // map to a boolean indicating the presence of the page
    );
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
    this.pageMap$.pipe(
      first(),
      map(requests => {
        // Create a deep clone if necessary to avoid direct mutations - shallow copy might be sufficient based on structure
        const updatedRequests = JSON.parse(JSON.stringify(requests));
        
        if (updatedRequests[pageName] && updatedRequests[pageName][gridName]) {
          delete updatedRequests[pageName][gridName];
        } else {
          console.error(`Grid "${gridName}" or Page "${pageName}" does not exist`);
        }
  
        return updatedRequests;
    })).subscribe((updatedRequests) => {
      // Emit the changes to all subscribers
      this.emitChanges(updatedRequests);
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

  /**
   * Adds a new grid to the end of a page in the page map based on the order.
   * @param pageName - The name of the page.
   * @param gridName - The name of the new grid.
   * @param gridEntry - The grid entry object without the order.
   */
  public addGridToEnd$(
    pageName: string,
    gridName: string,
    gridEntry: Omit<I_GridRequestEntry, 'order'>
  ) {
    this.pageMap$.pipe(first()).subscribe((requests) => {
      if (requests[pageName] && !requests[pageName]?.[gridName]) {
        // Calculate the new order by finding the max order in the current grids and adding 1
        const maxOrder = Math.max(
          0,
          ...Object.values(requests[pageName]).map((grid) => grid.order)
        );
        const newGridEntry = {
          ...gridEntry, // Spread the gridEntry to include all other properties
          order: maxOrder + 1, // Set the order to be one more than the maximum found
        };

        // Add the new grid with calculated order at the "end"
        requests[pageName][gridName] = newGridEntry;
        this.emitChanges({ ...requests });
      } else {
        if (requests[pageName]?.[gridName]) {
          console.error(
            `Grid "${gridName}" already exists in page "${pageName}".`
          );
        } else {
          console.error(`Page "${pageName}" does not exist.`);
        }
      }
    });
  }

  /**
   * Creates a blank grid with the specified type and adds it to the end of the specified page.
   * @param pageName - The name of the page where the grid will be added.
   * @param gridName - The name of the new grid.
   * @param type - The type of the grid (either 'graph' or 'stat').
   */
  public createAndAddGridToEnd$(
    pageName: string,
    gridName: string,
    type: 'graph' | 'stat'
  ) {
    // Creating a blank I_GridRequestEntry
    const blankGridEntry: Omit<I_GridRequestEntry, 'order'> = {
      displayables: [], // Assuming a blank grid means no displayable items initially
      type: type,
    };

    // Utilizing the previously defined method to add this grid to the end
    this.addGridToEnd$(pageName, gridName, blankGridEntry);
  }
}
