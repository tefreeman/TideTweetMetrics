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
import { T_DisplayableDataType } from '../../core/interfaces/displayable-data-interface';
import { MaterialModule } from '../../core/modules/material/material.module';
import { DisplayRequestManagerService } from '../../core/services/display-request-manager.service';
import { DisplayableProviderService } from '../../core/services/displayable-provider.service';
import { EditModeService } from '../../core/services/edit-mode.service';
import { MoveableGridTilesService } from '../../core/services/moveable-grid-tiles.service';
import { AddGraphComponent } from '../add-graph/add-graph.component';
import { BarChartComponent } from '../bar-chart/bar-chart.component';
import { GraphCardComponent } from '../graph-card/graph-card.component';

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
  @ViewChildren('graphcard', { read: ElementRef }) statCards!: QueryList<any>;
  @Input({ required: true }) name!: string;
  @Input({ required: true }) page!: string;
  @Input() minColSize!: string;
  @Input() maxColSize!: string;
  @Input() cardHeight!: string;
  @Input() maxCardWidth!: string;

  editModeService: EditModeService = inject(EditModeService);
  displayProviderService: DisplayableProviderService = inject(
    DisplayableProviderService
  );
  displayRequestManagerService: DisplayRequestManagerService = inject(
    DisplayRequestManagerService
  );

  public dataGrid: MoveableGridTilesService;
  public editMode: Observable<boolean> = this.editModeService.getEditMode();
  private destroy$: Subject<void>;
  private subscription: any;
  private statsCardsChangesSub!: Subscription;
  private type = 'graph';

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

        this.dataGrid.dataArr = [...data];
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

  isCard(displayableData: T_DisplayableDataType): boolean {
    return (
      displayableData.type === 'stat-value' ||
      displayableData.type === 'stat-trend' ||
      displayableData.type === 'stat-comp'
    );
  }

  isGraph(displayableData: T_DisplayableDataType): boolean {
    return (
      displayableData.type === 'graph-line' ||
      displayableData.type === 'graph-bar'
    );
  }

  get containerStyle(): { [key: string]: string } {
    const colWidth = `repeat(auto-fit, minmax(${this.minColSize}, ${this.maxColSize}))`;

    return {
      'grid-template-columns': colWidth,
    };
  }

  openGraphCardDialog() {
    this.editModeService.setEditMode(false);

    const dialogRef = this.dialog.open(AddGraphComponent, {
      height: 'calc(100% - 60px)',
      width: 'calc(100% - 60px)',
      maxWidth: '100%',
      maxHeight: '100%',
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
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
