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
import {MatButtonToggleModule} from '@angular/material/button-toggle';

export interface OwnerGroup {
  first: string;
  names: string[];
}

/**
 * Component for searching and selecting owners.
 */
@Component({
  selector: 'app-owner-input',
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
    MatButtonToggleModule
  ],
  templateUrl: './owner-input.component.html',
  styleUrl: './owner-input.component.scss',
})
export class OwnerSearchComponent implements OnInit {
  /**
   * Event emitter for when the selected owners change.
   */
  @Output() ownersChanged = new EventEmitter<string[]>();

  /**
   * The name of the metric.
   */
  @Input({ required: true }) metricName: string = '';

  /**
   * The default owners.
   */
  @Input({ required: true }) defaultOwners: string[] = [];

  /**
   * Indicates whether the user is allowed to perform actions.
   */
  @Input({ required: true }) isAllowed!: boolean;

  /**
   * The key codes for the separator keys.
   */
  separatorKeysCodes: number[] = [ENTER, COMMA];

  /**
   * The form control for the owner input.
   */
  ownerCtrl = new FormControl('');

  /**
   * The filtered owners.
   */
  filteredOwners: Observable<string[]>;

  /**
   * The selected owners.
   */
  selectedOwners: string[] = [];

  /**
   * All owners.
   */
  allOwners: string[] = [];

  /**
   * The owner input element.
   */
  @ViewChild('ownerInput')
  ownerInput!: ElementRef<HTMLInputElement>;

  /**
   * The live announcer.
   */
  announcer = inject(LiveAnnouncer);

  /**
   * Constructs a new instance of the OwnerSearchComponent.
   * @param metricService The metric service.
   */
  constructor(private metricService: MetricService) {
    this.filteredOwners = this.ownerCtrl.valueChanges.pipe(
      startWith(null),
      map((owner: string | null) =>
        owner ? this._filter(owner) : this.allOwners.slice()
      )
    );
  }

  /**
   * Initializes the component.
   */
  ngOnInit() {
    this.selectedOwners = this.defaultOwners;
    this.ownersChanged.emit(this.selectedOwners);
    this.metricService.getOwnersForStat(this.metricName).subscribe((owners) => {
      this.allOwners = owners;
    });
  }

  /**
   * Adds an owner.
   * @param event The MatChipInputEvent.
   */
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

  /**
   * Removes an owner.
   * @param owner The owner to remove.
   */
  remove(owner: string): void {
    const index = this.selectedOwners.indexOf(owner);

    if (index >= 0) {
      this.selectedOwners.splice(index, 1);
      this.ownersChanged.emit(this.selectedOwners);
      this.announcer.announce(`Removed ${owner}`);
    }
  }

  /**
   * Handles the selection of an owner from the autocomplete.
   * @param event The MatAutocompleteSelectedEvent.
   */
  selected(event: MatAutocompleteSelectedEvent): void {
    this.selectedOwners.push(event.option.viewValue);
    this.ownersChanged.emit(this.selectedOwners);
    this.ownerInput.nativeElement.value = '';
    this.ownerCtrl.setValue(null);
  }

  /**
   * Filters the owners based on the given value.
   * @param value The value to filter by.
   * @returns The filtered owners.
   */
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allOwners.filter((owner) =>
      owner.toLowerCase().includes(filterValue)
    );
  }
}
