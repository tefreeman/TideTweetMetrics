import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MaterialModule } from '../../core/modules/material/material.module';

@Component({
    selector: 'app-add-card',
    standalone: true,
    imports: [
        CommonModule,
        MaterialModule
    ],
    templateUrl: './add-card.component.html',
    styleUrl: './add-card.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddCardComponent { }
