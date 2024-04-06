import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { DashboardComponent } from "../dashboard/dashboard.component";

@Component({
    selector: 'app-main-view',
    standalone: true,
    templateUrl: './main-view.component.html',
    styleUrl: './main-view.component.scss',
    imports: [HeaderComponent, DashboardComponent]
})
export class MainViewComponent {

}
