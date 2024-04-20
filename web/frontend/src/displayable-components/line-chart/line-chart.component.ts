import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-community';
import { I_GraphLineData } from "../../core/interfaces/displayable-data-interface";
import { GraphMakerService } from '../../core/services/graph-maker.service';


@Component({
  standalone: true,
  imports: [CommonModule, RouterOutlet, AgChartsAngular, ],
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent{

  @Input({required: true}) displayableData!: I_GraphLineData;

  private graphMakerService: GraphMakerService = inject(GraphMakerService);
  // Chart Options

  public chartOptions: AgChartOptions = {};
  constructor() {
  }

ngOnInit(): void {
    this.chartOptions = this.graphMakerService.createLineChart(this.displayableData);
    console.log(this.chartOptions);
}
}
