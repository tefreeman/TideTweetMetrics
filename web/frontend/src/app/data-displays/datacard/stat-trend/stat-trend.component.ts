import { Component, inject, Input, OnInit } from '@angular/core';
import { KeyTranslatorService } from '../../../core/services/key-translator.service';
import { I_DisplayableData } from '../../../core/interfaces/displayable-interface';
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
  @Input({required: true}) displayableData!: I_DisplayableData;

  private keyTranslatorService: KeyTranslatorService = inject(KeyTranslatorService);

  metricName = "Tweet Likes";
  lastPoint: number = 10;
  nowPoint: number = 20;
  
  lastTime: number = 2018;
  nowTime: number = 2019;

  difference: number = this.nowPoint - this.lastPoint;

  timeUnitString: string = "Years";

  constructor() {
    
   }

  ngOnInit() {
    this.metricName = this.keyTranslatorService.translateKey(this.displayableData['stat_name']);


  }

}
