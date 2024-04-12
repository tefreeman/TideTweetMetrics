import { Component, inject, Input, OnInit } from '@angular/core';
import { I_DisplayableData, I_DisplayableRequest } from '../../core/interfaces/displayable-interface';
import { NgIf } from '@angular/common';
import { MaterialModule } from '../../core/modules/material/material.module';
import { StatTrendComponent } from './stat-trend/stat-trend.component';
import { StatValueComponent } from './stat-value/stat-value.component';
import { StatCompComponent } from './stat-comp/stat-comp.component';


@Component({
  selector: 'app-datacard',
  standalone: true,
  imports: [StatValueComponent, NgIf, StatTrendComponent, MaterialModule, StatCompComponent],
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
