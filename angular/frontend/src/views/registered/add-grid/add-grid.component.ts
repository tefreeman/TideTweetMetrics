import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MaterialModule } from '../../../core/modules/material/material.module';

@Component({
  selector: 'app-add-grid',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule, MatButtonToggleModule],
  templateUrl: './add-grid.component.html',
  styleUrl: './add-grid.component.scss',
})
export class AddGridComponent {
  /**
   * Represents the name input value.
   */
  nameInput: string = '';
  typeInput: string = '';
  /**
   * Initializes a new instance of the AddBoardComponent class.
   */
  constructor() {}
}
