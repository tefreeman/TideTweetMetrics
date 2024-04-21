import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-owner-select-list',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './owner-select-list.component.html',
  styleUrl: './owner-select-list.component.scss',
})
export class OwnerSelectListComponent { }
