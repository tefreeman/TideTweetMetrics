import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-community';
import { I_GraphLineData } from '../../../core/interfaces/displayable-data-interface';
import { GraphMakerService } from '../../../core/services/graph-maker.service';

/**
 * Represents the LineChartComponent class.
 * This component is responsible for displaying a line chart.
 */
@Component({
  standalone: true,
  imports: [CommonModule, RouterOutlet, AgChartsAngular],
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
})
export class LineChartComponent {
  /**
   * The input data for the line chart.
   */
  @Input({ required: true }) displayableData!: I_GraphLineData;

  /**
   * The service used to create the line chart.
   */
  private graphMakerService: GraphMakerService = inject(GraphMakerService);

  /**
   * The chart options for the line chart.
   */
  public chartOptions: AgChartOptions = {};

  constructor() { }

  /**
   * Initializes the component.
   */
  ngOnInit(): void {
    this.chartOptions = this.graphMakerService.createLineChart(
      this.displayableData
    );
    console.log(this.chartOptions);
  }
}
