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
  I_BaseMetricCard,
  I_BaseMetricCardWithRequest,
  T_GridType,
} from '../../../core/interfaces/displayable-data-interface';
import { I_DisplayableRequest } from '../../../core/interfaces/displayable-interface';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { DashboardPageManagerService } from '../../../core/services/dashboard-page-manager.service';
import { DisplayRequestManagerService } from '../../../core/services/displayables/display-request-manager.service';
import { DisplayableProviderService } from '../../../core/services/displayables/displayable-provider.service';
import { EditModeService } from '../../../core/services/edit-mode.service';
import { GridEditModeService } from '../../../core/services/grid-edit-mode.service';
import { MoveableGridTilesService } from '../../../core/services/moveable-grid-tiles.service';
import { GraphCardComponent } from '../../graph-components/graph-card/graph-card.component';
import { addStatsDialogComponent } from '../add-stats-dialog/add-stats-dialog.component';
import { StatCardComponent } from '../stat-card/stat-card.component';

/**
 * Represents the CardGridComponent which displays a grid of stat cards.
 */
@Component({
  selector: 'app-card-grid',
  standalone: true,
  imports: [
    NgFor,
    NgStyle,
    StatCardComponent,
    AsyncPipe,
    MaterialModule,
    GraphCardComponent,
    CommonModule,
    CdkDrag,
    CdkDropList,
    AsyncPipe,
  ],
  templateUrl: './card-grid.component.html',
  styleUrl: './card-grid.component.scss',
})
export class CardGridComponent implements OnInit, OnDestroy, AfterViewInit {
  /**
   * The stat cards in the grid.
   */
  @ViewChildren('statcard', { read: ElementRef }) statCards!: QueryList<any>;

  /**
   * The minimum column size of the grid.
   */
  @Input() minColSize!: string;

  /**
   * The maximum column size of the grid.
   */
  @Input() maxColSize!: string;

  /**
   * The maximum width of the cards in the grid.
   */
  @Input() maxCardWidth!: string;

  /**
   * The height of the cards in the grid.
   */
  @Input() cardHeight!: string;

  /**
   * The name of the grid (required).
   */
  @Input({ required: true }) name!: string;

  /**
   * The page of the grid (required).
   */
  @Input({ required: true }) page!: string;

  /**
   * The EditModeService used to manage the edit mode.
   */
  editModeService: EditModeService = inject(EditModeService);
  gridEditModeService: GridEditModeService = inject(GridEditModeService);
  /**
   * The data grid service used to manage the grid tiles.
   */
  public dataGrid: MoveableGridTilesService<I_BaseMetricCard>;

  /**
   * The observable representing the edit mode.
   */
  public editMode: Observable<boolean> = this.editModeService.getEditMode();
  public gridEditMode: Observable<boolean> =
    this.gridEditModeService.getEditMode();
  /**
   * The display provider service used to provide displayables.
   */
  displayProviderService: DisplayableProviderService = inject(
    DisplayableProviderService
  );
  dashboardPageManagerService: DashboardPageManagerService = inject(
    DashboardPageManagerService
  );
  /**
   * The display request manager service used to manage display requests.
   */
  displayRequestManagerService: DisplayRequestManagerService = inject(
    DisplayRequestManagerService
  );

  /**
   * The subject used to unsubscribe from observables.
   */
  private destroy$: Subject<void>;

  /**
   * The subscription used to get displayables.
   */
  private subscription: any;

  /**
   * The subscription used to listen for changes in stat cards.
   */
  private statsCardsChangesSub!: Subscription;

  /**
   * The type of the grid.
   */
  private type: T_GridType = 'metric';

  /**
   * Creates an instance of CardGridComponent.
   * @param cdr - The ChangeDetectorRef used for change detection.
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

        data.forEach((displayable: any) => {
          this.dataGrid.dataArr.push(displayable);
        });
        console.log(this.dataGrid);
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
   * Opens the stat card dialog.
   */
  openStatCardDialog() {
    this.editModeService.setEditMode(false);
    const dialogRef = this.dialog.open(addStatsDialogComponent, {
      data: this.dataGrid.dataArr,
      height: 'calc(100% - 5%)',
      width: 'calc(100% - 5%)',
      maxWidth: '100%',
      maxHeight: '100%',
    });

    dialogRef
      .afterClosed()
      .subscribe((results: I_BaseMetricCardWithRequest[] | null) => {
        if (results) {
          const requests: I_DisplayableRequest[] = [];
          for (const result of results) {
            if (result.request) {
              requests.push(result.request);
            }
          }
          this.displayRequestManagerService.addDisplayables(
            requests,
            this.type,
            this.page,
            this.name
          );
        }
      });

    this.editModeService.setEditMode(false);
  }

  /**
   * Deletes a card from the grid.
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

  /**
   * Gets the height of a card.
   * @param height - The height of the card.
   */
  getHeight(height: string) {}

  deleteGrid() {
    this.dashboardPageManagerService.deleteGrid$(this.page, this.name);
  }
}
