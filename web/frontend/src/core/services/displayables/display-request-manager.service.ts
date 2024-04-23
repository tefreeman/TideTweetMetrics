import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import {
  T_DisplayableDataType,
  T_GridType,
} from '../../interfaces/displayable-data-interface';
import {
  I_DisplayableRequest,
  T_DisplayableTypeString,
} from '../../interfaces/displayable-interface';
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
        console.log(pageEntry, name, type);
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
    request: I_DisplayableRequest | T_DisplayableDataType,
    type: T_GridType,
    page: string,
    name: string
  ): void {
    // Check if request is of type T_DisplayableDataType and convert it to I_DisplayableRequest.
    if (this.isDisplayableDataType(request)) {
      request = this.convertToDisplayableRequest(request);
    }

    // Proceed with adding the displayable as before.
    this._dashboardPageManagerService.getGrid$(page, name).subscribe((grid) => {
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
    request: I_DisplayableRequest[] | T_DisplayableDataType[],
    type: 'graph' | 'stat',
    page: string,
    name: string
  ): void {
    let displayableRequests: I_DisplayableRequest[];
    console.log('REQUEST WAS ', request);
    // Check if the first item in the request array is of type T_DisplayableDataType and convert all to I_DisplayableRequest if true.
    if (this.isDisplayableDataType(request[0])) {
      displayableRequests = (request as T_DisplayableDataType[]).map((req) =>
        this.convertToDisplayableRequest(req)
      );
    } else {
      displayableRequests = request as I_DisplayableRequest[];
    }
    console.log('REQUEST BECAME ', displayableRequests);
    // Proceed with adding the displayables.
    this._dashboardPageManagerService.getGrid$(page, name).subscribe((grid) => {
      if (grid && grid.type === type) {
        if (!grid.displayables) {
          grid.displayables = [];
        }
        // Append all displayable requests.
        grid.displayables.push(...displayableRequests);
        this._dashboardPageManagerService.updateGrid$(page, name, grid);
      } else {
        console.error(
          `Grid not found or type mismatch for page: '${page}', name: '${name}', type: '${type}'.`
        );
      }
    });
  }

  /**
   * Checks if the request is of type T_DisplayableDataType.
   * @param request - The request to check.
   * @returns A boolean indicating if the request is of type T_DisplayableDataType.
   */
  private isDisplayableDataType(
    request: any
  ): request is T_DisplayableDataType {
    if (request.metricName) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Converts a T_DisplayableDataType to an I_DisplayableRequest.
   * @param data - The data to convert.
   * @returns The converted displayable request.
   */
  private convertToDisplayableRequest(
    data: T_DisplayableDataType
  ): I_DisplayableRequest {
    let stat_name = data.metricName;
    let ownersParams = data.ownersParams;
    let type = data.type as T_DisplayableTypeString; // Ensure the type aligns with T_GraphType enum values.

    // Return a new object that matches I_DisplayableRequest.
    return { stat_name, ownersParams, type };
  }

  /**
   * Retrieves display names with order for a given page and type.
   * @param page - The page name.
   * @param type - The grid type ('graph' or 'stat').
   * @returns An observable of display names with order.
   */
  getDisplayNamesWithOrder$(
    page: string,
    type: 'graph' | 'stat'
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
      if (grid && grid.displayables.length > index) {
        // Check if the displayable at the specified index has a groupId
        const groupId = grid.displayables[index].groupId;
        if (groupId) {
          // If groupId exists, remove all displayables with this groupId
          this.removeDisplayablesByGroupId(page, name, groupId);
        } else {
          // Otherwise, just remove the single displayable at the index
          grid.displayables.splice(index, 1);
          this._dashboardPageManagerService.updateGrid$(page, name, grid);
        }
      }
    });
  }

  /**
 * Removes all displayable requests with a specified groupId across all cards in a given page.
 * @param page - The page name.
 * @param groupId - The groupId to match for removal.
 */
  removeDisplayablesByGroupId(page: string, gridName: string, groupId: string): void {
    this._dashboardPageManagerService.getGrid$(page, gridName).subscribe((grid) => {
      if (grid) {
        // Filter out displayables that match the groupId
        const filteredDisplayables = grid.displayables.filter(displayable => displayable.groupId !== groupId);
        console.log("filtering on:", groupId, 'Filtered displayables:', filteredDisplayables, 'Original displayables:', grid.displayables);
        // Only update the grid if there are changes in the displayables array
        if (grid.displayables.length !== filteredDisplayables.length) {
          grid.displayables = filteredDisplayables;
          this._dashboardPageManagerService.updateGrid$(page, gridName, grid);
        }
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
