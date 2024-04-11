import { Component, inject, Input, OnInit } from '@angular/core';
import { KeyTranslatorService } from '../../../core/services/key-translator.service';
import { I_DisplayableData } from '../../../core/interfaces/displayable-interface';
import { MatIcon } from '@angular/material/icon';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-stat-trend',
  standalone: true,
  imports: [MatIcon, NgIf],
  templateUrl: './stat-trend.component.html',
  styleUrls: ['./stat-trend.component.css'],
})
export class StatTrendComponent implements OnInit {
  @Input({required: true}) displayableData!: I_DisplayableData;

  private KeyTranslatorService: KeyTranslatorService = inject(KeyTranslatorService);

  metricName = "Tweet Likes";
  lastPoint: number = 29;
  nowPoint: number = 35;
  
  lastTime: number = 2018;
  nowTime: number = 2019;

  timeUnitString: string = "Years";

  constructor() { }

  ngOnInit() {


  }

}
