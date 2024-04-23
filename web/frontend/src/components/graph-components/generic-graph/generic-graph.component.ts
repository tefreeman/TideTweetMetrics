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

/**
 * Represents the GenericGraphComponent.
 */
@Component({
  selector: 'app-generic-graph',
  standalone: true,
  imports: [CommonModule, AgChartsAngular],
  templateUrl: './generic-graph.component.html',
  styleUrl: './generic-graph.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush, // Use onPush change detection strategy
})
export class GenericGraphComponent {
  /**
   * The displayable data for the graph.
   */
  @Input({ required: true }) displayableData!: T_DisplayableGraph;

  /**
   * The height of the graph.
   */
  @Input() height: string = '';

  /**
   * The reference to the graph container element.
   */
  @ViewChild('graphContainer') graphContainer!: ElementRef;

  private graphMakerService: GraphMakerService = inject(GraphMakerService);
  private resizeObserver?: ResizeObserver;
  private debounceTimeout?: any; // Store the timeout to use across calls

  /**
   * The chart options for the graph.
   */
  public chartOptions: AgChartOptions = {};

  constructor(private cdr: ChangeDetectorRef) { }

  /**
   * Initializes the component.
   */
  ngOnInit(): void {
    this.chartOptions = this.graphMakerService.createChart(
      this.displayableData
    );
    console.log(this.chartOptions);
  }

  /**
   * Performs additional initialization after the view has been initialized.
   */
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

  /**
   * Adjusts the height of the chart based on the width of the graph container.
   */
  adjustChartHeight(): void {
    const width = this.graphContainer.nativeElement.offsetWidth;
    const newHeight = this.calculateHeightFromWidth(width);
    this.chartOptions = { ...this.chartOptions, height: newHeight };
    // You might need to update or redraw your chart based on the new height.
    this.cdr.detectChanges();
  }

  /**
   * Calculates the height of the chart based on the width of the graph container.
   * @param width - The width of the graph container.
   * @returns The calculated height of the chart.
   */
  private calculateHeightFromWidth(width: number): number {
    // Implement your logic to calculate height from width. This is just an example.
    return width / (16 / 9); // Example for a 16:9 aspect ratio
  }

  /**
   * Cleans up resources before the component is destroyed.
   */
  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    // Make sure to clear the debounce timeout when component is destroyed
    clearTimeout(this.debounceTimeout);
  }

  /**
   * Executes a function after a specified delay.
   * @param func - The function to execute.
   * @param wait - The delay in milliseconds.
   */
  private debounce(func: () => void, wait: number): void {
    clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(func, wait);
  }
}
