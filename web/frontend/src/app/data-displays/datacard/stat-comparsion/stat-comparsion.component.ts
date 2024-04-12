import { Component, OnInit, Input} from '@angular/core';
import { I_DisplayableData } from '../../../core/interfaces/displayable-interface';
import { MaterialModule } from '../../../material/material.module';

@Component({
  standalone: true,
  selector: 'app-stat-comparsion',
  imports: [MaterialModule],
  templateUrl: './stat-comparsion.component.html',
  styleUrls: ['./stat-comparsion.component.css']
  
})
export class StatComparsionComponent implements OnInit {

  @Input({required: true}) displayableData!: I_DisplayableData;

  constructor() { }


  ngOnInit() {
  }

}
