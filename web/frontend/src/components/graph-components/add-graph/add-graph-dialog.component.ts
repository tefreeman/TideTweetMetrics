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
import { T_DisplayableGraph } from '../../../core/interfaces/displayable-data-interface';
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
import { OwnerSearchGraphComponent } from '../../selectors/owner-search-graph/owner-search-graph.component';
import { CardBarComponent } from '../../stat-components/cardBar/cardBar.component';
import { simpleStatGridComponent } from '../../stat-components/simple-stat-grid/simple-stat-grid.component';
import { GenericGraphComponent } from '../generic-graph/generic-graph.component';
import { ReactiveGenericGraphComponent } from '../reactive-generic-graph/reactive-generic-graph.component';
import { SimpleGraphGridComponent } from '../simple-graph-grid/simple-graph-grid.component';

interface I_DisplayableRequestPlus extends I_DisplayableRequest {
  metric_names?: string[];
}

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
    OwnerSearchGraphComponent,
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
   * Represents the recommended displayables subject.
   */
  private _recommendedDisplayables = new BehaviorSubject<T_DisplayableGraph[]>(
    []
  );

  /**
   * Represents the observable for recommended displayables.
   */
  recommendedDisplayables$: Observable<T_DisplayableGraph[]> =
    this._recommendedDisplayables.asObservable();

  /**
   * Represents the added displayables subject.
   */
  private _addedDisplayables = new BehaviorSubject<T_DisplayableGraph[]>([]);

  /**
   * Represents the observable for added displayables.
   */
  addedDisplayables$: Observable<T_DisplayableGraph[]> =
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
  allDisplayables: T_DisplayableGraph[] = [];

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
  public graphDisplayableReqSubject =
    new BehaviorSubject<I_DisplayableRequestPlus>({
      stat_name: '',
      ownersParams: {
        type: 'specific',
        count: 2,
        owners: ['alabama_cs', 'azengineering'],
      },
      groupId: '',
      type: 'auto',
    });

  //@ts-ignore
  graphDisplayables: Observable<T_DisplayableGraph[]>;

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
    this.graphDisplayables = this.graphDisplayableReqSubject.pipe(
      switchMap(
        (req) =>
          this.displayableProviderService.processRequestsWithLatestMetricContainer(
            this.decomposeRequestPlus(req)
          ) as Observable<T_DisplayableGraph[]>
      )
    );
  }

  /**
   * Method to update graphDisplayableReq with modifications based on the old object.
   * @param modifications Partial<I_DisplayableRequestPlus> object with fields that should be updated.
   */
  updateGraphDisplayableReqWithNestedUpdates(
    modifications: Partial<I_DisplayableRequestPlus>
  ) {
    // Retrieve the current value
    const currentReq = this.graphDisplayableReqSubject.getValue();
    console.log('Current req: ', currentReq, ' MODS: ', modifications);
    // Directly updating the ownersParams within the current request, aiming to trigger a change
    if (modifications.ownersParams?.owners) {
      currentReq.ownersParams = {
        ...currentReq.ownersParams,
        ...modifications.ownersParams,
      };
    }

    // Updating stat_name if it is specified in modifications
    if (modifications.hasOwnProperty('stat_name')) {
      currentReq.stat_name = modifications.stat_name!;
    }

    // Updating metric_names if it is specified in modifications
    if (modifications.metric_names) {
      currentReq.metric_names = modifications.metric_names;
    }

    // Force a new object to ensure changes are detected
    const updatedReq = { ...currentReq };

    // Debugging to see the updated request
    console.log('Updated Request: ', updatedReq);
    this.graphDisplayableReqSubject.next(updatedReq);

    this.cdr.detectChanges(); // Force change detection to run
  }
  /**
   * Filters and limits the displayables.
   * @param allDisplayables - The array of all displayables.
   * @param data - The data for the displayable graph.
   * @param limit - The limit for the displayables.
   * @returns The filtered and limited displayables.
   */
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

  decomposeRequestPlus(
    requestPlus: I_DisplayableRequestPlus
  ): I_DisplayableRequest[] {
    // Check if metric_names is defined and has at least one element
    if (!requestPlus.metric_names || requestPlus.metric_names.length === 0) {
      return [requestPlus];
    } else if (!requestPlus.ownersParams.owners) {
      return [];
    }
    const tempGroupId = 'group' + '-' + Date.now().toString();
    // Transform each metric name into a separate I_DisplayableRequest
    const result = requestPlus.metric_names.map((metricName, index) => ({
      // Use metricName as the stat_name for each new request object
      stat_name: metricName,
      // Copy over the ownersParams from the original I_DisplayableRequestPlus
      ownersParams: requestPlus.ownersParams,
      // Copy over the type from the original I_DisplayableRequestPlus
      type: requestPlus.type,
      // Generate a unique groupId for each new request. Adjust the generation logic as needed for your use case.
      groupId: tempGroupId,
    }));
    console.log('DECOMPOSED REQUEST PLUS: ', result);

    return result;
  }
  /**
   * Handles the search value change event.
   * @param value - The search value.
   */
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

  /**
   * Adds a card to the displayables.
   * @param card - The card to be added.
   */
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

  /**
   * Removes a card from the displayables.
   * @param card - The card to be removed.
   */
  removeCard(card: T_DisplayableGraph): void {
    const updatedCards = this._addedDisplayables
      .getValue()
      .filter((existingCard) => existingCard.metricName !== card.metricName);
    this._addedDisplayables.next(updatedCards);
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
    this.updateGraphDisplayableReqWithNestedUpdates({
      ownersParams,
    });
  }

  onMetricsChanged($event: string[]) {
    console.log('METRIC CHANGED: ', $event);
    if ($event.length == 0) {
      this.updateGraphDisplayableReqWithNestedUpdates({
        stat_name: '',
      });
    }
    if ($event.length == 1) {
      this.updateGraphDisplayableReqWithNestedUpdates({
        stat_name: this.keyTranslatorService.reverseTranslate($event[0]),
      });
    } else {
      this.updateGraphDisplayableReqWithNestedUpdates({
        stat_name: '',
        metric_names: $event.map((metric) =>
          this.keyTranslatorService.reverseTranslate(metric)
        ),
      });
    }
  }
}
