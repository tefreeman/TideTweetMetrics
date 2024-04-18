import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { LineChartComponent } from '../line-chart/line-chart.component';
import { BarChartComponent } from '../bar-chart/bar-chart.component';
import { T_DisplayableDataType, I_GraphLineData, I_GraphBarData } from '../../core/interfaces/displayable-interface';
import { MaterialModule } from '../../core/modules/material/material.module';
import { Observable } from 'rxjs';
import { EditModeService } from '../../core/services/edit-mode.service';
@Component({
  standalone: true,
  imports: [MaterialModule, NgIf,BarChartComponent, LineChartComponent, AsyncPipe],
  selector: 'app-graph-card',
  templateUrl: './graph-card.component.html',
  styleUrls: ['./graph-card.component.scss']
})
export class GraphCardComponent implements OnInit {
  @Input({required: true}) displayableData!: T_DisplayableDataType;
  @Input({required: true}) placeHolderForEdit!: boolean;
  @Output() deleteEvent = new EventEmitter<void>();

  editModeService: EditModeService = inject(EditModeService);
  editMode: Observable<boolean> = this.editModeService.getEditMode();
  constructor() { }

  ngOnInit() {
  }

  isLineGraph(data: T_DisplayableDataType): data  is I_GraphLineData {
    return data.type === "graph-line";
  }

  isBarGraph(data: T_DisplayableDataType): data is I_GraphBarData {
    return data.type === "graph-bar";
  }

  isPieGraph(data: T_DisplayableDataType) {}

  onDelete(): void {
    this.deleteEvent.emit();
  }
}
