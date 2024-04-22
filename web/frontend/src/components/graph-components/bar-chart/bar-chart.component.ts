import { Component, inject, Input, OnInit } from '@angular/core';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-community';
import { I_GraphBarData } from '../../../core/interfaces/displayable-data-interface';
import { GraphMakerService } from '../../../core/services/graph-maker.service';

/**
 * This component represents a bar chart.
 */

@Component({
  /**
   * The selector for this component.
   */
  selector: 'app-bar-chart',
  /**
   * Specifies whether this component is standalone or not.
   */
  standalone: true,
  /**
   * The Angular modules imported by this component.
   */
  imports: [AgChartsAngular],
  /**
   * The HTML template for this component.
   */
  templateUrl: './bar-chart.component.html',
  /**
   * The style file for this component.
   */
  styleUrl: './bar-chart.component.scss',
})
export class BarChartComponent implements OnInit {
  /**
   * The input data for the bar chart.
   */
  @Input({ required: true }) displayableData!: I_GraphBarData;

  /**
   * The graph maker service used to create the bar chart.

   */
  private graphMakerService: GraphMakerService = inject(GraphMakerService);


  /**
   * The chart options for the bar chart.
   */
  public chartOptions: AgChartOptions = {};

  constructor() { }

  ngOnInit(): void {
    this.chartOptions = this.graphMakerService.createBarChart(
      this.displayableData
    );
    console.log(this.chartOptions);
  }
}
