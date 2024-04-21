import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { T_DisplayableStat } from '../../core/interfaces/displayable-data-interface';
import { MaterialModule } from '../../core/modules/material/material.module';
import { StatCardComponent } from '../stat-card/stat-card.component';

@Component({
  standalone: true,
  imports: [StatCardComponent, MaterialModule, CommonModule],
  selector: 'app-simple-card-grid',
  templateUrl: './simple-card-grid.component.html',
  styleUrls: ['./simple-card-grid.component.scss'],
  // Since it's a simplified version, we're not using standalone:true and imports here
})
export class SimpleCardGridComponent implements OnInit, OnDestroy {
  @Output() cardClicked: EventEmitter<T_DisplayableStat> = new EventEmitter();
  @Input() maxCardWidth!: string;
  @Input() cardHeight!: string;
  @Input({ required: true }) dataArr: T_DisplayableStat[] = [];

  constructor() {}

  ngOnInit() {}

  ngOnDestroy(): void {}

  onCardClick(card: T_DisplayableStat): void {
    this.cardClicked.emit(card);
  }
}
