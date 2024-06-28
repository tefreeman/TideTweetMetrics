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
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, map, startWith } from 'rxjs';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { MetricService } from '../../../core/services/metrics/metric.service';

@Component({
  selector: 'app-owner-search-graph',
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
  templateUrl: './owner-search-graph.component.html',
  styleUrl: './owner-search-graph.component.scss',
})
export class OwnerSearchGraphComponent implements OnInit {
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

  extraOwners: string[] = ['All', 'Top: {number}', 'Bottom: {number}'];
  constructor(
    private metricService: MetricService,
    private _snackBar: MatSnackBar
  ) {
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
      this.allOwners = owners.concat(this.extraOwners);
    });
  }

  /**
   * Checks if the input is valid when using special identifiers like 'Top: ' or 'Bottom: '.
   * @param value The input value to validate.
   * @returns A boolean indicating if the value is valid.
   */
  private isValidSpecialInput(value: string): boolean {
    const pattern = /^(Top:|Bottom:)\s(\d+)$/;
    return pattern.test(value);
  }
  private transformSpecialInput(value: string): string | null {
    const matched = value.match(/^(Top:|Bottom:)\s(\d+)$/);
    if (matched) {
      return `${matched[1]} ${matched[2]}`; // Return formatted string
    }
    return null; // Indicate invalid input
  }
  /**
   * Adds an owner.
   * @param event The MatChipInputEvent.
   */
  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Attempt to transform the special input
    const transformedValue = this.transformSpecialInput(value) || value;

    if (
      transformedValue &&
      (this.allOwners.includes(transformedValue) ||
        this.transformSpecialInput(value))
    ) {
      if (!this.selectedOwners.includes(transformedValue)) {
        this.selectedOwners.push(transformedValue);
        this.ownersChanged.emit(this.selectedOwners);
      }
    } else if (value.startsWith('Top: ') || value.startsWith('Bottom: ')) {
      this._snackBar.open(
        'Please enter a valid number after "Top: " or "Bottom: ".',
        'OK',
        { duration: 3000 }
      );
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
    const value = event.option.viewValue;
    const transformedValue = this.transformSpecialInput(value) || value;

    if (transformedValue) {
      this.selectedOwners.push(transformedValue);
      this.ownersChanged.emit(this.selectedOwners);
    } else {
      this._snackBar.open(
        'Please enter a valid number after "Top: " or "Bottom: ".',
        'OK',
        { duration: 3000 }
      );
    }

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
