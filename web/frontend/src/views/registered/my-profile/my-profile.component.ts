import { NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs';
import { I_UserAndRole } from '../../../core/interfaces/profile-interface';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Represents the MyProfileComponent class.
 * This component is responsible for managing the user's profile information and actions.
 */
@Component({
  standalone: true,
  imports: [
    MaterialModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatExpansionModule,
    NgIf,
    NgFor,
  ],
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss'],
})
export class MyProfileComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  public isAdmin: Boolean = false;
  public usersAndRoles: I_UserAndRole[] = [];
  public userCollege = this.authService.userCollege;
  public defaultValue = this.userCollege;
  /**
   * Represents the opt-in status for email reports.
   */
  optInForEmailReports: boolean = false;
  panelOpenState = false;
  profileDocSubscription: any;
  waitingOnAction = false;
  constructor(private snackBar: MatSnackBar) {}

  /**
   * Initializes the component.
   * - Checks if the user is an admin and retrieves the list of users with roles if so.
   * - Subscribes to the profile document to get the opt-in status for email reports.
   */
  ngOnInit() {
    this.authService
      .isAdmin$()
      .pipe(
        take(1) // This will ensure that the subscription is only active for one value emission.
      )
      .subscribe((isAdmin) => {
        this.isAdmin = isAdmin;
        if (this.isAdmin) {
          // Call another side effect here
          this.authService
            .adminGetAllUsersWithRoles$()
            .pipe(take(1))
            .subscribe((usersAndRoles) => {
              this.usersAndRoles = usersAndRoles;
            });
        }
      });

    this.profileDocSubscription = this.authService
      .getProfileDoc()
      .subscribe((profile) => {
        this.optInForEmailReports = profile?.doWantEmailReports
          ? profile.doWantEmailReports
          : false;
      });
  }
  /**
   * Cleans up the component.
   * Unsubscribes from the profile document subscription.
   */
  ngOnDestroy(): void {
    this.profileDocSubscription.unsubscribe();
  }

  /**
   * Deletes a user and their profile.
   * @param user - The user to be deleted.
   */
  deleteUser(user: I_UserAndRole) {
    const userId = user.uid; // Assuming `uid` is the unique identifier for the user in your I_UserAndRole interface.
    if (!userId) return; // Safety check
    this.waitingOnAction = true;
    this.authService
      .deleteUserAndProfile$(userId)
      .pipe(take(1))
      .subscribe({
        next: (success) => {
          console.log(`Deletion successful for userId ${userId}`);
          // Filter out the user from the usersAndRoles array
          const message = `${user.email} has been removed.`; // Customize this message as needed.
          this.openSnackBar(message);
          this.usersAndRoles = this.usersAndRoles.filter(
            (u) => u.uid !== userId
          );
          this.waitingOnAction = false;
        },
        error: (error) => {
          // Handle any errors here, such as showing an error message to the user
          console.error('Deletion failed', error);
          this.openSnackBar(`Failed to remove ${user.email}.`);
          this.waitingOnAction = false;
        },
      });
  }

  /**
   * Approves a user.
   * @param user - The user to be approved.
   */
  approveUser(user: I_UserAndRole) {
    const userId = user.uid;
    if (!userId) return; // Safety check
    this.waitingOnAction = true;

    this.authService
      .updateUserRole$(userId)
      .pipe(take(1))
      .subscribe({
        next: (success) => {
          console.log(`allow successful for userId ${user.email}`);
          const message = `${user.email} has been approved.`; // Customize this message as needed.
          this.openSnackBar(message);
          // Filter out the user from the usersAndRoles array
          this.usersAndRoles = this.usersAndRoles.filter(
            (u) => u.uid !== userId
          );
          this.waitingOnAction = false;
        },
        error: (error) => {
          // Handle any errors here, such as showing an error message to the user
          console.error('allow failed', error);
          this.openSnackBar(`Failed to allow ${user.email}.`);
          this.waitingOnAction = false;
        },
      });
  }

  /**
   * Sends a password reset email to the current user.
   */
  resetMyPassword() {
    this.authService.sendPasswordResetEmailCurrentUser().then(() => {});
    this.openSnackBar('Password reset email sent.');
  }

  /**
   * Updates the opt-in status for email reports.
   * @param status - The new opt-in status.
   */
  updateEmailReportOptIn(status: boolean) {
    this.authService
      .setProfileDoc({ doWantEmailReports: status })
      .subscribe(() => {});
    const message = status
      ? 'Opted in for email reports.'
      : 'Opted out of email reports.';
    this.openSnackBar(message);
  }

  updateTwitterCollege() {
    // Assuming 'setProfileDoc' method can accept partial update objects
    this.authService
      .setProfileDoc({ userCollege: this.userCollege })
      .subscribe({
        next: () => {
          // Handle success, maybe showing a success message
          const message = `College updated to ${this.userCollege}.`;
          this.openSnackBar(message);
        },
        error: (error) => {
          // Handle any errors that occur during the update
          console.error('Error updating college: ', error);
          this.openSnackBar('Error updating college. Please try again.');
        },
      });
  }
  /**
   * Opens a snackbar with the given message.
   * @param message - The message to be displayed in the snackbar.
   */
  openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000, // Duration in milliseconds after which the snackbar will auto-dismiss.
      horizontalPosition: 'center', // Change as needed.
      verticalPosition: 'bottom', // Change as needed.
    });
  }
}
