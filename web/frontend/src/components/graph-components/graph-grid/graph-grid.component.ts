import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { AsyncPipe, CommonModule, NgFor, NgStyle } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
  inject,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  Observable,
  Subject,
  Subscription,
  debounceTime,
  fromEvent,
  takeUntil,
} from 'rxjs';
import {
  T_DisplayableDataType,
  T_DisplayableGraph,
  T_GridType,
} from '../../../core/interfaces/displayable-data-interface';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { DisplayRequestManagerService } from '../../../core/services/displayables/display-request-manager.service';
import { DisplayableProviderService } from '../../../core/services/displayables/displayable-provider.service';
import { EditModeService } from '../../../core/services/edit-mode.service';
import { MoveableGridTilesService } from '../../../core/services/moveable-grid-tiles.service';
import { AddGraphDialogComponent } from '../add-graph/add-graph-dialog.component';
import { BarChartComponent } from '../bar-chart/bar-chart.component';
import { GraphCardComponent } from '../graph-card/graph-card.component';

/**
 * Represents the GraphGridComponent which is responsible for displaying a grid of graph cards.
 */
@Component({
  selector: 'app-graph-grid',
  standalone: true,
  imports: [
    NgFor,
    NgStyle,
    BarChartComponent,
    AsyncPipe,
    MaterialModule,
    GraphCardComponent,
    CommonModule,
    CdkDrag,
    CdkDropList,
    AsyncPipe,
    GraphCardComponent,
  ],
  templateUrl: './graph-grid.component.html',
  styleUrl: './graph-grid.component.scss',
})
export class GraphGridComponent implements OnInit, OnDestroy, AfterViewInit {
  /**
   * Represents the QueryList of graph cards.
   */
  @ViewChildren('graphcard', { read: ElementRef }) statCards!: QueryList<any>;

  /**
   * Represents the name of the graph grid.
   */
  @Input({ required: true }) name!: string;

  /**
   * Represents the page of the graph grid.
   */
  @Input({ required: true }) page!: string;

  /**
   * Represents the minimum column size of the graph grid.
   */
  @Input() minColSize!: string;

  /**
   * Represents the maximum column size of the graph grid.
   */
  @Input() maxColSize!: string;

  /**
   * Represents the height of the graph cards.
   */
  @Input() cardHeight!: string;

  /**
   * Represents the maximum width of the graph cards.
   */
  @Input() maxCardWidth!: string;

  /**
   * Represents the EditModeService used for managing the edit mode.
   */
  editModeService: EditModeService = inject(EditModeService);

  /**
   * Represents the DisplayableProviderService used for providing displayable data.
   */
  displayProviderService: DisplayableProviderService = inject(
    DisplayableProviderService
  );

  /**
   * Represents the DisplayRequestManagerService used for managing display requests.
   */
  displayRequestManagerService: DisplayRequestManagerService = inject(
    DisplayRequestManagerService
  );

  /**
   * Represents the MoveableGridTilesService used for managing the grid tiles.
   */
  public dataGrid: MoveableGridTilesService<T_DisplayableGraph>;

  /**
   * Represents the observable for the edit mode.
   */
  public editMode: Observable<boolean> = this.editModeService.getEditMode();

  /**
   * Represents the subject for destroying the component.
   */
  private destroy$: Subject<void>;

  /**
   * Represents the subscription for displayables.
   */
  private subscription: any;

  /**
   * Represents the subscription for stats card changes.
   */
  private statsCardsChangesSub!: Subscription;

  /**
   * Represents the type of the grid.
   */
  private type: T_GridType = 'graph';

  /**
   * Constructs a new instance of the GraphGridComponent.
   * @param cdr - The ChangeDetectorRef used for detecting changes.
   * @param dialog - The MatDialog used for opening dialogs.
   * @param ngZone - The NgZone used for running code outside of Angular's zone.
   */
  constructor(
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    private ngZone: NgZone
  ) {
    this.dataGrid = new MoveableGridTilesService();
    this.destroy$ = new Subject<void>();
  }

  /**
   * Initializes the component.
   */
  ngOnInit() {
    this.subscription = this.displayProviderService
      .getDisplayables(this.page, this.name, this.type)
      .subscribe((data) => {
        this.dataGrid.dataArr = [];

        this.dataGrid.dataArr = [...data] as T_DisplayableGraph[];
        console.log('DATAGRID', this.page, this.name, this.type);
      });

    this.ngZone.runOutsideAngular(() => {
      // Create an observable that listens to the window resize event.
      fromEvent(window, 'resize')
        .pipe(
          debounceTime(300), // Debounce time in ms
          takeUntil(this.destroy$)
        )
        .subscribe((event) => {
          this.ngZone.run(() => {
            this.dataGrid.update(this.statCards);
          });
        });
    });
  }

  /**
   * Cleans up the component.
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();

    if (this.statsCardsChangesSub) {
      this.statsCardsChangesSub.unsubscribe();
    }

    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Runs after the view has been initialized.
   */
  ngAfterViewInit() {
    // Initial subscription
    this.statsCardsChangesSub = this.statCards.changes.subscribe(
      (queryList: QueryList<ElementRef>) => {
        this.dataGrid.update(queryList);

        // keeping views in sync
        this.cdr.detectChanges();
      }
    );

    // Trigger for existing elements
    if (this.statCards.length) {
      this.statCards.notifyOnChanges();
    }
  }

  /**
   * Updates the grid when the window is resized.
   */
  onResize() {
    this.dataGrid.update(this.statCards);
  }

  /**
   * Handles the drop event of a card.
   * @param event - The CdkDragDrop event.
   */
  dropCard(event: CdkDragDrop<any[]>) {
    this.dataGrid.swapClosestElements(event.previousIndex, {
      x: event.dropPoint.x,
      y: event.dropPoint.y,
    });
  }

  /**
   * Checks if the displayable data is a card.
   * @param displayableData - The displayable data.
   * @returns True if the displayable data is a card, false otherwise.
   */
  isCard(displayableData: T_DisplayableDataType): boolean {
    return (
      displayableData.type === 'stat-value' ||
      displayableData.type === 'stat-trend' ||
      displayableData.type === 'stat-comp'
    );
  }

  /**
   * Checks if the displayable data is a graph.
   * @param displayableData - The displayable data.
   * @returns True if the displayable data is a graph, false otherwise.
   */
  isGraph(displayableData: T_DisplayableDataType): boolean {
    return (
      displayableData.type === 'graph-line' ||
      displayableData.type === 'graph-bar'
    );
  }

  /**
   * Gets the container style for the grid.
   * @returns The container style object.
   */
  get containerStyle(): { [key: string]: string } {
    const colWidth = `repeat(auto-fit, minmax(${this.minColSize}, ${this.maxColSize}))`;

    return {
      'grid-template-columns': colWidth,
    };
  }

  /**
   * Opens the graph card dialog.
   */
  openGraphCardDialog() {
    this.editModeService.setEditMode(false);

    const dialogRef = this.dialog.open(AddGraphDialogComponent, {
      height: 'calc(100% - 60px)',
      width: 'calc(100% - 60px)',
      maxWidth: '100%',
      maxHeight: '100%',
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  /**
   * Deletes a card at the specified index.
   * @param i - The index of the card to delete.
   */
  deleteCard(i: number) {
    this.displayRequestManagerService.removeDisplayable(
      this.page,
      this.name,
      this.type,
      i
    );
    this.dataGrid.dataArr = [...this.dataGrid.dataArr]; // Create a new array to trigger change detection
  }
}
