
import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';

/**
 * This component represents the optimizer component.
 * It is responsible for optimizing some value.
 */
@Component({
  selector: 'app-optimizer',
  standalone: true,
  imports: [MaterialModule, FormsModule, MatFormFieldModule, MatInputModule, MatExpansionModule],
  templateUrl: './optimizer.component.html',
  styleUrls: ['./optimizer.component.css']
})
export class OptimizerComponent implements OnInit {
  /**
   * The value to be optimized.
   */
  value = '';

  constructor() { }

  /**
   * Lifecycle hook that is called after data-bound properties of a directive are initialized.
   */
  ngOnInit() {
  }

}
