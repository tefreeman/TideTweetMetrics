import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { FormsModule } from '@angular/forms';

/**
 * Represents the AddBoardComponent class.
 * This component is responsible for adding a board.
 */
@Component({
  selector: 'app-add-board',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule
  ],
  templateUrl: './add-board.component.html',
  styleUrl: './add-board.component.scss',
})
export class AddBoardComponent {
  /**
   * Represents the name input value.
   */
  nameInput: string = ""

  /**
   * Initializes a new instance of the AddBoardComponent class.
   */
  constructor() { }
}
