import { Component } from '@angular/core';
import { UserService } from '_app/user.service';
import { User } from 'shared/models.model';
import { isSiteAdmin } from 'shared/system/authorizationShared';

@Component({
    selector: 'cde-profile',
    templateUrl: 'profile.component.html'
})
export class ProfileComponent {
    isSiteAdmin = isSiteAdmin;

    constructor(
        public userService: UserService
    ) {
        this.userService.reload();
    }

    get user(): User | undefined {
        return this.userService.user;
    }
}
