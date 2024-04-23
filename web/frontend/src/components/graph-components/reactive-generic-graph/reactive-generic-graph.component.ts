import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-community';
import { Observable } from 'rxjs';
import { T_DisplayableGraph } from '../../../core/interfaces/displayable-data-interface';
import { GraphMakerService } from '../../../core/services/graph-maker.service';
@Component({
  selector: 'app-reactive-generic-graph',
  standalone: true,
  imports: [CommonModule, AgChartsAngular, AsyncPipe],
  templateUrl: './reactive-generic-graph.component.html',
  styleUrl: './reactive-generic-graph.component.scss',
})
export class ReactiveGenericGraphComponent implements OnInit, OnDestroy {
  @Input({ required: true }) displayableData!: Observable<T_DisplayableGraph[]>;

  private graphMakerService: GraphMakerService = inject(GraphMakerService);

  public chartOptions: AgChartOptions = {};
  public sub: any;
  constructor() {}

  ngOnInit(): void {
    this.sub = this.displayableData.subscribe((data) => {
      console.log('Reactive card data :', data);
      this.chartOptions = this.graphMakerService.createChart(data[0]);
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
