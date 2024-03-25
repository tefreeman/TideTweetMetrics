import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ClassifyService } from './classify.service';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import { NgIf } from '@angular/common';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatCardModule, MatButtonModule, FormsModule, MatFormFieldModule, MatInputModule, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'classifier';
  public uid: string = "";
  public tweet = {data: {text: "", id: ""}}
  constructor(private classifyService: ClassifyService) {
    this.classifyService.get_random_tweet().then((data) => {
      this.tweet = data;
    });
  }
  
  set_uid(email :string) {
    this.uid = email;
  
  }
  clicked(flag: string) {
    if (this.uid == "") {
      alert("Please enter your email address");
      return;
    }
    this.classifyService.set_random_tweet(this.tweet.data.id, this.uid, flag).then((data) => {
      this.tweet=data;
    });
  }
}
