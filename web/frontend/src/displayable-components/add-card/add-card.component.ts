import { CommonModule, NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';
import { T_DisplayableStat } from '../../core/interfaces/displayable-data-interface';
import { MaterialModule } from '../../core/modules/material/material.module';
import { KeyTranslatorService } from '../../core/services/key-translator.service';
import { RecommendedDisplayableService } from '../../core/services/recommended-displayable.service';
import { CardBarComponent } from '../cardBar/cardBar.component';
import { MetricSearchComponent } from '../metric-search/metric-search.component';
import { MetricSelectListComponent } from '../metric-select-list/metric-select-list.component';
import { SimpleCardGridComponent } from '../simple-card-grid/simple-card-grid.component';

@Component({
  selector: 'app-add-card',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    CardBarComponent,
    NgFor,
    MetricSelectListComponent,
    MetricSearchComponent,
    SimpleCardGridComponent,
  ],
  templateUrl: './add-card.component.html',
  styleUrl: './add-card.component.scss',
})
export class AddCardComponent {
  keyTranslatorService: KeyTranslatorService = inject(KeyTranslatorService);
  recommendedDisplayableService: RecommendedDisplayableService = inject(
    RecommendedDisplayableService
  );
  allDisplayables: T_DisplayableStat[] = []; // Array to hold all displayables
  reccommendedDisplayables: T_DisplayableStat[] = [];

  addedDisplayables: T_DisplayableStat[] = [];

  constructor() {}

  ngOnInit(): void {
    this.recommendedDisplayableService
      .getRecommendedDisplayablesData()
      .subscribe((displayables) => {
        this.allDisplayables = displayables as T_DisplayableStat[];
        this.reccommendedDisplayables = this.allDisplayables.slice(0, 30); // Initially displaying up to 30 items
      });
  }

  handleLeafNodeClicked(node: any): void {
    console.log('Leaf node clicked:', node);
  }

  onSearchValueChange(value: string) {
    console.log(value);
    if (value) {
      // Filter allDisplayables by checking if the 'title' or another relevant property includes the search string
      // Adjust the property you filter by according to the structure of T_DisplayableStat
      this.reccommendedDisplayables = this.allDisplayables.filter((item) => {
        const metricString = this.keyTranslatorService.keyToFullString(
          item.metricName
        );
        return metricString.toLowerCase().includes(value.toLowerCase());
      });

      console.log('SETTING');
    } else {
      // If search box is empty, reset to show up to 30 items
      this.reccommendedDisplayables = this.allDisplayables.slice(0, 30);
    }
  }

  addCard(card: T_DisplayableStat): void {
    console.log('Adding card:', card);
    // Check if the card already exists in the array.
    const exists = this.addedDisplayables.some(
      (existingCard) => existingCard.metricName === card.metricName
    );
    if (!exists) {
      this.addedDisplayables.push(card);
    } else {
      console.log('Card is already added:', card);
    }
  }
}
