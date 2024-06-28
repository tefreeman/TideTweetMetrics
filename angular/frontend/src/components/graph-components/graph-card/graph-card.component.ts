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
import { I_BaseGraphCard } from '../../../core/interfaces/displayable-data-interface';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { EditModeService } from '../../../core/services/edit-mode.service';
import { GenericGraphComponent } from '../generic-graph/generic-graph.component';
/**
 * Represents the GraphCardComponent which is responsible for displaying a graph card.
 */
@Component({
  standalone: true,
  imports: [MaterialModule, NgIf, AsyncPipe, GenericGraphComponent],
  selector: 'app-graph-card',
  templateUrl: './graph-card.component.html',
  styleUrls: ['./graph-card.component.scss'],
})
export class GraphCardComponent implements OnInit {
  /**
   * The displayable data to be shown in the graph card.
   */
  @Input({ required: true }) displayableData!: I_BaseGraphCard;

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

  constructor() {}

  ngOnInit() {}

  /**
   * Event handler for the delete button click.
   * Emits the deleteEvent.
   */
  onDelete(): void {
    this.deleteEvent.emit();
  }
}
