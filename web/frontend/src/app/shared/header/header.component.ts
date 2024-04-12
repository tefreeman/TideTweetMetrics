import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  _auth = inject(AuthService);
  constructor(private router: Router) {}
  logout(): void {
    this._auth.signout();
  }
}
