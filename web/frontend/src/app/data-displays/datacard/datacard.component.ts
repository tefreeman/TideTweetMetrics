import { Component, inject, Input, OnInit } from '@angular/core';
import { IDisplayableStats, I_DisplayableRequest, I_StatCompData, I_StatTrendData, I_StatValueData, T_DisplayableDataType } from '../../core/interfaces/displayable-interface';
import { NgIf, NgSwitch } from '@angular/common';
import { MaterialModule } from '../../core/modules/material/material.module';
import { StatTrendComponent } from './stat-trend/stat-trend.component';
import { StatValueComponent } from './stat-value/stat-value.component';
import { StatCompComponent } from './stat-comp/stat-comp.component';
import {CdkDrag} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-datacard',
  standalone: true,
  imports: [StatValueComponent, NgIf, StatTrendComponent, MaterialModule, StatCompComponent, NgSwitch, CdkDrag],
  templateUrl: './datacard.component.html',
  styleUrl: './datacard.component.scss'
})
export class DatacardComponent implements OnInit {
  @Input({required: true}) displayableData!: T_DisplayableDataType;


  
  constructor() {
  }

  ngOnInit(): void {}

  isStatValue(data: T_DisplayableDataType): data is I_StatValueData {
    return data.type === "stat-value";
  }

  isStatTrend(data: T_DisplayableDataType): data is I_StatTrendData {
    return data.type === "stat-trend";
  }

  isStatComp(data: T_DisplayableDataType): data is I_StatCompData {
    return data.type === "stat-comp";
  }

}