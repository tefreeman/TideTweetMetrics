import { Component, Input } from '@angular/core';
import { MetricValue } from '../../../graph/graph.service';

@Component({
  selector: 'app-static-value',
  standalone: true,
  imports: [],
  templateUrl: './static-value.component.html',
  styleUrl: './static-value.component.scss'
})
export class StaticValueComponent {
  @Input({required: true}) owner!: string;
  @Input({required: true}) value!: MetricValue;

  constructor() {}


}
