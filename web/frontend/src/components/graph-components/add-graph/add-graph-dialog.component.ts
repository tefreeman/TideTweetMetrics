import { AsyncPipe, CommonModule, NgFor } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, Observable, map, switchMap } from 'rxjs';
import { I_BaseGraphCard } from '../../../core/interfaces/displayable-data-interface';
import {
  I_DisplayableRequest,
  I_OwnersParams,
} from '../../../core/interfaces/displayable-interface';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { DisplayableProviderService } from '../../../core/services/displayables/displayable-provider.service';
import { RecommendedDisplayableService } from '../../../core/services/displayables/recommended-displayable.service';
import { KeyTranslatorService } from '../../../core/services/key-translator.service';
import { MetricSearchComponent } from '../../selectors/metric-search/metric-search.component';
import { MetricSelectListComponent } from '../../selectors/metric-select-list/metric-select-list.component';
import { OwnerSearchComponent } from '../../selectors/owner-search/owner-search.component';
import { CardBarComponent } from '../../stat-components/cardBar/cardBar.component';
import { simpleStatGridComponent } from '../../stat-components/simple-stat-grid/simple-stat-grid.component';
import { GenericGraphComponent } from '../generic-graph/generic-graph.component';
import { ReactiveGenericGraphComponent } from '../reactive-generic-graph/reactive-generic-graph.component';
import { SimpleGraphGridComponent } from '../simple-graph-grid/simple-graph-grid.component';

type ParseResult = {
  position: 'top' | 'bottom';
  number: number;
} | null;
/**
 * Represents the AddGraphDialogComponent class.
 * This component is responsible for displaying a dialog for adding graphs.
 */
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
    FormsModule,
    MatButtonToggleModule,
    GenericGraphComponent,
    AsyncPipe,
    ReactiveGenericGraphComponent,
  ],
  templateUrl: './add-graph-dialog.component.html',
  styleUrl: './add-graph-dialog.component.scss',
})
export class AddGraphDialogComponent implements OnInit {
  /**
   * Represents the added displayables subject.
   */
  private _addedDisplayables = new BehaviorSubject<I_BaseGraphCard[]>([]);

  /**
   * Represents the observable for added displayables.
   */
  addedDisplayables$: Observable<I_BaseGraphCard[]> =
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
   * Represents the array of all displayables.
   */
  allDisplayables: I_BaseGraphCard[] = [];

  /**
   * Represents the current owners subject.
   */
  currentOwners: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  /**
   * Represents the current metrics subject.
   */
  currentMetrics: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  /**
   * Represents the isEnabled observable.
   */
  isEnabled: Observable<boolean>;

  /**
   * Represents the displayed data.
   */
  public graphDisplayableReqSubject = new BehaviorSubject<I_DisplayableRequest>(
    {
      metricNames: [],
      ownersParams: {
        type: 'specific',
        count: 2,
        owners: ['alabama_cs', 'azengineering'],
      },
      type: 'auto-graph',
    }
  );

  graphDisplayables: Observable<I_BaseGraphCard[]>;

