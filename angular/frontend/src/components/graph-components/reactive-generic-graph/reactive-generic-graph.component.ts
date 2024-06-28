import { AsyncPipe, CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-community';
import { Observable, Subscription, debounceTime, fromEvent } from 'rxjs';
import { I_BaseGraphCard } from '../../../core/interfaces/displayable-data-interface';
import { GraphMakerService } from '../../../core/services/graph-maker.service';
@Component({
  selector: 'app-reactive-generic-graph',
  standalone: true,
  imports: [CommonModule, AgChartsAngular, AsyncPipe],
  templateUrl: './reactive-generic-graph.component.html',
  styleUrl: './reactive-generic-graph.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReactiveGenericGraphComponent
  implements OnInit, OnDestroy, AfterViewChecked
{
  @Input({ required: true }) displayableData!: Observable<I_BaseGraphCard[]>;
  @ViewChild('graphContainer') graphContainer!: ElementRef;

  private graphMakerService: GraphMakerService = inject(GraphMakerService);
  private resizeSubscription!: Subscription;
  public chartOptions: AgChartOptions = {};
  public sub: Subscription | undefined;
  public hideGraph = true;
  public chartHeight = '';
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  constructor() {}
  ngOnInit(): void {
    this.sub = this.displayableData.subscribe((data) => {
      const result = this.graphMakerService.createChart(data[0]);
      if (result) {
        this.chartOptions = result;
        this.hideGraph = false;
      } else {
        this.hideGraph = true;
        this.chartOptions = {};
      }
      this.cdr.detectChanges(); // Manually trigger change detection
    });

    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(debounceTime(300)) // Debounce resize events
      .subscribe(() => {
        this.updateChartHeight();
        this.cdr.detectChanges(); // Manually trigger change detection after resize
      });
  }
  ngAfterViewChecked(): void {
    this.updateChartHeight();
    this.cdr.detectChanges();
  }
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.resizeSubscription.unsubscribe();
  }

  updateChartHeight(): void {
    if (this.graphContainer) {
      const height = Math.min(
        this.graphContainer.nativeElement.offsetWidth,
        window.innerHeight * 0.7
      );
      this.chartHeight = `${height * 0.8}px`;
    }
  }
}
