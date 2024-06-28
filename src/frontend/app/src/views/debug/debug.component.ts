import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AgChartsAngular } from 'ag-charts-angular';
import { MaterialModule } from '../../core/modules/material/material.module';
import { AgChartOptions } from 'ag-charts-community';

import { Chart } from './bar-small'
import { Chart1 } from './bar-large'
import { Chart2 } from './bargrouped-small'
import { Chart3 } from './bargrouped-large'
import { Chart4 } from './line-small'
import { Chart5 } from './scatter-small'
import { Chart6 } from './scatter-large'

/**
 * Represents the DebugComponent class.
 * This component is responsible for displaying debug information.
 */
@Component({
  selector: 'app-debug',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    AgChartsAngular
  ],
  templateUrl: './debug.component.html',
  styleUrl: './debug.component.scss',
})
export class DebugComponent {

  /**
   * Represents the chart options for the first chart.
   */
  chartOptions: AgChartOptions = new Chart().chartOptions;

  /**
   * Represents the chart options for the second chart.
   */
  chartOptions1: AgChartOptions = new Chart1().chartOptions;

  /**
   * Represents the chart options for the third chart.
   */
  chartOptions2: AgChartOptions = new Chart2().chartOptions;

  /**
   * Represents the chart options for the fourth chart.
   */
  chartOptions3: AgChartOptions = new Chart3().chartOptions;

  /**
   * Represents the chart options for the fifth chart.
   */
  chartOptions4: AgChartOptions = new Chart4().chartOptions;

  /**
   * Represents the chart options for the sixth chart.
   */
  chartOptions5: AgChartOptions = new Chart5().chartOptions;

  /**
   * Represents the chart options for the seventh chart.
   */
  chartOptions6: AgChartOptions = new Chart6().chartOptions;
}
