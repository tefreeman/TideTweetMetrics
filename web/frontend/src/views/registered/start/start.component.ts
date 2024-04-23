import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MaterialModule } from '../../../core/modules/material/material.module';

/**
 * Represents the StartComponent class.
 * This component is responsible for displaying the start page of the application.
 */
@Component({
    selector: 'app-start',
    standalone: true,
    imports: [
        CommonModule,
        MaterialModule
    ],
    templateUrl: './start.component.html',
    styleUrl: './start.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StartComponent { }
