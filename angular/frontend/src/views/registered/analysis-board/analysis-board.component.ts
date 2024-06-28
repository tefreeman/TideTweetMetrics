import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Represents the AnalysisBoardComponent.
 */
@Component({
    /**
     * The selector for the AnalysisBoardComponent.
     */
    selector: 'app-analysis-board',
    /**
     * Specifies whether the AnalysisBoardComponent is standalone.
     */
    standalone: true,
    /**
     * The imports for the AnalysisBoardComponent.
     */
    imports: [
        CommonModule,
    ],
    /**
     * The template URL for the AnalysisBoardComponent.
     */
    templateUrl: './analysis-board.component.html',
    /**
     * The style URL for the AnalysisBoardComponent.
     */
    styleUrl: './analysis-board.component.scss',
    /**
     * The change detection strategy for the AnalysisBoardComponent.
     */
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalysisBoardComponent { }
