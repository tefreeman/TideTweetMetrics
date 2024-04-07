import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatCardModule} from '@angular/material/card';
import { AuthService } from '../auth.service';
import { inject } from '@angular/core';
import { GraphRequest, GraphService } from '../graph/graph.service';
import { DatacardComponent } from './datacard/datacard.component';
interface Card {
  title: string;
  subtitle: string;
  content: string;
  image: string;
}


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatGridListModule, MatCardModule, NgFor, DatacardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent{
  _auth = inject(AuthService);
  _graphService = inject(GraphService);

  graphs: GraphRequest[] = []

  constructor(){
    this.graphs = this._graphService.getGraphRequests();
  }

  tryGetFile(): void {
    this._auth.getChartData();
  }

  test(): void {
    this._graphService.getStatKeys().forEach((stat) => {
      console.log(stat);
    });
  }

}
