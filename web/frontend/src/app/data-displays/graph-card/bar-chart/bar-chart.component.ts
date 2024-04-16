import { Component, inject, Input, OnInit} from '@angular/core';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions, AgChartTheme, AgChartThemeName } from 'ag-charts-community';
import {I_GraphBarData } from '../../../core/interfaces/displayable-interface';
import { GraphMakerService } from '../../../core/services/graph-maker.service';
@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [AgChartsAngular],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss',
})
export class BarChartComponent implements OnInit {
  @Input({required: true}) displayableData!: I_GraphBarData;

  private graphMakerService: GraphMakerService = inject(GraphMakerService);
  // Chart Options

  public chartOptions: AgChartOptions = {};
  constructor() {
  }

ngOnInit(): void {
    this.chartOptions = this.graphMakerService.createBarChart(this.displayableData);
    console.log(this.chartOptions);
}
}
