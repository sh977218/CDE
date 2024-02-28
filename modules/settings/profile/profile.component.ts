import { Component } from '@angular/core';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { User } from 'shared/models.model';
import { isSiteAdmin } from 'shared/security/authorizationShared';

@Component({
    selector: 'cde-profile',
    templateUrl: 'profile.component.html',
})
export class ProfileComponent {
    isSiteAdmin = isSiteAdmin;

    constructor(public userService: UserService, private alert: AlertService) {
        this.userService.reload();
    }

    get user(): User | undefined {
        return this.userService.user;
    }

    saveUserEmail(email: string) {
        this.userService.save({ email }).subscribe({
            next: user => {
                this.userService.reloadFrom(user).then(() => {
                    this.alert.addAlert('success', 'Saved');
                });
            },
            error: err => this.alert.httpErrorAlert(err),
        });
    }
}
