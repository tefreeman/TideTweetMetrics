import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GridEditModeService {
  editMode = false;

  private editMode$ = new BehaviorSubject<boolean>(this.editMode);

  constructor() {}

  getEditMode() {
    return this.editMode$.asObservable();
  }

  setEditMode(editMode: boolean) {
    this.editMode = editMode;
    this.editMode$.next(this.editMode);
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    this.editMode$.next(this.editMode);
  }
}
