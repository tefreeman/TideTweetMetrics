import { Component } from '@angular/core';
import { HeaderComponent } from "../../shared/header/header.component";
import { DashboardComponent } from "../../dashboard/dashboard.component";
import { RouterLink, RouterOutlet } from '@angular/router';
import { MaterialModule } from '../../material/material.module';

@Component({
    selector: 'app-main-view',
    standalone: true,
    templateUrl: './main-view.component.html',
    styleUrl: './main-view.component.scss',
    imports: [MaterialModule, RouterLink, RouterOutlet, HeaderComponent, DashboardComponent]
})
export class MainViewComponent {

    public isExpanded = false;

    public toggleMenu() {
      this.isExpanded = !this.isExpanded;
    }
}
