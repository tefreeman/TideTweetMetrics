import { Component } from '@angular/core';
import { HeaderComponent } from "../../shared/header/header.component";
import { DashboardComponent } from "../../dashboard/dashboard.component";
import {MatSidenavModule} from '@angular/material/sidenav';

@Component({
    selector: 'app-main-view',
    standalone: true,
    templateUrl: './main-view.component.html',
    styleUrl: './main-view.component.scss',
    imports: [HeaderComponent, DashboardComponent, MatSidenavModule]
})
export class MainViewComponent {

}
