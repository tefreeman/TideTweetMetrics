import { CommonModule, DecimalPipe, NgIf } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { I_StatTrendData } from '../../../core/interfaces/displayable-data-interface';
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
  @Input({ required: true }) displayableData!: I_StatTrendData;

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

  constructor() { }

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
    this.timeUnitString = this.displayableData.time_period;
  }
}
