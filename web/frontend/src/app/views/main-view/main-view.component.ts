import { Component } from '@angular/core';
import { HeaderComponent } from "../../shared/header/header.component";
import { DashboardComponent } from "../../dashboard/dashboard.component";
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';
import { RouterLink, RouterOutlet } from '@angular/router';
import { SideNavComponent } from './side-nav/side-nav.component';
import { MatToolbar } from '@angular/material/toolbar';
import { MatNavList } from '@angular/material/list';
import { NgFor } from '@angular/common';


@Component({
    selector: 'app-main-view',
    standalone: true,
    templateUrl: './main-view.component.html',
    styleUrl: './main-view.component.scss',
    imports: [HeaderComponent, RouterLink, DashboardComponent, MatToolbar, MatNavList, NgFor, MatSidenavModule, MatButtonModule, MatTooltipModule, MatIconModule, RouterOutlet, SideNavComponent]
})
export class MainViewComponent {

    public isExpanded = false;

    public toggleMenu() {
      this.isExpanded = !this.isExpanded;
    }
}
