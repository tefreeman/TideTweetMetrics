import { Component, inject, Input, OnInit } from '@angular/core';
import { NgIf, NgSwitch } from '@angular/common';
import { StatTrendComponent } from '../stat-trend/stat-trend.component';
import { StatValueComponent } from '../stat-value/stat-value.component';
import { StatCompComponent } from '../stat-comp/stat-comp.component';
import {CdkDrag} from '@angular/cdk/drag-drop';
import { MaterialModule } from '../../core/modules/material/material.module';
import { T_DisplayableDataType, I_StatValueData, I_StatTrendData, I_StatCompData } from '../../core/interfaces/displayable-interface';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [StatValueComponent, NgIf, StatTrendComponent, MaterialModule, StatCompComponent, NgSwitch, CdkDrag],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss'
})
export class StatCardComponent implements OnInit {
  @Input({required: true}) displayableData!: T_DisplayableDataType;
  @Input({required: true}) placeHolderForEdit!: boolean;

  
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