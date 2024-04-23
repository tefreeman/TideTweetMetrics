import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { AsyncPipe, CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, map, startWith } from 'rxjs';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { KeyTranslatorService } from '../../../core/services/key-translator.service';
import { MetricService } from '../../../core/services/metrics/metric.service';

export interface MetricGroup {
  first: string;
  names: string[];
}

/**
 * Component for searching and selecting metrics.
 */
@Component({
  selector: 'app-metric-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    AsyncPipe,
  ],
  templateUrl: './metric-search.component.html',
  styleUrls: ['./metric-search.component.scss'],
})
export class MetricSearchComponent implements OnInit {
  /**
   * Observable indicating whether the component is enabled or not.
   */
  @Input({ required: true }) isEnabled!: Observable<boolean>;

  /**
   * Event emitted when the selected metrics change.
   */
  @Output() metricsChanged: EventEmitter<string[]> = new EventEmitter<
    string[]
  >();

  /**
   * Event emitted when the search value changes.
   */
  @Output() searchValueChanged: EventEmitter<string> =
    new EventEmitter<string>();

  /**
   * Form group for the component state.
   */
  stateForm = this._formBuilder.group({
    metricGroup: '',
  });

  /**
   * Array of metric groups.
   */
  metricGroups: MetricGroup[] = [];

  /**
   * Observable of metric group options.
   */
  metricGroupOptions!: Observable<MetricGroup[]>;

  /**
   * Key codes for separator keys.
   */
  separatorKeysCodes: number[] = [ENTER, COMMA];

  /**
   * Array of selected metrics.
   */
  selectedMetrics: string[] = [];

  /**
   * Form control for the metric input.
   */
  metricCtrl = new FormControl('');

  /**
   * Reference to the metric input element.
   */
  @ViewChild('metricInput') metricInput!: ElementRef<HTMLInputElement>;

  constructor(
    private _formBuilder: FormBuilder,
    private metricService: MetricService,
    private keyTranslatorService: KeyTranslatorService,
    private announcer: LiveAnnouncer
  ) { }

  /**
   * Lifecycle hook called after component initialization.
   */
  ngOnInit() {
    this.metricService.getMetricNames().subscribe((metrics) => {
      this.metricGroups = this.groupMetrics(metrics);
    });

    this.metricGroupOptions = this.stateForm
      .get('metricGroup')!
      .valueChanges.pipe(
        startWith(''),
        map((value) => {
          return this._filterGroup(value || '');
        })
      );

    this.isEnabled.subscribe((isEnabled) => {
      if (isEnabled) {
        this.metricCtrl.enable();
      } else {
        this.metricCtrl.disable();
      }
    });
  }

  /**
   * Adds a metric to the selected metrics.
   * @param event - The MatChipInputEvent object.
   */
  add(event: MatChipInputEvent): void {
    console.log('EVENT: ', event);
    const value = (event.value || '').trim();
    if (value) {
      const matchingMetric = this.metricGroups
        .flatMap((group) => group.names)
        .find((metric) => metric.toLowerCase() === value.toLowerCase());

      if (matchingMetric && !this.selectedMetrics.includes(matchingMetric)) {
        this.selectedMetrics.push(matchingMetric);
        this.metricsChanged.emit(this.selectedMetrics);
      }
    }

    event.chipInput!.clear();
    this.metricCtrl.setValue(null);
  }

  /**
   * Removes a metric from the selected metrics.
   * @param metric - The metric to remove.
   */
  remove(metric: string): void {
    const index = this.selectedMetrics.indexOf(metric);

    if (index >= 0) {
      this.selectedMetrics.splice(index, 1);
      this.metricsChanged.emit(this.selectedMetrics);
      this.announcer.announce(`Removed ${metric}`);
    }
  }

  /**
   * Handles the selection of a metric from the autocomplete options.
   * @param event - The MatAutocompleteSelectedEvent object.
   */
  selected(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;
    if (value) {
      const matchingMetric = this.metricGroups
        .flatMap((group) => group.names)
        .find((metric) => metric.toLowerCase() === value.toLowerCase());

      if (matchingMetric && !this.selectedMetrics.includes(matchingMetric)) {
        this.selectedMetrics.push(matchingMetric);
        this.metricsChanged.emit(this.selectedMetrics);
      }
    }
    this.metricInput.nativeElement.value = '';
    this.metricCtrl.setValue(null);
  }

  /**
   * Groups the metrics based on their keys.
   * @param metrics - The array of metrics.
   * @returns An array of MetricGroup objects.
   */
  private groupMetrics(metrics: string[]): MetricGroup[] {
    const groups: { [key: string]: string[] } = {};
    metrics.forEach((metric) => {
      const keys = this.keyTranslatorService.keyToFullStringParts(metric);
      const key = keys[0];
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(keys.join(' '));
    });

    return Object.entries(groups).map(([first, names]) => ({ first, names }));
  }

  /**
   * Filters the metric groups based on the search value.
   * @param value - The search value.
   * @returns An array of MetricGroup objects.
   */
  private _filterGroup(value: string): MetricGroup[] {
    if (value) {
      return this.metricGroups
        .map((group) => ({
          first: group.first,
          names: group.names.filter((name) =>
            name.toLowerCase().includes(value.toLowerCase())
          ),
        }))
        .filter((group) => group.names.length > 0);
    }

    return this.metricGroups;
  }

  /**
   * Handles the change event of the search input.
   */
  onSearchInputChange() {
    const searchValue = this.metricCtrl?.value ?? '';
    this.searchValueChanged.emit(searchValue);
  }

  /**
   * Returns an observable of the disabled tooltip.
   * @returns An observable of the disabled tooltip.
   */
  getDisabledTooltip(): Observable<string> {
    return this.isEnabled.pipe(
      map((isEnabled) => (isEnabled ? '' : 'Cards only support one Metric'))
    );
  }
}
