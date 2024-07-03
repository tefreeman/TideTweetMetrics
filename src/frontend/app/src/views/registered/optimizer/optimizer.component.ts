import { Component, OnInit, inject } from '@angular/core';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormsModule } from '@angular/forms';
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
import { first } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-optimizer',
  standalone: true,
  imports: [
    MaterialModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatExpansionModule,
    MatDatepickerModule,
    NgIf,
    MatIconModule,
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
  selectedTime: string = '';
  photoCount = 0;
  videoCount = 0;
  constructor(private http: HttpClient) {
    this.selectedTime = (() => {
      const currentHour = new Date().getHours();
      return currentHour < 10 ? '0' + currentHour : currentHour.toString();
    })();
  }
  optimizerService: OptimizerService = inject(OptimizerService);
  readonly date = new FormControl(new Date());

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
    // this.optimizerService
    //   .getOptimizeTweet$(payload)
    //   .pipe(first())
    //   .subscribe((result) => {
    //     this.isRunning = false;
    //     this.improvementTree = result;
    //     this.showTopNodes();
    //   });

    this.improvementTree = optimizerData;
    this.isRunning = false;
    this.showTopNodes();
  }

  calc_prediction_improvement(node: TweetNode): number {
    return Math.round(
      ((node.prediction - this.improvementTree!.prediction) /
        this.improvementTree!.prediction) *
        100
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
    console.log('show all nodes', this.topNodes);
    console.log('improvement tree', this.improvementTree);
  }

  showParents(node: TweetNode, i: number) {
    const parents = this.optimizerService
      .findParentNodes(this.improvementTree!, node.text)
      .reverse();

    parents.forEach((parent) => {
      parent.showArrow = true;
    });
    this.topNodes.splice(i + 1, 0, ...parents);
  }
}
