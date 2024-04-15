import { Component, Input, OnInit } from '@angular/core';
import { I_DisplayableData, I_GraphBarData, I_GraphLineData, T_DisplayableData } from '../../core/interfaces/displayable-interface';
import { MaterialModule } from '../../core/modules/material/material.module';
import { NgIf } from '@angular/common';
import { LineChartComponent } from './line-chart/line-chart.component';
import { BarChartComponent } from './bar-chart/bar-chart.component';
@Component({
  standalone: true,
  imports: [MaterialModule, NgIf,BarChartComponent, LineChartComponent],
  selector: 'app-graph-card',
  templateUrl: './graph-card.component.html',
  styleUrls: ['./graph-card.component.scss']
})
export class GraphCardComponent implements OnInit {
  @Input({required: true}) displayableData!: T_DisplayableData;

  constructor() { }

  ngOnInit() {
  }

  isLineGraph(data: T_DisplayableData): data  is I_GraphLineData {
    return data.type === "graph-line";
  }

  isBarGraph(data: T_DisplayableData): data is I_GraphBarData {
    return data.type === "graph-bar";
  }

  isPieGraph(data: T_DisplayableData) {}

}
