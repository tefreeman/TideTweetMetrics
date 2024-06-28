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
  ViewChild,
  ViewChildren,
  inject,
} from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
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
  I_BaseGraphCard,
  T_GridType,
} from '../../../core/interfaces/displayable-data-interface';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { DashboardPageManagerService } from '../../../core/services/dashboard-page-manager.service';
import { DisplayRequestManagerService } from '../../../core/services/displayables/display-request-manager.service';
import { DisplayableProviderService } from '../../../core/services/displayables/displayable-provider.service';
import { EditModeService } from '../../../core/services/edit-mode.service';
import { GridEditModeService } from '../../../core/services/grid-edit-mode.service';
import { MoveableGridTilesService } from '../../../core/services/moveable-grid-tiles.service';
import { AddGraphDialogComponent } from '../add-graph/add-graph-dialog.component';
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

  @ViewChild('holdToDeleteCard', { static: true })
  holdToDeleteCard!: ElementRef;
  /**
   * Represents the EditModeService used for managing the edit mode.
   */

  dashboardPageManagerService: DashboardPageManagerService = inject(
    DashboardPageManagerService
  );
  editModeService: EditModeService = inject(EditModeService);
  gridEditModeService: GridEditModeService = inject(GridEditModeService);
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
  public dataGrid: MoveableGridTilesService<I_BaseGraphCard>;

  /**
   * Represents the observable for the edit mode.
   */
  public editMode: Observable<boolean> = this.editModeService.getEditMode();
  public gridEditMode: Observable<boolean> =
    this.gridEditModeService.getEditMode();
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
   * Represents the boolean for if the delete button is hovered.
   */
  public isDeleteHovered = false;
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

        this.dataGrid.dataArr = [...data] as I_BaseGraphCard[];
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

    dialogRef.afterClosed().subscribe((dataIn: any | null) => {
      // Adjust the type of result as per your actual data structure
      const result = dataIn[0] as any;
      console.log('AFTER CLOSE RESULT', result);
      if (result) {
        const groupId = Timestamp.now().toMillis().toString();
        if (result.metric_names && result.metric_names.length > 0) {
          const newObjects = result.metric_names.map((metricName: any) => {
            // Assuming you want to create new objects that are similar to result but with adjustments
            const newObj = {
              ...result,
              stat_name: metricName,
              groupId: groupId,
              // Ensure we don't perpetuate the metric_names array in the new objects
              metric_names: undefined,
            };
            // Explicitly delete the metric_names array to ensure it's not included
            delete newObj.metric_names;

            // Return the newly formed object
            return newObj;
          });

          this.displayRequestManagerService.addDisplayables(
            newObjects,
            this.type,
            this.page,
            this.name
          );
        } else {
          let out = result;
          if (!Array.isArray(result)) {
            out = [result];
          }
          this.displayRequestManagerService.addDisplayables(
            out,
            this.type,
            this.page,
            this.name
          );
        }
      }

      this.editModeService.setEditMode(false);
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

  triggerHoldEvent(): void {
    console.log('The card was held for 1 second. Triggering event...');
    // Place here the action you want to perform after holding.
  }

  deleteGrid() {
    this.dashboardPageManagerService.deleteGrid$(this.page, this.name);
  }
  onDeleteHover(isHovered: boolean) {
    this.isDeleteHovered = isHovered;
  }
}
