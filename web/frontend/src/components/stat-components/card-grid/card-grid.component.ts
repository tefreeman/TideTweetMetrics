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
  T_DisplayableStat,
  T_GridType,
} from '../../../core/interfaces/displayable-data-interface';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { DisplayRequestManagerService } from '../../../core/services/displayables/display-request-manager.service';
import { DisplayableProviderService } from '../../../core/services/displayables/displayable-provider.service';
import { EditModeService } from '../../../core/services/edit-mode.service';
import { MoveableGridTilesService } from '../../../core/services/moveable-grid-tiles.service';
import { BarChartComponent } from '../../graph-components/bar-chart/bar-chart.component';
import { GraphCardComponent } from '../../graph-components/graph-card/graph-card.component';
import { addStatsDialogComponent } from '../add-stats-dialog/add-stats-dialog.component';
import { StatCardComponent } from '../stat-card/stat-card.component';

@Component({
  selector: 'app-card-grid',
  standalone: true,
  imports: [
    NgFor,
    NgStyle,
    StatCardComponent,
    BarChartComponent,
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
  @ViewChildren('statcard', { read: ElementRef }) statCards!: QueryList<any>;
  @Input() minColSize!: string;
  @Input() maxColSize!: string;
  @Input() maxCardWidth!: string;
  @Input() cardHeight!: string;
  @Input({ required: true }) name!: string;
  @Input({ required: true }) page!: string;

  editModeService: EditModeService = inject(EditModeService);

  public dataGrid: MoveableGridTilesService<T_DisplayableStat>;
  public editMode: Observable<boolean> = this.editModeService.getEditMode();
  displayProviderService: DisplayableProviderService = inject(
    DisplayableProviderService
  );
  displayRequestManagerService: DisplayRequestManagerService = inject(
    DisplayRequestManagerService
  );
  private destroy$: Subject<void>;
  private subscription: any;
  private statsCardsChangesSub!: Subscription;
  private type: T_GridType = 'stat';
  constructor(
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    private ngZone: NgZone
  ) {
    this.dataGrid = new MoveableGridTilesService();
    this.destroy$ = new Subject<void>();
  }

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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();

    if (this.statsCardsChangesSub) {
      this.statsCardsChangesSub.unsubscribe();
    }

    this.destroy$.next();
    this.destroy$.complete();
  }

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

  onResize() {
    this.dataGrid.update(this.statCards);
  }

  dropCard(event: CdkDragDrop<any[]>) {
    this.dataGrid.swapClosestElements(event.previousIndex, {
      x: event.dropPoint.x,
      y: event.dropPoint.y,
    });
  }

  get containerStyle(): { [key: string]: string } {
    const colWidth = `repeat(auto-fit, minmax(${this.minColSize}, ${this.maxColSize}))`;

    return {
      'grid-template-columns': colWidth,
    };
  }

  openStatCardDialog() {
    this.editModeService.setEditMode(false);
    const dialogRef = this.dialog.open(addStatsDialogComponent, {
      data: this.dataGrid.dataArr,
      height: 'calc(100% - 5%)',
      width: 'calc(100% - 5%)',
      maxWidth: '100%',
      maxHeight: '100%',
    });

    dialogRef.afterClosed().subscribe((result: T_DisplayableStat[]) => {
      this.displayRequestManagerService.addDisplayables(
        result,
        this.type,
        this.page,
        this.name
      );
    });
  }

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
