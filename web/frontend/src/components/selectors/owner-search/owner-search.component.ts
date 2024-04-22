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
  inject,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Observable, map, startWith } from 'rxjs';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { MetricService } from '../../../core/services/metrics/metric.service';

export interface OwnerGroup {
  first: string;
  names: string[];
}

@Component({
  selector: 'app-owner-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    AsyncPipe,
    MatAutocompleteModule,
    MatChipsModule,
    MatIconModule,
  ],
  templateUrl: './owner-search.component.html',
  styleUrl: './owner-search.component.scss',
})
export class OwnerSearchComponent implements OnInit {
  @Output() ownersChanged = new EventEmitter<string[]>();
  @Input({ required: true }) metricName: string = '';
  @Input({ required: true }) defaultOwners: string[] = [];
  @Input({ required: true }) isAllowed!: boolean;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  ownerCtrl = new FormControl('');
  filteredOwners: Observable<string[]>;
  selectedOwners: string[] = [];
  allOwners: string[] = [];

  @ViewChild('ownerInput')
  ownerInput!: ElementRef<HTMLInputElement>;
  announcer = inject(LiveAnnouncer);

  constructor(private metricService: MetricService) {
    this.filteredOwners = this.ownerCtrl.valueChanges.pipe(
      startWith(null),
      map((owner: string | null) =>
        owner ? this._filter(owner) : this.allOwners.slice()
      )
    );
  }

  ngOnInit() {
    this.selectedOwners = this.defaultOwners;
    this.ownersChanged.emit(this.selectedOwners);
    this.metricService.getOwnersForStat(this.metricName).subscribe((owners) => {
      this.allOwners = owners;
    });
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value && this.allOwners.includes(value)) {
      if (!this.selectedOwners.includes(value)) {
        this.selectedOwners.push(value);
        this.ownersChanged.emit(this.selectedOwners);
      }
    }

    event.chipInput!.clear();
    this.ownerCtrl.setValue(null);
  }

  remove(owner: string): void {
    const index = this.selectedOwners.indexOf(owner);

    if (index >= 0) {
      this.selectedOwners.splice(index, 1);
      this.ownersChanged.emit(this.selectedOwners);
      this.announcer.announce(`Removed ${owner}`);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.selectedOwners.push(event.option.viewValue);
    this.ownersChanged.emit(this.selectedOwners);
    this.ownerInput.nativeElement.value = '';
    this.ownerCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allOwners.filter((owner) =>
      owner.toLowerCase().includes(filterValue)
    );
  }
}
