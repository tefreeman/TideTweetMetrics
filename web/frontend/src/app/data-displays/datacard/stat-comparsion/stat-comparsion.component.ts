import { Component, OnInit, Input} from '@angular/core';
import { I_DisplayableData } from '../../../core/interfaces/displayable-interface';

@Component({
  standalone: true,
  selector: 'app-stat-comparsion',
  imports: [],
  templateUrl: './stat-comparsion.component.html',
  styleUrls: ['./stat-comparsion.component.css']
  
})
export class StatComparsionComponent implements OnInit {

  @Input({required: true}) displayableData!: I_DisplayableData;

  constructor() { }


  ngOnInit() {
  }

}
