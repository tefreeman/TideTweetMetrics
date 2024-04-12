import { NgFor, NgIf,} from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { inject } from '@angular/core';
import { DatacardComponent } from '../../../data-displays/datacard/datacard.component';
import { BarChartComponent } from '../../../data-displays/graph-card/bar-chart/bar-chart.component';
import { Observable,} from 'rxjs';
import { I_DisplayableData, I_DisplayableRequest } from '../../../core/interfaces/displayable-interface';
import { MetricService } from '../../../core/services/metric.service';
import { DisplayProcessorService } from '../../../core/services/display-processor.service';
import { AsyncPipe } from '@angular/common';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { GraphCardComponent } from '../../../data-displays/graph-card/graph-card.component';
import { DisplayRequestService } from '../../../core/services/display-request.service';
import { MockDataService } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgFor, DatacardComponent, BarChartComponent, AsyncPipe, MaterialModule, GraphCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  providers: [MetricService]
})
export class DashboardComponent implements OnInit, OnDestroy{
  _displayProcessor = inject(DisplayProcessorService);
  displayableDataArr$: Observable<I_DisplayableData[]>;

  constructor(){
    this.displayableDataArr$ = this._displayProcessor.displayables$;
}

  ngOnInit() {
  }

  ngOnDestroy(): void {

  }






}
