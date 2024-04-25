import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Service for managing the edit mode state.
 */
@Injectable({
  providedIn: 'root',
})
export class EditModeService {
  /**
   * Flag indicating whether the edit mode is enabled or disabled.
   */
  editMode = false;

  /**
   * Observable for the edit mode state.
   */
  private editMode$ = new BehaviorSubject<boolean>(this.editMode);

  constructor() { }

  /**
   * Get the edit mode state as an observable.
   * @returns An observable that emits the current edit mode state.
   */
  getEditMode() {
    return this.editMode$.asObservable();
  }

  /**
   * Set the edit mode state.
   * @param editMode - The new edit mode state.
   */
  setEditMode(editMode: boolean) {
    this.editMode = editMode;
    this.editMode$.next(this.editMode);
  }

  /**
   * Toggle the edit mode state.
   */
  toggleEditMode() {
    this.editMode = !this.editMode;
    this.editMode$.next(this.editMode);
  }
}