  displayableProviderService: DisplayableProviderService = inject(
    DisplayableProviderService
  );
  /**
   * Initializes a new instance of the AddGraphDialogComponent class.
   * @param data - The data for the displayable graph.
   * @param cdr - The change detector reference.
   * @param keyTranslatorService - The key translator service.
   * @param recommendedDisplayableService - The recommended displayable service.
   */
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: I_DisplayableRequest,
    private cdr: ChangeDetectorRef,
    keyTranslatorService: KeyTranslatorService,
    recommendedDisplayableService: RecommendedDisplayableService
  ) {
    this.keyTranslatorService = keyTranslatorService;
    this.recommendedDisplayableService = recommendedDisplayableService;

    this.isEnabled = this.currentMetrics.pipe(
      map((metrics) => metrics.length === 0)
    );

    this.graphDisplayables = this.graphDisplayableReqSubject.pipe(
      switchMap((req) => {
        return this.displayableProviderService.processRequestsWithMetrics(
          [req],
          'graph'
        );
      })
    ) as Observable<I_BaseGraphCard[]>;
  }

  ngOnInit(): void {}

  /**
   * Method to update graphDisplayableReq with modifications based on the old object.
   * @param modifications Partial<I_DisplayableRequestPlus> object with fields that should be updated.
   */
  updateGraphDisplayableReq(modifications: Partial<I_DisplayableRequest>) {
    // Retrieve the current value
    const currentReq = this.graphDisplayableReqSubject.getValue();

    // Create a new object for ownersParams
    let updatedOwnersParams: I_OwnersParams | undefined;

    if (modifications.ownersParams) {
      updatedOwnersParams = {
        ...currentReq.ownersParams,
        ...modifications.ownersParams,
      };
    }

    // Updating stat_name if it is specified in modifications
    const updatedMetricNames =
      modifications.metricNames ?? currentReq.metricNames;

    const updatedReq: I_DisplayableRequest = {
      ...currentReq,
      ownersParams: updatedOwnersParams ?? currentReq.ownersParams,
      metricNames: updatedMetricNames,
    };

    this.graphDisplayableReqSubject.next(updatedReq);
    this.cdr.detectChanges(); // Force change detection to run
  }
  /**
   * Handles the search value change event.
   * @param value - The search value.
   */
  onSearchValueChange(value: string) {
    // if (value) {
    //   this._recommendedDisplayables.next(
    //     this.allDisplayables.filter((item) =>
    //       this.keyTranslatorService
    //         .keyToFullString(item.metricNames[0])
    //         .toLowerCase()
    //         .includes(value.toLowerCase())
    //     )
    //   );
    // } else {
    //   this._recommendedDisplayables.next(
    //     this.filterAndLimitDisplayables(
    //       this.allDisplayables,
    //       this._addedDisplayables.getValue(),
    //       30
    //     )
    //   );
    // }
  }

  parseInput(input: string): ParseResult {
    // Normalize case
    const lowerCaseInput = input.toLowerCase();

    // Define regex patterns for 'top' and 'bottom'
    const topPattern = /^top:\s*(\d+)$/;
    const bottomPattern = /^bottom:\s*(\d+)$/;

    // Try matching 'top'
    const topMatch = lowerCaseInput.match(topPattern);
    if (topMatch) {
      return {
        position: 'top',
        number: parseInt(topMatch[1], 10),
      };
    }

    // Try matching 'bottom'
    const bottomMatch = lowerCaseInput.match(bottomPattern);
    if (bottomMatch) {
      return {
        position: 'bottom',
        number: parseInt(bottomMatch[1], 10),
      };
    }

    // Return null if no valid pattern is matched
    return null;
  }

  /**
   * Handles the owners changed event.
   * @param $event - The owners array.
   */
  onOwnersChanged($event: string[]): void {
    // Extract top or bottom information if present.
    let parsedResult = null;
    for (const stringElement of $event) {
      const result = this.parseInput(stringElement);
      if (result) {
        parsedResult = result;
        break; // Assuming only one 'top:/bottom:' entry per array.
      }
    }

    // Define your default ownersParams object assuming the type is 'specific'.
    let ownersParams: I_OwnersParams = { owners: $event, type: 'specific' };

    // Check if a parsed result exists and adjust the ownersParams accordingly.
    if (parsedResult) {
      ownersParams = {
        ...ownersParams,
        type: parsedResult.position,
        count: parsedResult.number,
        // Assuming owners should be filtered out 'top:/bottom:' entry.
        owners: $event.filter(
          (e) =>
            e.toLowerCase() !==
            `${parsedResult.position}: ${parsedResult.number}`
        ),
      };
    }

    // Update your graph display or other dependent functionality.
    this.updateGraphDisplayableReq({
      ownersParams,
    });
  }

  onMetricsChanged($event: string[]) {
    this.updateGraphDisplayableReq({
      metricNames: $event,
    });
  }
}
