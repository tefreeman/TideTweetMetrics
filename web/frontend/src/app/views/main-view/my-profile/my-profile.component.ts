import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../core/modules/material/material.module';
@Component({
  standalone: true,
  imports: [MaterialModule],
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
