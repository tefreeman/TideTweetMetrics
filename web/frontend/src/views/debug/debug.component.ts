import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AgChartsAngular } from 'ag-charts-angular';
import { MaterialModule } from '../../core/modules/material/material.module';
import { AgChartOptions } from 'ag-charts-community';

import {Chart1} from './chart1'
import {Chart2} from './chart2'

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

  chartOptions: AgChartOptions = new Chart1().chartOptions;
  chartOptions2: AgChartOptions = new Chart2().chartOptions;


}
