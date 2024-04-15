import { Component, inject, Input, OnInit } from '@angular/core';
import { KeyTranslatorService } from '../../../core/services/key-translator.service';
import { I_DisplayableData, I_StatTrendData } from '../../../core/interfaces/displayable-interface';
import { NgIf } from '@angular/common';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-trend',
  standalone: true,
  imports: [MaterialModule, NgIf, CommonModule],
  templateUrl: './stat-trend.component.html',
  styleUrls: ['./stat-trend.component.scss'],
})
export class StatTrendComponent implements OnInit {
  @Input({required: true}) displayableData!: I_StatTrendData;

  private keyTranslatorService: KeyTranslatorService = inject(KeyTranslatorService);

  metricName = "";
  oldPoint: number = 0;
  nowPoint: number = 0;
  
  oldTime: number = 0;
  nowTime: number = 0;

  difference: number = 0
  timeUnitString: string = "";

  constructor() {
    
   }

  ngOnInit() {
    this.metricName = this.keyTranslatorService.translateKey(this.displayableData['metricName']);
    this.oldPoint = this.displayableData.values.at(-2) as number;
    this.nowPoint = this.displayableData.values.at(-1) as number;

    this.oldTime = this.displayableData.times.at(-2) as number;
    this.nowTime = this.displayableData.times.at(-1) as number;

    this.difference = this.nowPoint - this.oldPoint;
    this.timeUnitString = this.displayableData.time_period;
  }

}
