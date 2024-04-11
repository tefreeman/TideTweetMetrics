import { Component, inject, Input, OnInit } from '@angular/core';
import { T_MetricValue } from '../../../core/interfaces/metrics-interface';
import { MatCardActions, MatCardHeader, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { MatDivider } from '@angular/material/divider';
import { DecimalPipe } from '@angular/common';
import { I_KeyTranslator } from '../../../core/interfaces/key-translator-interface';
import { I_DisplayableData } from '../../../core/interfaces/displayable-interface';
import { KeyTranslatorService } from '../../../core/services/key-translator.service';


@Component({
  selector: 'app-stat-value',
  standalone: true,
  imports: [MatCardActions, MatCardHeader, MatCardContent, MatCardTitle, MatGridList, MatGridTile, MatDivider, DecimalPipe],
  templateUrl: './stat-value.component.html',
  styleUrl: './stat-value.component.scss'
})
export class StatValueComponent implements OnInit{
  @Input({required: true}) displayableData!: I_DisplayableData;

  private keyTranslatorService: KeyTranslatorService = inject(KeyTranslatorService);
  
  data: number = 0;
  metric_name: string = "";
  
  constructor() {

  }


  ngOnInit() {
    this.data = Number(this.displayableData['values'][0]);
    this.metric_name = this.keyTranslatorService.translateKey(this.displayableData['stat_name']);

    console.log(this.metric_name)
  }

  

  isNumber(value: any): boolean {
    return !isNaN(value);
  }
}
