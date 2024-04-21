import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-analysis-board',
    standalone: true,
    imports: [
        CommonModule,
    ],
    templateUrl: './analysis-board.component.html',
    styleUrl: './analysis-board.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalysisBoardComponent { }
