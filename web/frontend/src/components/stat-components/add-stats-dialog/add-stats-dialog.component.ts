// Import necessary Angular and RxJS elements
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, Observable, map, switchMap } from 'rxjs';

import { CommonModule, NgFor } from '@angular/common';
import { T_DisplayableStat } from '../../../core/interfaces/displayable-data-interface';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { RecommendedDisplayableService } from '../../../core/services/displayables/recommended-displayable.service';
import { KeyTranslatorService } from '../../../core/services/key-translator.service';
import { MetricSearchComponent } from '../../selectors/metric-search/metric-search.component';
import { MetricSelectListComponent } from '../../selectors/metric-select-list/metric-select-list.component';
import { OwnerSearchComponent } from '../../selectors/owner-search/owner-search.component';
import { CardBarComponent } from '../cardBar/cardBar.component';
import { simpleStatGridComponent } from '../simple-stat-grid/simple-stat-grid.component';

/**
 * Represents the Add Stats Dialog component.
 */
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
  ],
})
export class addStatsDialogComponent implements OnInit {
  /**
   * Represents the recommended displayables subject.
   */
  private _recommendedDisplayables = new BehaviorSubject<T_DisplayableStat[]>(
    []
  );

  /**
   * Represents the observable for recommended displayables.
   */
  recommendedDisplayables$: Observable<T_DisplayableStat[]> =
    this._recommendedDisplayables.asObservable();

  /**
   * Represents the added displayables subject.
   */
  private _addedDisplayables = new BehaviorSubject<T_DisplayableStat[]>([]);

  /**
   * Represents the observable for added displayables.
   */
  addedDisplayables$: Observable<T_DisplayableStat[]> =
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
  allDisplayables: T_DisplayableStat[] = [];

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
    @Inject(MAT_DIALOG_DATA) public data: T_DisplayableStat[],
    private cdr: ChangeDetectorRef,
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
          this.recommendedDisplayableService.getRecommendedDisplayablesData(
            owners
          )
        )
      )
      .subscribe((displayables) => {
        this.allDisplayables = displayables as T_DisplayableStat[];

        if (this.data) {
          this._recommendedDisplayables.next(
            this.filterAndLimitDisplayables(this.allDisplayables, this.data, 30)
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
    allDisplayables: T_DisplayableStat[],
    data: T_DisplayableStat[],
    limit: number
  ): T_DisplayableStat[] {
    const filteredDisplayables = allDisplayables.filter((displayable) =>
      data.every((d) => d.metricName !== displayable.metricName)
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
        this.allDisplayables.filter((item) =>
          this.keyTranslatorService
            .keyToFullString(item.metricName)
            .toLowerCase()
            .includes(value.toLowerCase())
        )
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
  addCard(card: T_DisplayableStat): void {
    const currentCards = this._addedDisplayables.getValue();
    if (
      !currentCards.some(
        (existingCard) =>
          existingCard.metricName === card.metricName &&
          existingCard.ownersParams.owners === card.ownersParams.owners
      )
    ) {
      this._addedDisplayables.next([...currentCards, card]);
    }
  }

  /**
   * Removes a card from the displayables.
   * @param card - The displayable stat card.
   */
  removeCard(card: T_DisplayableStat): void {
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
    console.log('EVENT: ', $event);
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
