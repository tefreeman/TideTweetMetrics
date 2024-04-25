import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { I_BaseMetricCardWithRequest } from '../../../core/interfaces/displayable-data-interface';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { StatCardComponent } from '../stat-card/stat-card.component';

/**
 * Represents the Simple Stat Grid component.
 */
@Component({
  standalone: true,
  imports: [StatCardComponent, MaterialModule, CommonModule],
  selector: 'app-simple-stat-grid',
  templateUrl: './simple-stat-grid.component.html',
  styleUrls: ['./simple-stat-grid.component.scss'],
  // Since it's a simplified version, we're not using standalone:true and imports here
})
export class simpleStatGridComponent implements OnInit, OnDestroy {
  /**
   * Event emitter for when a card is clicked.
   */
  @Output() cardClicked: EventEmitter<I_BaseMetricCardWithRequest> =
    new EventEmitter();

  /**
   * The maximum width of the card.
   */
  @Input() maxCardWidth!: string;

  /**
   * The height of the card.
   */
  @Input() cardHeight!: string;

  /**
   * The array of displayable statistics.
   */
  @Input({ required: true }) dataArr: I_BaseMetricCardWithRequest[] = [];

  constructor() {}

  /**
   * Lifecycle hook that is called after data-bound properties of a directive are initialized.
   */
  ngOnInit() {}

  /**
   * Lifecycle hook that is called when a directive, pipe, or service is destroyed.
   */
  ngOnDestroy(): void {}

  /**
   * Handles the click event on a card.
   * @param card - The clicked card.
   */
  onCardClick(card: I_BaseMetricCardWithRequest): void {
    this.cardClicked.emit(card);
  }
}
