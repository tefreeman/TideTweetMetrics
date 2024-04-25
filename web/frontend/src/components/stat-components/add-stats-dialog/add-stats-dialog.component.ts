// Import necessary Angular and RxJS elements
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, Observable, map, switchMap } from 'rxjs';

import { CommonModule, NgFor } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { I_BaseMetricCardWithRequest } from '../../../core/interfaces/displayable-data-interface';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { RecommendedDisplayableService } from '../../../core/services/displayables/recommended-displayable.service';
import { KeyTranslatorService } from '../../../core/services/key-translator.service';
import { MetricSearchComponent } from '../../selectors/metric-search/metric-search.component';
import { MetricSelectListComponent } from '../../selectors/metric-select-list/metric-select-list.component';
import { OwnerSearchComponent } from '../../selectors/owner-search/owner-search.component';
import { CardBarComponent } from '../cardBar/cardBar.component';
import { simpleStatGridComponent } from '../simple-stat-grid/simple-stat-grid.component';

@Component({
  selector: 'app-add-card',
  standalone: true,
  templateUrl: './add-stats-dialog.component.html',
  styleUrls: ['./add-stats-dialog.component.scss'],
  imports: [
    CommonModule,
    MaterialModule,
    CardBarComponent,
    NgFor,
    MetricSelectListComponent,
    MetricSearchComponent,
    simpleStatGridComponent,
    OwnerSearchComponent,
    MatButtonToggleModule,
  ],
})
export class addStatsDialogComponent implements OnInit {
  /**
   * Represents the recommended displayables subject.
   */
  private _recommendedDisplayables = new BehaviorSubject<
    I_BaseMetricCardWithRequest[]
  >([]);

  /**
   * Represents the observable for recommended displayables.
   */
  recommendedDisplayables$: Observable<I_BaseMetricCardWithRequest[]> =
    this._recommendedDisplayables.asObservable();

  /**
   * Represents the added displayables subject.
   */
  private _addedDisplayables = new BehaviorSubject<
    I_BaseMetricCardWithRequest[]
  >([]);

  /**
   * Represents the observable for added displayables.
   */
  addedDisplayables$: Observable<I_BaseMetricCardWithRequest[]> =
    this._addedDisplayables.asObservable();

  /**
   * Represents the key translator service.
   */
  keyTranslatorService: KeyTranslatorService;

  /**
   * Represents the recommended displayable service.
   */
  recommendedDisplayableService: RecommendedDisplayableService;

  /**
   * Represents all displayables.
   */
  allDisplayables: I_BaseMetricCardWithRequest[] = [];

  /**
   * Represents the current owners subject.
   */
  currentOwners: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  /**
   * Represents the current metrics subject.
   */
  currentMetrics: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  /**
   * Represents the last metric search value.
   */
  lastMetricSearchValue: string = '';

  /**
   * Represents the isEnabled observable.
   */
  isEnabled: Observable<boolean>;

  /**
   * Constructs a new instance of the Add Stats Dialog component.
   * @param data - The data for the displayable stats.
   * @param cdr - The change detector reference.
   * @param keyTranslatorService - The key translator service.
   * @param recommendedDisplayableService - The recommended displayable service.
   */
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: I_BaseMetricCardWithRequest[],
    keyTranslatorService: KeyTranslatorService,
    recommendedDisplayableService: RecommendedDisplayableService
  ) {
    this.keyTranslatorService = keyTranslatorService;
    this.recommendedDisplayableService = recommendedDisplayableService;

    this.isEnabled = this.currentMetrics.pipe(
      map((metrics) => metrics.length === 0)
    );
  }

  /**
   * Initializes the component.
   */
  ngOnInit(): void {
    this.currentOwners
      .pipe(
        switchMap((owners) =>
          this.recommendedDisplayableService.getRecommendedMetricCards(owners)
        )
      )
      .subscribe((displayables) => {
        this.allDisplayables = displayables;

        if (this.data) {
          this._recommendedDisplayables.next(
            this.filterAndLimitDisplayables(
              this.allDisplayables,
              this.data,
              300
            )
          );
        } else {
          this._recommendedDisplayables.next([]);
        }
      });
  }

  /**
   * Filters and limits the displayables.
   * @param allDisplayables - The array of all displayables.
   * @param data - The array of displayable stats.
   * @param limit - The limit of displayables.
   * @returns The filtered and limited displayables.
   */
  private filterAndLimitDisplayables(
    allDisplayables: I_BaseMetricCardWithRequest[],
    data: I_BaseMetricCardWithRequest[],
    limit: number
  ): I_BaseMetricCardWithRequest[] {
    const filteredDisplayables = allDisplayables.filter((displayable) =>
      data.every(
        (d) =>
          d.metricName.toLowerCase() !== displayable.metricName.toLowerCase()
      )
    );
    return filteredDisplayables.slice(0, limit);
  }

  /**
   * Handles the search value change event.
   * @param value - The search value.
   * @param notMetricHook - Indicates if it is not a metric hook.
   */
  onSearchValueChange(value: string, notMetricHook = true) {
    if (value) {
      if (notMetricHook) this.lastMetricSearchValue = value;
      this._recommendedDisplayables.next(
        this.allDisplayables.filter((item) => {
          // Split the search value into words, considering spaces and common punctuations
          const searchWords = value.toLowerCase().split(/\s+|,|\.|;/);
          // Split the item's metric name into words, considering spaces and common punctuations
          let itemWords = this.keyTranslatorService
            .keyToFullString(item.metricName.toLowerCase())
            .split(/\s+|,|\.|;/);
          
            itemWords = itemWords.map((word) => word.toLowerCase());
          console.log("Item Metric Words:", itemWords);
  
          // Check if any of the search words starts with the item words
          return searchWords.some((searchWord) =>
            itemWords.some((itemWord) => itemWord.startsWith(searchWord))
          );
        })
      );
    } else {
      this._recommendedDisplayables.next(
        this.filterAndLimitDisplayables(
          this.allDisplayables,
          this._addedDisplayables.getValue().concat(this.data),
          30
        )
      );
    }
  }

  /**
   * Adds a card to the displayables.
   * @param card - The displayable stat card.
   */
  addCard(card: I_BaseMetricCardWithRequest): void {
    const currentCards = this._addedDisplayables.getValue();
    if (
      !currentCards.some(
        (existingCard) =>
          existingCard.metricName === card.metricName &&
          existingCard.request.ownersParams.owners ===
            card.request.ownersParams.owners
      )
    ) {
      this._addedDisplayables.next([...currentCards, card]);
    }
  }

  /**
   * Removes a card from the displayables.
   * @param card - The displayable stat card.
   */
  removeCard(card: I_BaseMetricCardWithRequest): void {
    const updatedCards = this._addedDisplayables
      .getValue()
      .filter((existingCard) => existingCard.metricName !== card.metricName);
    this._addedDisplayables.next(updatedCards);
  }

  /**
   * Handles the owners changed event.
   * @param $event - The owners array.
   */
  onOwnersChanged($event: string[]) {
    this.currentOwners.next($event);
  }

  /**
   * Handles the metrics changed event.
   * @param $event - The metrics array.
   */
  onMetricsChanged($event: string[]) {
    if ($event.length == 0)
      this.onSearchValueChange(this.lastMetricSearchValue);
    if ($event.length == 1) this.onSearchValueChange($event[0], false);

    this.currentMetrics.next($event);
  }
}
