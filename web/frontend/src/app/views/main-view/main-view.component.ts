import { Component } from '@angular/core';
import { HeaderComponent } from "../../shared/header/header.component";
import { DashboardComponent } from "../../dashboard/dashboard.component";
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';

@Component({
    selector: 'app-main-view',
    standalone: true,
    templateUrl: './main-view.component.html',
    styleUrl: './main-view.component.scss',
    imports: [HeaderComponent, DashboardComponent, MatSidenavModule, MatButtonModule, MatTooltipModule, MatIconModule]
})
export class MainViewComponent {

}
