import { Component, HostListener, inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { AuthService } from '../../../core/services/auth.service';
/**
 * Represents the RegisterComponent class.
 * This component is responsible for handling the registration functionality.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  private _service = inject(AuthService);
  public cols: number = 2;

  /**
   * Constructs a new instance of the RegisterComponent class.
   * @param router - The router service.
   */
  constructor(private router: Router) {
    this.adjustGridColumns(window.innerWidth);
  }

  /**
   * Event listener for window resize event.
   * @param event - The resize event object.
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.adjustGridColumns(event.target.innerWidth);
  }

  /**
   * Adjusts the number of grid columns based on the window width.
   * @param innerWidth - The inner width of the window.
   */
  adjustGridColumns(innerWidth: number) {
    // Example: Switch to 1 column if the width is less than 600px
    this.cols = innerWidth < 600 ? 1 : 2;
  }

  /**
   * Custom validator function to ensure that the two password fields match.
   * @param group - The form control group.
   * @returns An object with the validation error if the passwords do not match, otherwise null.
   */
  passwordsMatchValidator: ValidatorFn = (
    group: AbstractControl<any, any>
  ): ValidationErrors | null => {
    const password1 = group.get('password1')!.value;
    const password2 = group.get('password2')!.value;
    return password1 === password2 ? null : { notMatching: true };
  };

  /**
   * Represents the signup form.
   */
  signupForm = new FormGroup(
    {
      email: new FormControl('', [Validators.required, Validators.email]),
      password1: new FormControl('', [
        Validators.required,
        Validators.minLength(9),
      ]),
      password2: new FormControl('', [
        Validators.required,
        Validators.minLength(9),
      ]),
    },
    { validators: this.passwordsMatchValidator }
  );

  /**
   * Represents the error message.
   */
  errorMessage = '';

  /**
   * Handles the form submission.
   * If the form is valid, it calls the signup method of the AuthService and navigates to the home page.
   * If the form is invalid, it sets the error message.
   */
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
