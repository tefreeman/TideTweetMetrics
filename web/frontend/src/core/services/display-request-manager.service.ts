import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { BehaviorSubject, catchError, filter, first, map, Observable, of, take, tap } from 'rxjs';
import { I_DisplayableRequest } from '../interfaces/displayable-interface';
import { I_PageMap } from "../interfaces/pages-interface";
import { MockDataService } from './mock-data.service';
import { DashboardPageManagerService } from './dashboard-page-manager.service';

@Injectable({
  providedIn: 'root',
})
export class DisplayRequestManagerService {
  private _dashboardPageManagerService = inject(DashboardPageManagerService);


  constructor() {

  }

  public getRequestsByName(page: string, name: string, type: string): Observable<I_DisplayableRequest[]> {
    return this._dashboardPageManagerService.getPage$(page).pipe(
      map(pageEntry => {
        console.log(pageEntry, name, type)
        return pageEntry[name]?.displayables || [];
      })
    );
  }


  addDisplayable(request: I_DisplayableRequest, type: 'graph' | 'stat', page: string, name: string): void {
    this._dashboardPageManagerService.getGrid$(page, name).subscribe({
      next: (grid) => {
        // Grid exists, update it
        grid.displayables.push(request);
        this._dashboardPageManagerService.updateGrid$(page, name, grid);
      },
      error: () => {
        // Grid does not exist, handle the error by creating a new grid
        // This assumes your getGrid$ is set up to throw an error if the grid doesn't exist
        const newGrid = { displayables: [request], type, order: 0 };
        this._dashboardPageManagerService.addGrid$(page, name, newGrid);
      },
      complete: () => {
        // This block can be used for cleanup or final steps if needed
      }
    });
  }

  getDisplayNamesWithOrder$(page: string, type: 'graph' | 'stat'): Observable<{ name: string, order: number }[]> {
    return this._dashboardPageManagerService.getPage$(page).pipe(
      map(pageGrids => Object.entries(pageGrids || {})
        .filter(([name, grid]) => grid.type === type)
        .map(([name, grid]) => ({
          name: name, // Modify as needed
          order: grid.order
        }))
        .sort((a, b) => a.order - b.order)
      ),

      catchError(error => {
        // Handle error scenario, possibly returning an empty array or a default value
        console.log('Error fetching page:', error);
        return of([]);
      })
    );
  }

  removeDisplayable(page: string, name: string, type: string, index: number): void {
    this._dashboardPageManagerService.getGrid$(page, name).subscribe(grid => {
      if (grid && grid.displayables.length > index) {
        grid.displayables.splice(index, 1);
        this._dashboardPageManagerService.updateGrid$(page, name, grid);
      }
    });
  }

  editDisplayable(page: string, name: string, type: string, request: I_DisplayableRequest, index: number): void {
    this._dashboardPageManagerService.getGrid$(page, name).subscribe(grid => {
      if (grid && grid.displayables.length > index) {
        grid.displayables[index] = request;
        this._dashboardPageManagerService.updateGrid$(page, name, grid);
      }
    });
  }


}
