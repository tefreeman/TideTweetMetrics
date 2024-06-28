import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

/**
 * Represents the UnauthorizedComponent.
 */
@Component({
    selector: 'app-unauthorized',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
    ],
    templateUrl: './unauthorized.component.html',
    styleUrls: ['./unauthorized.component.scss'],  // Note: Corrected 'styleUrl' to 'styleUrls' which should be an array
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnauthorizedComponent {
    constructor(private authService: AuthService) { }

    /**
     * Signs out the user.
     */
    signout() {
        this.authService.signout();
    }

    /**
     * Navigates to the home page.
     */
    goHome() {
        this.authService.goHome();
    }
}
