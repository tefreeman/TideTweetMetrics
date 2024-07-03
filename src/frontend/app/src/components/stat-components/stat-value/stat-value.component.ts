import { DecimalPipe } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import {
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { I_BasicMetricCard } from '../../../core/interfaces/displayable-data-interface';
import { KeyTranslatorService } from '../../../core/services/key-translator.service';

/**
 * Represents the StatValueComponent class.
 * This component is responsible for displaying a single statistic value.
 */
@Component({
  selector: 'app-stat-value',
  standalone: true,
  imports: [
    MatCardActions,
    MatCardHeader,
    MatCardContent,
    MatCardTitle,
    MatGridList,
    MatGridTile,
    MatDivider,
    DecimalPipe,
  ],
  templateUrl: './stat-value.component.html',
  styleUrl: './stat-value.component.scss',
})
export class StatValueComponent implements OnInit {
  /**
   * The input property that represents the displayable data for the statistic value.
   */
  @Input({ required: true }) displayableData!: I_BasicMetricCard;
  @Input({ required: true }) color!: string;

  private keyTranslatorService: KeyTranslatorService =
    inject(KeyTranslatorService);

  /**
   * The statistic value.
   */
  statValue: number = 0;

  /**
   * The name of the metric.
   */
  metricName: string = '';

  /**
   * The owner of the statistic value.
   */
  ownerOne: string = '';

  constructor() {}

  /**
   * Lifecycle hook that is called after data-bound properties of a directive are initialized.
   */
  ngOnInit() {
    if (Array.isArray(this.displayableData.value)) {
      this.statValue =
        typeof this.displayableData.value[0] === 'number'
          ? this.displayableData.value[0]
          : 0;
    } else if (typeof this.displayableData.value === 'number') {
      this.statValue = this.displayableData.value;
    } else {
      this.statValue = 0;
    }
    this.metricName = this.keyTranslatorService.keyToFullString(
      this.displayableData.metricName
    );
    this.ownerOne = this.displayableData.owner;
  }

  /**
   * Checks if a value is a number.
   * @param value - The value to check.
   * @returns True if the value is a number, false otherwise.
   */
  isNumber(value: any): boolean {
    return !isNaN(value);
  }
}
