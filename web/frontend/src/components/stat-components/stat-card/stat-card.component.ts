import { CdkDrag } from '@angular/cdk/drag-drop';
import { AsyncPipe, NgClass, NgIf, NgSwitch } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { Observable } from 'rxjs';
import {
  I_StatCompData,
  I_StatTrendData,
  I_StatValueData,
  T_DisplayableDataType,
} from '../../../core/interfaces/displayable-data-interface';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { EditModeService } from '../../../core/services/edit-mode.service';
import { StatCompComponent } from '../stat-comp/stat-comp.component';
import { StatTrendComponent } from '../stat-trend/stat-trend.component';
import { StatValueComponent } from '../stat-value/stat-value.component';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [
    StatValueComponent,
    NgIf,
    StatTrendComponent,
    MaterialModule,
    StatCompComponent,
    NgSwitch,
    CdkDrag,
    NgClass,
    AsyncPipe,
  ],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
})
export class StatCardComponent implements OnInit {
  editModeService: EditModeService = inject(EditModeService);
  @Input({ required: true }) displayableData!: T_DisplayableDataType;
  @Input({ required: true }) editModeHook!: boolean;
  @Output() deleteEvent = new EventEmitter<void>();
  hoverState: boolean = false;
  editMode: Observable<boolean> = this.editModeService.getEditMode();
  applyClass = true;

  constructor() {}

  ngOnInit(): void {}

  isStatValue(data: T_DisplayableDataType): data is I_StatValueData {
    return data.type === 'stat-value';
  }

  isStatTrend(data: T_DisplayableDataType): data is I_StatTrendData {
    return data.type === 'stat-trend';
  }

  isStatComp(data: T_DisplayableDataType): data is I_StatCompData {
    return data.type === 'stat-comp';
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

  toggleHover(state: boolean): void {
    this.hoverState = state;
  }
}
