import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { MaterialModule } from '../../core/modules/material/material.module';
import { CardBarComponent } from '../cardBar/cardBar.component';
import { MetricSelectListComponent } from '../metric-select-list/metric-select-list.component';

@Component({
  selector: 'app-add-card',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    CardBarComponent,
    NgFor,
    MetricSelectListComponent,
  ],
  templateUrl: './add-card.component.html',
  styleUrl: './add-card.component.scss',
})
export class AddCardComponent {
  handleLeafNodeClicked(node: any): void {
    console.log('Leaf node clicked:', node);
  }
}
