import { AsyncPipe, CommonModule, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { DashboardPageManagerService } from '../../../core/services/dashboard-page-manager.service';
import { AddGridComponent } from '../add-grid/add-grid.component';
import { DashboardComponent } from '../dashboard/dashboard.component';

/**
 * Represents the StartComponent class.
 * This component is responsible for displaying the start page of the application.
 */
@Component({
  selector: 'app-start',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    RouterLink,
    RouterOutlet,
    DashboardComponent,
    NgFor,
    AsyncPipe,
    NgIf,
    AddGridComponent,
  ],
  templateUrl: './start.component.html',
  styleUrl: './start.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StartComponent {
  dashboardPageManagerService: DashboardPageManagerService = inject(
    DashboardPageManagerService
  );

  constructor(public dialog: MatDialog, private router: Router) {}
  addGrid() {
    const addBoardRef = this.dialog.open(AddGridComponent, {});

    addBoardRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result) {
        if (typeof result['name'] === 'string') {
          if (result['type'] === 'graph' || result['type'] === 'stat') {
            this.dashboardPageManagerService.addNewPage$('home');
            this.dashboardPageManagerService.createAndAddGridToEnd$(
              'home',
              result['name'],
              result['type']
            );
          }
          this.dashboardPageManagerService.savePage();
          this.router.navigate(['/dashboard/home']);
        }
      }
    });
  }
}
