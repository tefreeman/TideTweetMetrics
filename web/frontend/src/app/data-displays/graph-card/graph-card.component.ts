import { Component, Input, OnInit } from '@angular/core';
import { I_DisplayableData } from '../../core/interfaces/displayable-interface';
import { MaterialModule } from '../../material/material.module';
import { NgIf } from '@angular/common';

@Component({
  standalone: true,
  imports: [MaterialModule, NgIf],
  selector: 'app-graph-card',
  templateUrl: './graph-card.component.html',
  styleUrls: ['./graph-card.component.scss']
})
export class GraphCardComponent implements OnInit {
  @Input({required: true}) displayableData!: I_DisplayableData;

  constructor() { }

  ngOnInit() {
  }

}
