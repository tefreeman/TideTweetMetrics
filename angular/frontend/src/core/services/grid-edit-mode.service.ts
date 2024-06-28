import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Service for managing the grid edit mode.
 */
@Injectable({
  providedIn: 'root',
})
export class GridEditModeService {
  /**
   * Flag indicating whether the grid is in edit mode.
   */
  editMode = false;

  /**
   * Observable for the edit mode state.
   */
  private editMode$ = new BehaviorSubject<boolean>(this.editMode);

  constructor() { }

  /**
   * Returns an observable that emits the current edit mode state.
   * @returns An observable of the edit mode state.
   */
  getEditMode() {
    return this.editMode$.asObservable();
  }

  /**
   * Sets the edit mode state.
   * @param editMode - The new edit mode state.
   */
  setEditMode(editMode: boolean) {
    this.editMode = editMode;
    this.editMode$.next(this.editMode);
  }

  /**
   * Toggles the edit mode state.
   */
  toggleEditMode() {
    this.editMode = !this.editMode;
    this.editMode$.next(this.editMode);
  }
}
