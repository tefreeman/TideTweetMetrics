import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-optimizer',
  standalone: true,
  imports: [
    MaterialModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatExpansionModule,
    NgIf,
  ],
  templateUrl: './optimizer.component.html',
  styleUrls: ['./optimizer.component.css'],
})
export class OptimizerComponent implements OnInit {
  value = '';
  improvedTweet = ''; // To store the improved tweet
  oldLikes = 0;
  newLikes = 0;
  isRunning = false;
  constructor(private http: HttpClient) {}

  ngOnInit() {}

  submitTweet() {
    this.isRunning = true;
    const tweetData = { tweet: this.value };
    this.http
      .post<{ new_tweet: string; likes: number; improved_likes: number }>(
        'http://73.58.28.154:5000/',
        tweetData
      )
      .subscribe({
        next: (response) => {
          this.improvedTweet = response.new_tweet;
          this.oldLikes = response.likes;
          this.newLikes = response.improved_likes;
          this.isRunning = false;
        },
        error: (error) => {
          console.error('There was an error!', error);
          this.isRunning = false;
        },
      });
  }
}
