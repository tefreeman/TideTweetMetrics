import { Component, inject, Input, OnInit } from '@angular/core';
import { KeyTranslatorService } from '../../../core/services/key-translator.service';
import { I_DisplayableData } from '../../../core/interfaces/displayable-interface';
import { NgIf } from '@angular/common';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-comp',
  standalone: true,
  imports: [MaterialModule, NgIf, CommonModule],
  templateUrl: './stat-comp.component.html',
  styleUrl: './stat-comp.component.scss'
})
export class StatCompComponent {
  @Input({required: true}) displayableData!: I_DisplayableData;



  
  constructor() {
    
  }

 ngOnInit() {


 }

}

