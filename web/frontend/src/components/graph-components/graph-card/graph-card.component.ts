import { AsyncPipe, NgIf } from '@angular/common';
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
  I_GraphBarData,
  I_GraphLineData,
  T_DisplayableDataType,
} from '../../../core/interfaces/displayable-data-interface';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { EditModeService } from '../../../core/services/edit-mode.service';
import { BarChartComponent } from '../bar-chart/bar-chart.component';
import { LineChartComponent } from '../line-chart/line-chart.component';
/**
 * Represents the GraphCardComponent which is responsible for displaying a graph card.
 */
@Component({
  standalone: true,
  imports: [
    MaterialModule,
    NgIf,
    BarChartComponent,
    LineChartComponent,
    AsyncPipe,
  ],
  selector: 'app-graph-card',
  templateUrl: './graph-card.component.html',
  styleUrls: ['./graph-card.component.scss'],
})
export class GraphCardComponent implements OnInit {
  /**
   * The displayable data to be shown in the graph card.
   */
  @Input({ required: true }) displayableData!: T_DisplayableDataType;

  /**
   * Event emitted when the delete button is clicked.
   */
  @Output() deleteEvent = new EventEmitter<void>();

  /**
   * The edit mode service used to determine if the graph card is in edit mode.
   */
  editModeService: EditModeService = inject(EditModeService);

  /**
   * Observable that indicates whether the graph card is in edit mode or not.
   */
  editMode: Observable<boolean> = this.editModeService.getEditMode();

  constructor() { }

  ngOnInit() { }

  /**
   * Checks if the displayable data is of type I_GraphLineData.
   * @param data - The displayable data to be checked.
   * @returns True if the data is of type I_GraphLineData, false otherwise.
   */
  isLineGraph(data: T_DisplayableDataType): data is I_GraphLineData {
    return data.type === 'graph-line';
  }

  /**
   * Checks if the displayable data is of type I_GraphBarData.
   * @param data - The displayable data to be checked.
   * @returns True if the data is of type I_GraphBarData, false otherwise.
   */
  isBarGraph(data: T_DisplayableDataType): data is I_GraphBarData {
    return data.type === 'graph-bar';
  }

  /**
   * Checks if the displayable data is of type I_GraphPieData.
   * @param data - The displayable data to be checked.
   * @returns True if the data is of type I_GraphPieData, false otherwise.
   */
  isPieGraph(data: T_DisplayableDataType) { }

  /**
   * Event handler for the delete button click.
   * Emits the deleteEvent.
   */
  onDelete(): void {
    this.deleteEvent.emit();
  }
}
