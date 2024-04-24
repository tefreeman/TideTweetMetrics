import { inject, Injectable } from '@angular/core';
import { catchError, first, map, Observable, of } from 'rxjs';
import { T_GridType } from '../../interfaces/displayable-data-interface';
import { I_DisplayableRequest } from '../../interfaces/displayable-interface';
import { DashboardPageManagerService } from '../dashboard-page-manager.service';

/**
 * Service responsible for managing display requests.
 */
@Injectable({
  providedIn: 'root',
})
export class DisplayRequestManagerService {
  private _dashboardPageManagerService = inject(DashboardPageManagerService);

  constructor() {}

  /**
   * Retrieves displayable requests by name.
   * @param page - The page name.
   * @param name - The displayable name.
   * @param type - The grid type.
   * @returns An observable of displayable requests.
   */
  public getRequestsByName(
    page: string,
    name: string,
    type: T_GridType
  ): Observable<I_DisplayableRequest[]> {
    return this._dashboardPageManagerService.getPage$(page).pipe(
      map((pageEntry) => {
        return pageEntry[name]?.displayables || [];
      })
    );
  }

  /**
   * Adds a displayable request.
   * @param request - The displayable request or data type.
   * @param type - The grid type.
   * @param page - The page name.
   * @param name - The displayable name.
   */
  addDisplayable(
    request: I_DisplayableRequest,
    type: T_GridType,
    page: string,
    name: string
  ): void {
    this._dashboardPageManagerService
      .getGrid$(page.toLowerCase(), name.toLowerCase())
      .pipe(first())
      .subscribe((grid) => {
        console.log(grid);
        if (grid && grid.type === type) {
          if (!grid.displayables) {
            grid.displayables = [];
          }
          grid.displayables.push(request);
          this._dashboardPageManagerService.updateGrid$(page, name, grid);
        } else {
          console.error(
            `Grid not found or type mismatch for page: '${page}', name: '${name}', type: '${type}'.`
          );
        }
      });
  }

  /**
   * Adds multiple displayable requests.
   * @param request - The array of displayable requests or data types.
   * @param type - The grid type ('graph' or 'stat').
   * @param page - The page name.
   * @param name - The displayable name.
   */
  addDisplayables(
    requests: I_DisplayableRequest[],
    type: T_GridType,
    page: string,
    name: string
  ): void {
    this._dashboardPageManagerService
      .getGrid$(page, name)
      .pipe(first())
      .subscribe((grid) => {
        if (grid && grid.type === type) {
          if (!grid.displayables) {
            grid.displayables = [];
          }
          // Append all displayable requests.
          grid.displayables.push(...requests);
          this._dashboardPageManagerService.updateGrid$(page, name, grid);
        } else {
          console.error(
            `Grid not found or type mismatch for page: '${page}', name: '${name}', type: '${type}'.`
          );
        }
      });
  }

  /**
   * Retrieves display names with order for a given page and type.
   * @param page - The page name.
   * @param type - The grid type ('graph' or 'stat').
   * @returns An observable of display names with order.
   */
  getDisplayNamesWithOrder$(
    page: string,
    type: T_GridType
  ): Observable<{ name: string; order: number }[]> {
    return this._dashboardPageManagerService.getPage$(page).pipe(
      map((pageGrids) =>
        Object.entries(pageGrids || {})
          .filter(([name, grid]) => grid.type === type)
          .map(([name, grid]) => ({
            name: name, // Modify as needed
            order: grid.order,
          }))
          .sort((a, b) => a.order - b.order)
      ),

      catchError((error) => {
        // Handle error scenario, possibly returning an empty array or a default value
        console.log('Error fetching page:', error);
        return of([]);
      })
    );
  }

  /**
   * Removes a displayable request.
   * @param page - The page name.
   * @param name - The displayable name.
   * @param type - The grid type.
   * @param index - The index of the displayable request to remove.
   */
  removeDisplayable(
    page: string,
    name: string,
    type: string,
    index: number
  ): void {
    this._dashboardPageManagerService.getGrid$(page, name).subscribe((grid) => {
      if (!grid) {
        console.error('Grid is not defined!');
        return;
      }
      // Check if index is in the valid range
      if (index >= 0 && index < grid.displayables.length) {
        console.log(`Removing single displayable at logical index ${index}.`);
        grid.displayables.splice(index, 1);
        this._dashboardPageManagerService.updateGrid$(page, name, grid);
      } else {
        console.error(
          `Index ${index} is out of bounds for displayables array.`
        );
      }
    });
  }

  /**
   * Edits a displayable request.
   * @param page - The page name.
   * @param name - The displayable name.
   * @param type - The grid type.
   * @param request - The updated displayable request.
   * @param index - The index of the displayable request to edit.
   */
  editDisplayable(
    page: string,
    name: string,
    type: string,
    request: I_DisplayableRequest,
    index: number
  ): void {
    this._dashboardPageManagerService.getGrid$(page, name).subscribe((grid) => {
      if (grid && grid.displayables.length > index) {
        grid.displayables[index] = request;
        this._dashboardPageManagerService.updateGrid$(page, name, grid);
      }
    });
  }
}
