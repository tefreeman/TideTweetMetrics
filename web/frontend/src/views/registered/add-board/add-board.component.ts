import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { FormsModule } from '@angular/forms';

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
  nameInput: string = ""
constructor(){}

  
}
