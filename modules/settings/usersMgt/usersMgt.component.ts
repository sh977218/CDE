import { HttpClient } from '@angular/common/http';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { rolesEnum, User } from 'shared/models.model';

type FullUser = User & {
    lastLogin: string;
    knownIPs: string;
};

@Component({
    selector: 'cde-users-mgt',
    templateUrl: './usersMgt.component.html'
})
export class UsersMgtComponent {
    @ViewChild('newUserContent', {static: true}) newUserContent!: TemplateRef<any>;
    foundUsers: FullUser[] = [];
    newUsername = '';
    search: {username: User | string} = {username: ''};
    rolesEnum = rolesEnum;

    constructor(private alert: AlertService,
                private http: HttpClient,
                public dialog: MatDialog,
                public userService: UserService) {
    }

    openNewUserModal() {
        this.dialog.open(this.newUserContent, {width: '800px'}).afterClosed().subscribe(res => {
            if (res) {
                this.http.post('/server/user/addUser', {username: this.newUsername}, {responseType: 'text'}).subscribe(
                    () => this.alert.addAlert('success', 'User created'),
                    () => this.alert.addAlert('danger', 'Cannot create user. Does it already exist?')
                );
            }
        });
    }

    searchUsers() {
        this.http.get<FullUser[]>('/server/user/searchUsers/'
            + (typeof(this.search.username) === 'object' && this.search.username.username || this.search.username)
        ).subscribe(users => this.foundUsers = users);
    }

    updateAvatar(user: User) {
        this.http.post('/server/user/updateUserAvatar', user).subscribe(() => this.alert.addAlert('success', 'Saved.'));
    }

    updateRoles(user: User) {
        this.http.post('/server/user/updateUserRoles', user).subscribe(() => this.alert.addAlert('success', 'Roles saved.'));
    }
}
