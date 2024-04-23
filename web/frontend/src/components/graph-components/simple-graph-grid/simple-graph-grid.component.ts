import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { T_DisplayableGraph } from '../../../core/interfaces/displayable-data-interface';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { GraphCardComponent } from '../graph-card/graph-card.component';

/**
 * Represents the SimpleGraphGridComponent class.
 * This component is responsible for displaying a grid of simple graphs.
 */
@Component({
  selector: 'app-simple-graph-grid',
  standalone: true,
  imports: [CommonModule, MaterialModule, GraphCardComponent],
  templateUrl: './simple-graph-grid.component.html',
  styleUrl: './simple-graph-grid.component.scss',
})
export class SimpleGraphGridComponent implements OnInit, OnDestroy {
  /**
   * Event emitter for when a graph card is clicked.
   */
  @Output() cardClicked: EventEmitter<T_DisplayableGraph> = new EventEmitter();

  /**
   * The maximum width of the graph card.
   */
  @Input() maxCardWidth!: string;

  /**
   * The height of the graph card.
   */
  @Input() cardHeight!: string;

  /**
   * The array of displayable graphs.
   */
  @Input({ required: true }) dataArr: T_DisplayableGraph[] = [];

  constructor() { }

  /**
   * Lifecycle hook that is called after data-bound properties of a directive are initialized.
   */
  ngOnInit() { }

  /**
   * Lifecycle hook that is called when a directive, pipe, or service is destroyed.
   */
  ngOnDestroy(): void { }

  /**
   * Event handler for when a graph card is clicked.
   * @param card - The clicked graph card.
   */
  onCardClick(card: T_DisplayableGraph): void {
    this.cardClicked.emit(card);
  }
}
