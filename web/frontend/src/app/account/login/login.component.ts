import { Component, inject} from '@angular/core';
import { AuthService } from '../../auth.service';
import { FormControl, Validators, FormGroup, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButton,
    RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private _service = inject(AuthService);
  errorMessage = '';

  constructor(private router: Router) {}

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(9)]),
  })

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
