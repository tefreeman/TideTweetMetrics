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
  @Input({ required: true }) isEnabled!: Observable<boolean>;
  @Output() metricsChanged: EventEmitter<string[]> = new EventEmitter<
    string[]
  >();

  @Output() searchValueChanged: EventEmitter<string> =
    new EventEmitter<string>();

  stateForm = this._formBuilder.group({
    metricGroup: '',
  });

  metricGroups: MetricGroup[] = [];
  metricGroupOptions!: Observable<MetricGroup[]>;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  selectedMetrics: string[] = [];
  metricCtrl = new FormControl('');

  @ViewChild('metricInput') metricInput!: ElementRef<HTMLInputElement>;

  constructor(
    private _formBuilder: FormBuilder,
    private metricService: MetricService,
    private keyTranslatorService: KeyTranslatorService,
    private announcer: LiveAnnouncer
  ) {}

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

  add(event: MatChipInputEvent): void {
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

  remove(metric: string): void {
    const index = this.selectedMetrics.indexOf(metric);

    if (index >= 0) {
      this.selectedMetrics.splice(index, 1);
      this.metricsChanged.emit(this.selectedMetrics);
      this.announcer.announce(`Removed ${metric}`);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.selectedMetrics.push(event.option.viewValue);
    this.metricsChanged.emit(this.selectedMetrics);
    this.metricInput.nativeElement.value = '';
    this.metricCtrl.setValue(null);
  }

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

  onSearchInputChange() {
    const searchValue = this.metricCtrl?.value ?? '';
    this.searchValueChanged.emit(searchValue);
  }

  getDisabledTooltip(): Observable<string> {
    return this.isEnabled.pipe(
      map((isEnabled) => (isEnabled ? '' : 'Cards only support one Metric'))
    );
  }
}
