import { Component, inject, Input, OnInit } from '@angular/core';
import { MatCard } from '@angular/material/card';

import { StatValueComponent } from './stat-value/stat-value.component';
import { I_DisplayableData, I_DisplayableRequest } from '../../core/interfaces/displayable-interface';
import { KeyTranslatorService } from '../../core/services/key-translator.service';
import { NgIf } from '@angular/common';
import { StatTrendComponent } from './stat-trend/stat-trend.component';

@Component({
  selector: 'app-datacard',
  standalone: true,
  imports: [MatCard, StatValueComponent, NgIf, StatTrendComponent],
  templateUrl: './datacard.component.html',
  styleUrl: './datacard.component.scss'
})
export class DatacardComponent implements OnInit {
  @Input({required: true}) displayableData!: I_DisplayableData;


  
  constructor() {
    console.log('DatacardComponent', this.displayableData);
  }

  ngOnInit(): void {
    console.log('DatacardComponentNgOnit', this.displayableData);
  }
}
