import { CommonModule, NgFor } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, Observable, map, switchMap } from 'rxjs';
import { T_DisplayableGraph } from '../../../core/interfaces/displayable-data-interface';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { RecommendedDisplayableService } from '../../../core/services/displayables/recommended-displayable.service';
import { KeyTranslatorService } from '../../../core/services/key-translator.service';
import { MetricSearchComponent } from '../../selectors/metric-search/metric-search.component';
import { MetricSelectListComponent } from '../../selectors/metric-select-list/metric-select-list.component';
import { OwnerSearchComponent } from '../../selectors/owner-search/owner-search.component';
import { CardBarComponent } from '../../stat-components/cardBar/cardBar.component';
import { simpleStatGridComponent } from '../../stat-components/simple-stat-grid/simple-stat-grid.component';
import { SimpleGraphGridComponent } from '../simple-graph-grid/simple-graph-grid.component';

@Component({
  selector: 'app-add-graph',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    CardBarComponent,
    NgFor,
    MetricSelectListComponent,
    MetricSearchComponent,
    simpleStatGridComponent,
    OwnerSearchComponent,
    SimpleGraphGridComponent,
  ],
  templateUrl: './add-graph-dialog.component.html',
  styleUrl: './add-graph-dialog.component.scss',
})
export class AddGraphDialogComponent implements OnInit {
  private _recommendedDisplayables = new BehaviorSubject<T_DisplayableGraph[]>(
    []
  );
  recommendedDisplayables$: Observable<T_DisplayableGraph[]> =
    this._recommendedDisplayables.asObservable();

  private _addedDisplayables = new BehaviorSubject<T_DisplayableGraph[]>([]);
  addedDisplayables$: Observable<T_DisplayableGraph[]> =
    this._addedDisplayables.asObservable();

  keyTranslatorService: KeyTranslatorService;
  recommendedDisplayableService: RecommendedDisplayableService;
  allDisplayables: T_DisplayableGraph[] = [];
  currentOwners: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  currentMetrics: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  isEnabled: Observable<boolean>;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: T_DisplayableGraph[],
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
        this.allDisplayables = displayables as T_DisplayableGraph[];

        if (this.data) {
          this._recommendedDisplayables.next(
            this.filterAndLimitDisplayables(this.allDisplayables, this.data, 30)
          );
        } else {
          this._recommendedDisplayables.next([]);
        }
      });
  }

  private filterAndLimitDisplayables(
    allDisplayables: T_DisplayableGraph[],
    data: T_DisplayableGraph[],
    limit: number
  ): T_DisplayableGraph[] {
    const filteredDisplayables = allDisplayables.filter((displayable) =>
      data.every((d) => d.metricName !== displayable.metricName)
    );
    return filteredDisplayables.slice(0, limit);
  }

  onSearchValueChange(value: string) {
    if (value) {
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

  addCard(card: T_DisplayableGraph): void {
    const currentCards = this._addedDisplayables.getValue();
    if (
      !currentCards.some(
        (existingCard) => existingCard.metricName === card.metricName
      )
    ) {
      this._addedDisplayables.next([...currentCards, card]);
    }
  }

  removeCard(card: T_DisplayableGraph): void {
    const updatedCards = this._addedDisplayables
      .getValue()
      .filter((existingCard) => existingCard.metricName !== card.metricName);
    this._addedDisplayables.next(updatedCards);
  }

  onOwnersChanged($event: string[]) {
    this.currentOwners.next($event);
  }
}
