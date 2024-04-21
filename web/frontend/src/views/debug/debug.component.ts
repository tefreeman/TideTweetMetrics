import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AgChartsAngular } from 'ag-charts-angular';
import { MaterialModule } from '../../core/modules/material/material.module';
import { AgChartOptions } from 'ag-charts-community';

import {Chart} from './bar-small'
import {Chart1} from './bar-large'
import {Chart2} from './bargrouped-small'
import {Chart3} from './bargrouped-large'
import {Chart4} from './line-small'
import {Chart6} from './scatter-large'

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

  chartOptions: AgChartOptions = new Chart().chartOptions;
  chartOptions1: AgChartOptions = new Chart1().chartOptions;
  chartOptions2: AgChartOptions = new Chart2().chartOptions;
  chartOptions3: AgChartOptions = new Chart3().chartOptions;
  chartOptions4: AgChartOptions = new Chart4().chartOptions;
  chartOptions6: AgChartOptions = new Chart6().chartOptions;


}
