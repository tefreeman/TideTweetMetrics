import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatCardModule} from '@angular/material/card';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatGridListModule, MatCardModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
