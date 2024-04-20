import { Component, HostListener, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MaterialModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private _service = inject(AuthService);
  errorMessage = '';

  public cols: number = 2;

  constructor(private router: Router) {
    this.adjustGridColumns(window.innerWidth);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.adjustGridColumns(event.target.innerWidth);
  }

  adjustGridColumns(innerWidth: number) {
    // Example: Switch to 1 column if the width is less than 600px
    this.cols = innerWidth < 600 ? 1 : 2;
  }

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(9),
    ]),
  });

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this._service
        .login(email!, password!)
        .then(() => this.router.navigate(['/dashboard']))
        .catch((error) => {
          console.error('User creation failed!', error);
          this.errorMessage = 'User creation failed! Please try again.';
        });
    } else {
      this.errorMessage = 'Please correct the errors in the form.';
    }
  }
}
