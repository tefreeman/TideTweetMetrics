import { CommonModule, DecimalPipe, NgIf } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { I_TrendMetricCard } from '../../../core/interfaces/displayable-data-interface';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { KeyTranslatorService } from '../../../core/services/key-translator.service';

/**
 * Represents the StatTrendComponent class.
 * This component is responsible for displaying the trend of a statistical metric.
 */
@Component({
  selector: 'app-stat-trend',
  standalone: true,
  imports: [MaterialModule, NgIf, CommonModule, DecimalPipe],
  templateUrl: './stat-trend.component.html',
  styleUrls: ['./stat-trend.component.scss'],
})
export class StatTrendComponent implements OnInit {
  /**
   * The displayable data for the statistical trend.
   */
  @Input({ required: true }) displayableData!: I_TrendMetricCard;
  @Input({ required: true }) color!: string;

  private keyTranslatorService: KeyTranslatorService =
    inject(KeyTranslatorService);

  /**
   * The name of the metric.
   */
  metricName = '';

  /**
   * The previous point value.
   */
  oldPoint: number = 0;

  /**
   * The current point value.
   */
  nowPoint: number = 0;

  /**
   * The previous time value.
   */
  oldTime: number = 0;

  /**
   * The current time value.
   */
  nowTime: number = 0;

  /**
   * The difference between the current and previous point values.
   */
  difference: number = 0;

  /**
   * The time unit string.
   */
  timeUnitString: string = '';

  constructor() {}

  /**
   * Initializes the component.
   */
  ngOnInit() {
    this.metricName = this.keyTranslatorService.keyToFullString(
      this.displayableData['metricName']
    );
    this.oldPoint = this.displayableData.values.at(-2) as number;
    this.nowPoint = this.displayableData.values.at(-1) as number;

    this.oldTime = this.displayableData.times.at(-2) as number;
    this.nowTime = this.displayableData.times.at(-1) as number;

    this.difference = this.nowPoint - this.oldPoint;

    console.log('TIME : ', this.oldTime, this.nowTime);
    this.timeUnitString = this.createTimePeriodString(
      this.oldTime,
      this.nowTime
    );
  }

  createTimePeriodString(oldTimeEpoch: number, nowTimeEpoch: number): string {
    const oneDay = 24 * 60 * 60; // hours*minutes*seconds*milliseconds
    const oneMonth = oneDay * 30; // Approximate, recognizing variability
    const oneYear = oneDay * 365; // Approximate, not accounting for leap year

    const diffTime = nowTimeEpoch - oldTimeEpoch;

    if (diffTime < oneDay) {
      // Less than a day
      return 'daily';
    } else if (diffTime < oneMonth) {
      // Weekly or less
      const days = Math.floor(diffTime / oneDay);
      if (days >= 7) {
        const weeks = Math.floor(days / 7);
        return weeks === 1 ? 'last week' : `${weeks} weeks ago`;
      } else {
        return days === 1 ? 'yesterday' : `${days} days ago `;
      }
    } else if (diffTime < oneYear) {
      // Monthly
      const months = Math.round(diffTime / oneMonth);
      return months === 1 ? 'last month' : `${months} months ago`;
    } else {
      // Yearly or more
      const years = Math.round(diffTime / oneYear);
      return years === 1 ? 'last year' : `${years} years ago`;
    }
  }
}
