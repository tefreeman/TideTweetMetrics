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
  inputTweetText = '';
  improvementTree: TweetNode | null = null;
  topNodes: TweetNode[] = [];
  showingAllNodes = false;
  showNumNodes = 3;

  constructor(private http: HttpClient) {}
  optimizerService: OptimizerService = inject(OptimizerService);
  ngOnInit() {}

  submitTweet() {
    const payload: TweetPayload = {
      text: this.inputTweetText,
      author_id: 'alabama_cs',
      created_at: '2024-06-26T06:34:56.000Z',
      photo_count: 0,
      video_count: 0,
    };
    this.isRunning = true;
    this.optimizerService.getOptimizeTweet$(payload).subscribe((result) => {
      this.isRunning = false;
      this.improvementTree = result;
      this.showTopNodes();
    });
  }

  calc_prediction_improvement(node: TweetNode): number {
    return Math.round(
      Math.abs(
        (node.prediction - optimizerData.prediction) / optimizerData.prediction
      ) * 100
    );
  }

  showTopNodes() {
    this.showingAllNodes = false;
    this.topNodes = this.optimizerService.findHighestPredictionNodes(
      this.improvementTree!,
      this.showNumNodes
    );
  }

  showAllNodes() {
    this.showingAllNodes = true;
    this.topNodes = this.optimizerService.findHighestPredictionNodes(
      this.improvementTree!
    );
  }
}
