import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-unauthorized',
    standalone: true,
    imports: [
        CommonModule
    ],
    templateUrl: './unauthorized.component.html',
    styleUrls: ['./unauthorized.component.scss'],  // Note: Corrected 'styleUrl' to 'styleUrls' which should be an array
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnauthorizedComponent {
    constructor(private authService: AuthService) {}

    signout() {
        this.authService.signout();
    }
}
