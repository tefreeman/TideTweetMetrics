import { Component, inject, Input, OnInit } from '@angular/core';
import { MatCard } from '@angular/material/card';

import { StaticValueComponent } from './static-value/static-value.component';
import { I_DisplayableData, I_DisplayableRequest } from '../../core/interfaces/displayable-interface';
import { KeyTranslatorService } from '../../core/services/key-translator.service';
@Component({
  selector: 'app-datacard',
  standalone: true,
  imports: [MatCard, StaticValueComponent],
  templateUrl: './datacard.component.html',
  styleUrl: './datacard.component.scss'
})
export class DatacardComponent implements OnInit {
  @Input({required: true}) graphRequest!: I_DisplayableData;

  keyTranslatorService = inject(KeyTranslatorService);
  
  statName: string = "";
  value: number = 0;
  constructor() {
  }

  ngOnInit(): void {
    this.statName = this.keyTranslatorService.translateKey(this.graphRequest.stat_name);
    this.value = Number(this.graphRequest.values[0]);
    console.log(this.statName);
  }
}
