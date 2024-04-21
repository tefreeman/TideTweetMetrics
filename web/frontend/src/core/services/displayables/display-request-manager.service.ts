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

@Injectable({
  providedIn: 'root',
})
export class DisplayRequestManagerService {
  private _dashboardPageManagerService = inject(DashboardPageManagerService);

  constructor() {}

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

  addDisplayables(
    request: I_DisplayableRequest[] | T_DisplayableDataType[],
    type: 'graph' | 'stat',
    page: string,
    name: string
  ): void {
    let displayableRequests: I_DisplayableRequest[];

    // Check if the first item in the request array is of type T_DisplayableDataType and convert all to I_DisplayableRequest if true.
    if (this.isDisplayableDataType(request[0])) {
      displayableRequests = (request as T_DisplayableDataType[]).map((req) =>
        this.convertToDisplayableRequest(req)
      );
    } else {
      displayableRequests = request as I_DisplayableRequest[];
    }

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

  // Helper method to check if the type is T_DisplayableDataType.
  private isDisplayableDataType(
    request: any
  ): request is T_DisplayableDataType {
    return 'type' in request;
  }

  // Convert T_DisplayableDataType to I_DisplayableRequest.
  private convertToDisplayableRequest(
    data: T_DisplayableDataType
  ): I_DisplayableRequest {
    let stat_name = data.metricName;
    let ownersParams = data.ownersParams;
    let type = data.type as T_DisplayableTypeString; // Ensure the type aligns with T_GraphType enum values.

    // Return a new object that matches I_DisplayableRequest.
    return { stat_name, ownersParams, type };
  }

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

  removeDisplayable(
    page: string,
    name: string,
    type: string,
    index: number
  ): void {
    this._dashboardPageManagerService.getGrid$(page, name).subscribe((grid) => {
      if (grid && grid.displayables.length > index) {
        grid.displayables.splice(index, 1);
        this._dashboardPageManagerService.updateGrid$(page, name, grid);
      }
    });
  }

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
