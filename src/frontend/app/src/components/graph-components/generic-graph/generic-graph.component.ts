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
import { I_BaseGraphCard } from '../../../core/interfaces/displayable-data-interface';
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
  @Input({ required: true }) displayableData!: I_BaseGraphCard;

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

  constructor(private cdr: ChangeDetectorRef) {}

  /**
   * Initializes the component.
   */
  ngOnInit(): void {
    const result = this.graphMakerService.createChart(this.displayableData);
    if (result) {
      this.chartOptions = result;
    } else {
      console.warn('Failed to create chart in GenericGraphComponent');
    }
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
    const height = this.graphContainer.nativeElement.offsetWidth;
    const newHeight = this.calculateGraphHeight(width);
    this.chartOptions = { ...this.chartOptions, height: newHeight };
    // You might need to update or redraw your chart based on the new height.
    this.cdr.detectChanges();
  }

  /**
   * Calculates the height of the chart based on the width of the graph container.
   * @param width - The width of the graph container.
   * @returns The calculated height of the chart.
   */
  calculateGraphHeight(width: number) {
    const minHeight = 200;
    let maxHeight = window.innerHeight - 60;

    const screenRatio = window.innerWidth / window.innerHeight;
    console.log('Screen ratio:', screenRatio);

    // Initial ideal height ratio assumptions
    let idealHeightRatio = 0.6; // Default for standard screens in landscape

    if (screenRatio < 1) {
      // Portrait mode adjustment
      const screenHeight = window.innerHeight;
      const baseScreenHeight = 400;
      const extendedScreenHeight = 800;
      const minRatio = 0.75;
      const maxRatio = 1; // More vertical space in portrait

      if (screenHeight <= baseScreenHeight) {
        idealHeightRatio = minRatio;
      } else if (screenHeight >= extendedScreenHeight) {
        idealHeightRatio = maxRatio;
      } else {
        // Smooth transition between minRatio and maxRatio for mid-sized screens
        const ratioDelta = maxRatio - minRatio;
        const screenDelta = screenHeight - baseScreenHeight;
        const totalDelta = extendedScreenHeight - baseScreenHeight;
        idealHeightRatio = minRatio + (ratioDelta * screenDelta) / totalDelta;
      }
    } else {
      // Landscape mode adjustment
      // Handles exceptionally tall and narrow screens in landscape
      const screenHeight = window.innerHeight;
      const minWidthHeightRatio = 1.2; // Minimum width:height aspect ratio to adjust height for
      if (screenRatio < minWidthHeightRatio) {
        // If the screen is tall and relatively narrow, adjust the height ratio upward
        const maxLandscapeRatio = 0.8; // Allow for more vertical space usage
        idealHeightRatio =
          0.6 +
          (maxLandscapeRatio - 0.6) *
            ((minWidthHeightRatio - screenRatio) / (minWidthHeightRatio - 1));
      }
      // No further adjustment for wide screens; default ratio used
    }

    let graphHeight = width * idealHeightRatio;
    graphHeight = Math.max(minHeight, Math.min(maxHeight, graphHeight));

    return graphHeight;
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
