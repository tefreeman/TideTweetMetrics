import { CommonModule, DecimalPipe, NgIf } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { I_StatTrendData } from '../../../core/interfaces/displayable-data-interface';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { KeyTranslatorService } from '../../../core/services/key-translator.service';

@Component({
  selector: 'app-stat-trend',
  standalone: true,
  imports: [MaterialModule, NgIf, CommonModule, DecimalPipe],
  templateUrl: './stat-trend.component.html',
  styleUrls: ['./stat-trend.component.scss'],
})
export class StatTrendComponent implements OnInit {
  @Input({ required: true }) displayableData!: I_StatTrendData;

  private keyTranslatorService: KeyTranslatorService =
    inject(KeyTranslatorService);

  metricName = '';
  oldPoint: number = 0;
  nowPoint: number = 0;

  oldTime: number = 0;
  nowTime: number = 0;

  difference: number = 0;
  timeUnitString: string = '';

  constructor() {}

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