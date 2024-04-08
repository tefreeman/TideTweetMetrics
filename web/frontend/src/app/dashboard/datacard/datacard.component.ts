import { Component, inject, Input, OnInit } from '@angular/core';
import { GraphRequest, GraphService, MetricValue } from '../../graph/graph.service';
import { MatCard } from '@angular/material/card';
import { StaticValueComponent } from './static-value/static-value.component';
@Component({
  selector: 'app-datacard',
  standalone: true,
  imports: [MatCard, StaticValueComponent],
  templateUrl: './datacard.component.html',
  styleUrl: './datacard.component.scss'
})
export class DatacardComponent implements OnInit {
  @Input({required: true}) graphRequest!: GraphRequest;
  graphService: GraphService = inject(GraphService);

  metricValues: MetricValue[] = [];

  constructor() {
  }

  ngOnInit(): void {
    this.metricValues = this.graphService.getMetricData(this.graphRequest.stat_name, this.graphRequest.owners);
    console.log(this.metricValues);
  }
}
