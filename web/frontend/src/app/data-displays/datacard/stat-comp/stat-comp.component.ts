import { Component, inject, Input, OnInit } from '@angular/core';
import { KeyTranslatorService } from '../../../core/services/key-translator.service';
import { I_DisplayableData } from '../../../core/interfaces/displayable-interface';
import { NgIf } from '@angular/common';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { CommonModule } from '@angular/common';
import { DecimalPipe } from '@angular/common';
@Component({
  selector: 'app-stat-comp',
  standalone: true,
  imports: [MaterialModule, NgIf, CommonModule, DecimalPipe],
  templateUrl: './stat-comp.component.html',
  styleUrl: './stat-comp.component.scss'
})
export class StatCompComponent {
  @Input({required: true}) displayableData!: I_DisplayableData;
  private keyTranslatorService: KeyTranslatorService = inject(KeyTranslatorService);

  stat_name = ""
  stat_one: number = 0;
  owner_one: string = "";
  stat_two: number = 0;
  owner_two: string = "";


  
  constructor() {
    
  }

 ngOnInit() {
  this.stat_name = this.keyTranslatorService.translateKey(this.displayableData['stat_name']);
  this.stat_one = Object.values(this.displayableData['owners'])[0] as number;
  this.stat_two = Object.values(this.displayableData['owners'])[1] as number;
  this.owner_one = Object.keys(this.displayableData['owners'])[0];
  this.owner_two = Object.keys(this.displayableData['owners'])[1];
 }

}

