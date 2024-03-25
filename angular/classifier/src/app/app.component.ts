import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ClassifyService } from './classify.service';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatCardModule, MatButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'classifier';
  public tweet = {data: {text: "", id: ""}}
  constructor(private classifyService: ClassifyService) {
    this.classifyService.get_random_tweet().then((data) => {
      this.tweet = data;
    });
  }
  
  clicked(flag: string) {
    this.classifyService.set_random_tweet(this.tweet.data.id, "1", flag).then((data) => {
      this.tweet=data;
    });
  }
}
