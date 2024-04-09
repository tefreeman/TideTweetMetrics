import { Component, inject, Input, OnInit } from '@angular/core';
import { MatCard } from '@angular/material/card';

import { StaticValueComponent } from './static-value/static-value.component';
import { I_GraphDataInterface, I_DisplayableRequest } from '../../core/interfaces/displayable-interface';
@Component({
  selector: 'app-datacard',
  standalone: true,
  imports: [MatCard, StaticValueComponent],
  templateUrl: './datacard.component.html',
  styleUrl: './datacard.component.scss'
})
export class DatacardComponent implements OnInit {
  @Input({required: true}) graphRequest!: I_GraphDataInterface;


  constructor() {
  }

  ngOnInit(): void {

  }
}
