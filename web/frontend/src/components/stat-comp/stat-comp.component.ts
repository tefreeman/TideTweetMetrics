import { NgIf } from '@angular/common';
import { Component, inject, Input } from '@angular/core';

import { CommonModule, DecimalPipe } from '@angular/common';
import { I_StatCompData } from '../../core/interfaces/displayable-data-interface';
import { MaterialModule } from '../../core/modules/material/material.module';
import { KeyTranslatorService } from '../../core/services/key-translator.service';
@Component({
  selector: 'app-stat-comp',
  standalone: true,
  imports: [MaterialModule, NgIf, CommonModule, DecimalPipe],
  templateUrl: './stat-comp.component.html',
  styleUrl: './stat-comp.component.scss',
})
export class StatCompComponent {
  @Input({ required: true }) displayableData!: I_StatCompData;
  private keyTranslatorService: KeyTranslatorService =
    inject(KeyTranslatorService);

  metricName = '';
  statOne: number = 0;
  ownerOne: string = '';
  statTwo: number = 0;
  ownerTwo: string = '';

  constructor() {}

  ngOnInit() {
    this.metricName = this.keyTranslatorService.keyToFullString(
      this.displayableData['metricName']
    );
    this.statOne = this.displayableData.values[0] as number;
    this.statTwo = this.displayableData.values[1] as number;
    this.ownerOne = this.displayableData.owners[0];
    this.ownerTwo = this.displayableData.owners[1];
  }
}
