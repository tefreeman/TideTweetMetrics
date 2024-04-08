import { Component, inject, Input, OnInit } from '@angular/core';
import { MatCard } from '@angular/material/card';

import { StaticValueComponent } from './static-value/static-value.component';
import { GraphDataInterface, GraphRequestInterface } from '../../core/interfaces/graphs-interface';
@Component({
  selector: 'app-datacard',
  standalone: true,
  imports: [MatCard, StaticValueComponent],
  templateUrl: './datacard.component.html',
  styleUrl: './datacard.component.scss'
})
export class DatacardComponent implements OnInit {
  @Input({required: true}) graphRequest!: GraphDataInterface;


  constructor() {
  }

  ngOnInit(): void {

  }
}
