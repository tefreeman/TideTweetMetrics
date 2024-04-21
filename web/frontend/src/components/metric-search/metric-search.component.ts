import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
import { MaterialModule } from '../../core/modules/material/material.module';
import { KeyTranslatorService } from '../../core/services/key-translator.service';
import { MetricService } from '../../core/services/metric.service';

export interface MetricGroup {
  first: string;
  names: string[];
}

export const _filter = (opt: string[], value: string): string[] => {
  const filterValue = value.toLowerCase();

  return opt.filter((item) => item.toLowerCase().includes(filterValue));
};

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
  styleUrl: './metric-search.component.scss',
})
export class MetricSearchComponent implements OnInit {
  @Output() searchValueChanged: EventEmitter<string> =
    new EventEmitter<string>();

  stateForm = this._formBuilder.group({
    metricGroup: '',
  });

  metricGroups: MetricGroup[] = [];
  metricGroupOptions!: Observable<MetricGroup[]>;

  constructor(
    private _formBuilder: FormBuilder,
    private metricService: MetricService,
    private keyTranslatorService: KeyTranslatorService
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
          this.searchValueChanged.emit(value as string); // Emit the current value
          return this._filterGroup(value || '');
        })
      );
  }

  private groupMetrics(metrics: string[]): MetricGroup[] {
    // The logic of grouping by the first string (word) instead of the first character
    const groups: { [key: string]: string[] } = {};
    metrics.forEach((metric) => {
      // Assuming metrics are space-delimited strings, get the first word for grouping
      const keys = this.keyTranslatorService.keyToFullStringParts(metric);
      const key = keys[0]; // Group by the first word
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
}
