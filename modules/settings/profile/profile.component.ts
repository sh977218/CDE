import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

import { AlertService } from 'alert/alert.service';
import { UserService } from '_app/user.service';
import { User } from 'shared/models.model';

@Component({
    selector: 'cde-profile',
    templateUrl: 'profile.component.html'
})
export class ProfileComponent {
    user?: User;

    constructor(private alert: AlertService,
                private http: HttpClient,
                public userService: UserService) {
        this.reloadUser();
    }


    reloadUser() {
        this.userService.reload();
        this.userService.then(user => this.user = user,
            () => this.alert.addAlert('danger', 'Error, unable to reload'));
    }


    saveProfile() {
        this.http.post('/server/user/', this.user).subscribe(
            () => {
                this.reloadUser();
                this.alert.addAlert('success', 'Saved');
            }, () => this.alert.addAlert('danger', 'Error, unable to save')
        );
    }
}
