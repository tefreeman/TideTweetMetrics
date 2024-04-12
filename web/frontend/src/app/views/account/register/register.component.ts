import { Component, HostListener, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { FormControl, Validators, FormGroup, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule, MatCardTitle } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { MaterialModule } from '../../../material/material.module';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private _service = inject(AuthService);
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
  // Define a custom validator to ensure that the two password fields match
  passwordsMatchValidator: ValidatorFn = (group: AbstractControl<any, any>): ValidationErrors | null => {
    const password1 = group.get('password1')!.value;
    const password2 = group.get('password2')!.value;
    return password1 === password2 ? null : { notMatching: true };
  }


  signupForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password1: new FormControl('', [Validators.required, Validators.minLength(9)]),
    password2: new FormControl('', [Validators.required, Validators.minLength(9)]),
  }, { validators: this.passwordsMatchValidator });

  errorMessage = '';


  onSubmit(): void {
    if (this.signupForm.valid) {
      const { email, password1 } = this.signupForm.value;
      this._service
        .signup(email!, password1!)
        .then(() => this.router.navigate(['/']))
        .catch((error) => {
          console.error('Login Failed', error);
          this.errorMessage = 'User creation failed! Please try again.';
        });
    } else {
      this.errorMessage = 'Please correct the errors in the form.';
    }
  }
}
