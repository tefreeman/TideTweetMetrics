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
  readonly date = new FormControl(new Date());
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
  ngOnInit() {}

  getTimeString() {
    // Combine date and selectedTime
    const datePart = this.date.value;
    const timePart = this.selectedTime;

    if (!datePart || !timePart) return '2024-06-26T06:34:56.000Z';
    // Ensure date and time are in proper format
    let year = datePart.getFullYear();
    let month = (datePart.getMonth() + 1).toString().padStart(2, '0'); // getMonth is zero-indexed
    let day = datePart.getDate().toString().padStart(2, '0');
    let hours = timePart.slice(0, 2).padStart(2, '0');
    let minutes = timePart.slice(3, 5).padStart(2, '0');
    let seconds = timePart.slice(6, 8).padStart(2, '0'); // assuming format is HH:mm:ss

    // Create ISO 8601 date string
    const timeString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
    console.log(timeString);
    return timeString;
  }
  submitTweet() {
    const payload: TweetPayload = {
      text: this.inputTweetText,
      author_id: 'alabama_cs',
      created_at: this.getTimeString(),
      photo_count: Number(this.photoCount),
      video_count: Number(this.videoCount),
    };
    this.isRunning = true;
    this.optimizerService
      .getOptimizeTweet$(payload)
      .pipe(first())
      .subscribe((result) => {
        this.isRunning = false;
        this.improvementTree = result;
        this.showTopNodes();
      });
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
