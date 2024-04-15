import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../core/modules/material/material.module';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatExpansionModule} from '@angular/material/expansion';

@Component({
  standalone: true,
  imports: [MaterialModule, FormsModule, MatFormFieldModule, MatInputModule, MatExpansionModule],
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit {
  panelOpenState = false;
  constructor() { }

  ngOnInit() {
  }

}
