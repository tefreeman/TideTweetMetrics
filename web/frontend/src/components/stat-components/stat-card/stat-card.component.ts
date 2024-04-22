import { CdkDrag } from '@angular/cdk/drag-drop';
import { AsyncPipe, NgClass, NgIf, NgSwitch } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { Observable } from 'rxjs';
import {
  I_StatCompData,
  I_StatTrendData,
  I_StatValueData,
  T_DisplayableDataType,
} from '../../../core/interfaces/displayable-data-interface';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { EditModeService } from '../../../core/services/edit-mode.service';
import { StatCompComponent } from '../stat-comp/stat-comp.component';
import { StatTrendComponent } from '../stat-trend/stat-trend.component';
import { StatValueComponent } from '../stat-value/stat-value.component';

/**
 * Represents the StatCardComponent class.
 * This component is responsible for displaying a stat card with various types of data.
 */
@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [
    StatValueComponent,
    NgIf,
    StatTrendComponent,
    MaterialModule,
    StatCompComponent,
    NgSwitch,
    CdkDrag,
    NgClass,
    AsyncPipe,
  ],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
})
export class StatCardComponent implements OnInit {
  /**
   * Represents the EditModeService instance used for managing the edit mode state.
   */
  editModeService: EditModeService = inject(EditModeService);

  /**
   * Represents the displayable data to be shown in the stat card.
   */
  @Input({ required: true }) displayableData!: T_DisplayableDataType;

  /**
   * Represents the hook for enabling or disabling the edit mode.
   */
  @Input({ required: true }) editModeHook!: boolean;

  /**
   * Represents the event emitted when the delete button is clicked.
   */
  @Output() deleteEvent = new EventEmitter<void>();

  /**
   * Represents the state of the hover effect on the stat card.
   */
  hoverState: boolean = false;

  /**
   * Represents the observable for the edit mode state.
   */
  editMode: Observable<boolean> = this.editModeService.getEditMode();

  /**
   * Represents the flag to apply a CSS class to the stat card.
   */
  applyClass = true;

  constructor() { }

  /**
   * Initializes the component.
   */
  ngOnInit(): void { }

  /**
   * Checks if the given data is of type I_StatValueData.
   * @param data - The data to be checked.
   * @returns True if the data is of type I_StatValueData, false otherwise.
   */
  isStatValue(data: T_DisplayableDataType): data is I_StatValueData {
    return data.type === 'stat-value';
  }

  /**
   * Checks if the given data is of type I_StatTrendData.
   * @param data - The data to be checked.
   * @returns True if the data is of type I_StatTrendData, false otherwise.
   */
  isStatTrend(data: T_DisplayableDataType): data is I_StatTrendData {
    return data.type === 'stat-trend';
  }

  /**
   * Checks if the given data is of type I_StatCompData.
   * @param data - The data to be checked.
   * @returns True if the data is of type I_StatCompData, false otherwise.
   */
  isStatComp(data: T_DisplayableDataType): data is I_StatCompData {
    return data.type === 'stat-comp';
  }

  /**
   * Handles the mouse down event.
   * Sets the applyClass flag to false.
   */
  onMouseDown(): void {
    this.applyClass = false;
  }

  /**
   * Handles the mouse up event.
   * Sets the applyClass flag to true.
   */
  onMouseUp(): void {
    this.applyClass = true;
  }

  /**
   * Handles the delete button click event.
   * Emits the deleteEvent.
   */
  onDelete(): void {
    this.deleteEvent.emit();
  }

  /**
   * Toggles the hover state of the stat card.
   * @param state - The new hover state.
   */
  toggleHover(state: boolean): void {
    this.hoverState = state;
  }
}
