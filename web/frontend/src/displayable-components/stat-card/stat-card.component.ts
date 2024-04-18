import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { AsyncPipe, NgClass, NgIf, NgSwitch } from '@angular/common';
import { StatTrendComponent } from '../stat-trend/stat-trend.component';
import { StatValueComponent } from '../stat-value/stat-value.component';
import { StatCompComponent } from '../stat-comp/stat-comp.component';
import {CdkDrag} from '@angular/cdk/drag-drop';
import { MaterialModule } from '../../core/modules/material/material.module';
import { T_DisplayableDataType, I_StatValueData, I_StatTrendData, I_StatCompData } from '../../core/interfaces/displayable-interface';
import { EditModeService } from '../../core/services/edit-mode.service';
import { Observable } from 'rxjs';
import { DisplayRequestManagerService } from '../../core/services/display-request-manager.service';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [StatValueComponent, NgIf, StatTrendComponent, MaterialModule, StatCompComponent, NgSwitch, CdkDrag, NgClass, AsyncPipe],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss'
})
export class StatCardComponent implements OnInit {
  editModeService: EditModeService = inject(EditModeService);
  @Input({required: true}) displayableData!: T_DisplayableDataType;
  @Input({required: true}) placeHolderForEdit!: boolean;
  @Output() deleteEvent = new EventEmitter<void>();
  
  editMode: Observable<boolean> = this.editModeService.getEditMode();
  applyClass = true; 
  
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

  onMouseDown(): void {
    this.applyClass = false; 
  }

  onMouseUp(): void {
    this.applyClass = true; 
  }

  onDelete(): void {
    this.deleteEvent.emit();
  }
}