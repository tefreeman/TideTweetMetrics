import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-unauthorized',
    standalone: true,
    imports: [
        CommonModule,
    ],
    template: `<p>Please ask the admin to authorize you</p>`,
    styleUrl: './unauthorized.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnauthorizedComponent { }
