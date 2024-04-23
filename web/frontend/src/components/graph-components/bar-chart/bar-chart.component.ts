import { Component, inject, Input } from '@angular/core';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-community';
import { I_GraphBarData } from '../../../core/interfaces/displayable-data-interface';
import { GraphMakerService } from '../../../core/services/graph-maker.service';

/**
 * This component represents a bar chart.
 */

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [AgChartsAngular],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss',
})
export class BarChartComponent {
  @Input({ required: true }) displayableData!: I_GraphBarData;

  private graphMakerService: GraphMakerService = inject(GraphMakerService);

  public chartOptions: AgChartOptions = {};

  constructor() {}
}
