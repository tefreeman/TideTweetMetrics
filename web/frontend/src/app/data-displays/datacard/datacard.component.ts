import { Component, inject, Input, OnInit } from '@angular/core';
import { StatValueComponent } from './stat-value/stat-value.component';
import { I_DisplayableData, I_DisplayableRequest } from '../../core/interfaces/displayable-interface';
import { NgIf } from '@angular/common';
import { StatTrendComponent } from './stat-trend/stat-trend.component';
import { MaterialModule } from '../../material/material.module';

@Component({
  selector: 'app-datacard',
  standalone: true,
  imports: [StatValueComponent, NgIf, StatTrendComponent, MaterialModule],
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
