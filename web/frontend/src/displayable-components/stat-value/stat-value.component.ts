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
import { I_StatValueData } from '../../core/interfaces/displayable-data-interface';
import { KeyTranslatorService } from '../../core/services/key-translator.service';

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
  @Input({ required: true }) displayableData!: I_StatValueData;

  private keyTranslatorService: KeyTranslatorService =
    inject(KeyTranslatorService);

  statValue: number = 0;
  metricName: string = '';

  constructor() {}

  ngOnInit() {
    this.statValue = this.displayableData.value as number;
    this.metricName = this.keyTranslatorService.keyToFullString(
      this.displayableData.metricName
    );
  }

  isNumber(value: any): boolean {
    return !isNaN(value);
  }
}
