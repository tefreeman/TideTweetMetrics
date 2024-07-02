import { Component, OnInit, inject } from '@angular/core';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { optimizerData } from './optimizer.example';
import { OptimizerService } from '../../../core/services/optimizer.service';
import {
  TweetNode,
  TweetPayload,
} from '../../../core/interfaces/optimizer-interface';
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
  isRunning = false;
  inputTweet = optimizerData.tweet.text;
  improvementTree: TweetNode | null = null;

  optimizerService: OptimizerService = inject(OptimizerService);

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  submitTweet() {
    const payload: TweetPayload = {
      text: 'Congratulations @Chris_Crawford_on becoming the rank of Associate Professor!',
      author_id: 'alabama_cs',
      created_at: '2024-06-26T06:34:56.000Z',
      photo_count: 1,
      video_count: 0,
    };
    this.isRunning = true;
    this.optimizerService.getOptimizeTweet$(payload).subscribe((result) => {
      this.isRunning = false;
      this.improvementTree = result;
      console.log(result);
    });
  }
}
