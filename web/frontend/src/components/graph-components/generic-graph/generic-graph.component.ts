import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  ViewChild,
  inject,
} from '@angular/core';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-community';
import { T_DisplayableGraph } from '../../../core/interfaces/displayable-data-interface';
import { GraphMakerService } from '../../../core/services/graph-maker.service';

@Component({
  selector: 'app-generic-graph',
  standalone: true,
  imports: [CommonModule, AgChartsAngular],
  templateUrl: './generic-graph.component.html',
  styleUrl: './generic-graph.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush, // Use onPush change detection strategy
})
export class GenericGraphComponent {
  @Input({ required: true }) displayableData!: T_DisplayableGraph;
  @Input() height: string = '';
  @ViewChild('graphContainer') graphContainer!: ElementRef;

  private graphMakerService: GraphMakerService = inject(GraphMakerService);
  private resizeObserver?: ResizeObserver;
  private debounceTimeout?: any; // Store the timeout to use across calls
  public chartOptions: AgChartOptions = {};

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.chartOptions = this.graphMakerService.createChart(
      this.displayableData
    );
    console.log(this.chartOptions);
  }
  ngAfterViewInit(): void {
    this.adjustChartHeight();
    const resizeObserver = new ResizeObserver((entries) => {
      this.debounce(() => {
        this.adjustChartHeight();
      }, 1000); // Debounce period of 250 milliseconds
    });
    resizeObserver.observe(this.graphContainer.nativeElement);
    this.resizeObserver = resizeObserver;
  }

  adjustChartHeight(): void {
    const width = this.graphContainer.nativeElement.offsetWidth;
    const newHeight = this.calculateHeightFromWidth(width);
    this.chartOptions = { ...this.chartOptions, height: newHeight };
    // You might need to update or redraw your chart based on the new height.
    this.cdr.detectChanges();
  }

  private calculateHeightFromWidth(width: number): number {
    // Implement your logic to calculate height from width. This is just an example.
    return width / (16 / 9); // Example for a 16:9 aspect ratio
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    // Make sure to clear the debounce timeout when component is destroyed
    clearTimeout(this.debounceTimeout);
  }

  private debounce(func: () => void, wait: number): void {
    clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(func, wait);
  }
}
