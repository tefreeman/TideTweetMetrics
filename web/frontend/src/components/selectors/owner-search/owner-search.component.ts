import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { MetricService } from '../../../core/services/metrics/metric.service';

export interface OwnerGroup {
  first: string;
  names: string[];
}

export const _filter = (opt: string[], value: string): string[] => {
  const filterValue = value.toLowerCase();

  return opt.filter((item) => item.toLowerCase().includes(filterValue));
};

@Component({
  selector: 'app-owner-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    AsyncPipe,
  ],
  templateUrl: './owner-search.component.html',
  styleUrl: './owner-search.component.scss',
})
export class OwnerSearchComponent implements OnInit {
  @Output() searchValueChanged: EventEmitter<string> =
    new EventEmitter<string>();

  @Input({ required: true }) metricName: string = '';

  stateForm = this._formBuilder.group({
    metricGroup: '',
  });

  ownerGroups: OwnerGroup[] = [];
  ownerGroupOptions!: Observable<OwnerGroup[]>;

  constructor(
    private _formBuilder: FormBuilder,
    private metricService: MetricService
  ) {}

  ngOnInit() {
    this.metricService
      .getOwnersForStat(this.metricName)
      .subscribe((metrics) => {
        this.ownerGroups = this.groupMetrics(metrics);
      });

    this.ownerGroupOptions = this.stateForm
      .get('metricGroup')!
      .valueChanges.pipe(
        startWith(''),
        map((value) => {
          this.searchValueChanged.emit(value as string); // Emit the current value
          return this._filterGroup(value || '');
        })
      );
  }

  private groupMetrics(metrics: string[]): OwnerGroup[] {
    // The logic of grouping by the first capitalized character
    const groups: { [key: string]: string[] } = {};
    metrics.forEach((metric) => {
      // Get the first character of the metric string
      const firstChar = metric.charAt(0).toUpperCase();
      if (!groups[firstChar]) {
        groups[firstChar] = [];
      }
      groups[firstChar].push(metric);
    });

    return Object.entries(groups).map(([first, names]) => ({ first, names }));
  }

  private _filterGroup(value: string): OwnerGroup[] {
    if (value) {
      return this.ownerGroups
        .map((group) => ({
          first: group.first,
          names: group.names.filter((name) =>
            name.toLowerCase().includes(value.toLowerCase())
          ),
        }))
        .filter((group) => group.names.length > 0);
    }

    return this.ownerGroups;
  }
}
