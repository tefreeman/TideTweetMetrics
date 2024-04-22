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

@Component({
  selector: 'app-simple-graph-grid',
  standalone: true,
  imports: [CommonModule, MaterialModule, GraphCardComponent],
  templateUrl: './simple-graph-grid.component.html',
  styleUrl: './simple-graph-grid.component.scss',
})
export class SimpleGraphGridComponent implements OnInit, OnDestroy {
  @Output() cardClicked: EventEmitter<T_DisplayableGraph> = new EventEmitter();
  @Input() maxCardWidth!: string;
  @Input() cardHeight!: string;
  @Input({ required: true }) dataArr: T_DisplayableGraph[] = [];

  constructor() {}

  ngOnInit() {}

  ngOnDestroy(): void {}

  onCardClick(card: T_DisplayableGraph): void {
    this.cardClicked.emit(card);
  }
}
