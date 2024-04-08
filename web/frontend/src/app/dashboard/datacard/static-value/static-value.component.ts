import { Component, Input } from '@angular/core';
import { MetricValue } from '../../../graph/graph.service';
import { MatCardActions, MatCardHeader, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'app-static-value',
  standalone: true,
  imports: [MatCardActions, MatCardHeader, MatCardContent, MatCardTitle, MatGridList, MatGridTile, MatDivider],
  templateUrl: './static-value.component.html',
  styleUrl: './static-value.component.scss'
})
export class StaticValueComponent {
  @Input({required: true}) owner!: string;
  @Input({required: true}) metric!: string;
  @Input({required: true}) value!: MetricValue;

  constructor() {}


}
