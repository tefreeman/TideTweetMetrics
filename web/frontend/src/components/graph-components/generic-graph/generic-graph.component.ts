import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-community';
import { T_DisplayableGraph } from '../../../core/interfaces/displayable-data-interface';
import { GraphMakerService } from '../../../core/services/graph-maker.service';

@Component({
  selector: 'app-generic-graph',
  standalone: true,
  imports: [CommonModule, AgChartsAngular],
  templateUrl: './generic-graph.component.html',
  styleUrl: './generic-graph.component.scss',
})
export class GenericGraphComponent {
  @Input({ required: true }) displayableData!: T_DisplayableGraph;

  private graphMakerService: GraphMakerService = inject(GraphMakerService);

  public chartOptions: AgChartOptions = {};

  constructor() {}

  ngOnInit(): void {
    this.chartOptions = this.graphMakerService.createChart(
      this.displayableData
    );
    console.log(this.chartOptions);
  }
}
