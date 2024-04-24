import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-community';
import { Observable } from 'rxjs';
import { I_BaseGraphCard } from '../../../core/interfaces/displayable-data-interface';
import { GraphMakerService } from '../../../core/services/graph-maker.service';
@Component({
  selector: 'app-reactive-generic-graph',
  standalone: true,
  imports: [CommonModule, AgChartsAngular, AsyncPipe],
  templateUrl: './reactive-generic-graph.component.html',
  styleUrl: './reactive-generic-graph.component.scss',
})
export class ReactiveGenericGraphComponent implements OnInit, OnDestroy {
  @Input({ required: true }) displayableData!: Observable<I_BaseGraphCard[]>;

  private graphMakerService: GraphMakerService = inject(GraphMakerService);

  public chartOptions: AgChartOptions = {};
  public sub: any;
  public hideGraph = true;
  constructor() {}

  ngOnInit(): void {
    this.sub = this.displayableData.subscribe((data) => {
      const result = this.graphMakerService.createChart(data[0]);
      if (result) {
        this.chartOptions = result;
        this.hideGraph = false;
      } else {
        this.hideGraph = true;
        this.chartOptions = {};
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
