
import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../core/modules/material/material.module';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatExpansionModule} from '@angular/material/expansion';

@Component({
  selector: 'app-optimizer',
  standalone: true,
  imports: [MaterialModule, FormsModule, MatFormFieldModule, MatInputModule, MatExpansionModule],
  templateUrl: './optimizer.component.html',
  styleUrls: ['./optimizer.component.css']
})
export class OptimizerComponent implements OnInit {
  value = '';
  constructor() { }

  ngOnInit() {
  }

}
