import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MaterialModule } from '../../../core/modules/material/material.module';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatExpansionModule} from '@angular/material/expansion';
import { AuthService } from '../../../core/services/auth.service';
import { I_UserAndRole } from '../../../core/interfaces/profile-interface';
import { take } from 'rxjs';
import { NgFor, NgIf } from '@angular/common';

@Component({
  standalone: true,
  imports: [MaterialModule, FormsModule, MatFormFieldModule, MatInputModule, MatExpansionModule, NgIf, NgFor],
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  public isAdmin: Boolean = false;
  public usersAndRoles: I_UserAndRole[] = [];

  optInForEmailReports: boolean = false;
  panelOpenState = false;

  profileDocSubscription: any;

  constructor() { }

  ngOnInit() {
    this.authService.isAdmin$().pipe(
      take(1), // This will ensure that the subscription is only active for one value emission.
    ).subscribe((isAdmin) => {
      this.isAdmin = isAdmin;
      if (this.isAdmin) {
        // Call another side effect here
        this.authService.adminGetAllUsersWithRoles$().pipe(
          take(1),
        ).subscribe((usersAndRoles) => {
          this.usersAndRoles = usersAndRoles;
        });
      }
    })

    this. profileDocSubscription = this.authService.getProfileDoc().subscribe((profile) => {
      this.optInForEmailReports = profile?.doWantEmailReports ? profile.doWantEmailReports : false;
    });
  }

  ngOnDestroy(): void {
    this.profileDocSubscription.unsubscribe();
  }
  
  deleteUser(user: I_UserAndRole) {
    const userId = user.uid; // Assuming `uid` is the unique identifier for the user in your I_UserAndRole interface.
    if (!userId) return; // Safety check
  
    this.authService.deleteUserAndProfile$(userId).pipe(
      take(1)
    ).subscribe({
      next: (success) => {
        console.log(`Deletion successful for userId ${userId}`);
        // Filter out the user from the usersAndRoles array
        this.usersAndRoles = this.usersAndRoles.filter(u => u.uid !== userId);
      },
      error: (error) => {
        // Handle any errors here, such as showing an error message to the user
        console.error('Deletion failed', error);
      }
    });
  }

  approveUser(user: I_UserAndRole) {
    const userId = user.uid; // Assuming `uid` is the unique identifier for the user in your I_UserAndRole interface.
    if (!userId) return; // Safety check
  
    this.authService.updateUserRole$(userId).pipe(
      take(1)
    ).subscribe({
      next: (success) => {
        console.log(`allow successful for userId ${userId}`);
        // Filter out the user from the usersAndRoles array
        this.usersAndRoles = this.usersAndRoles.filter(u => u.uid !== userId);
      },
      error: (error) => {
        // Handle any errors here, such as showing an error message to the user
        console.error('allow failed', error);
      }
    });
  }
  resetMyPassword() {
    this.authService.sendPasswordResetEmailCurrentUser().then(() => {
    
    });
  }

  updateEmailReportOptIn(status: boolean) {
    this.authService.setProfileDoc({ doWantEmailReports: status }).subscribe(()=>{});
  }
}
