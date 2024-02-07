import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { rolesEnum, User } from 'shared/models.model';
import { CreateUserModalComponent } from 'settings/usersMgt/create-user-modal/create-user-modal.component';
import { tap } from 'rxjs/operators';

type FullUser = User & {
    lastLogin: string;
    knownIPs: string;
    createdDate: Date;
    isLoadingResults?: boolean;
};

@Component({
    selector: 'cde-users-mgt',
    templateUrl: './usersMgt.component.html',
})
export class UsersMgtComponent {
    foundUsers: FullUser[] = [];
    search: { username: User | string } = { username: '' };
    rolesEnum = rolesEnum;
    isLoadingResults = false;

    constructor(
        private alert: AlertService,
        private http: HttpClient,
        public dialog: MatDialog,
        public userService: UserService
    ) {}

    openNewUserModal() {
        this.dialog
            .open(CreateUserModalComponent, { width: '800px' })
            .afterClosed()
            .subscribe(username => {
                if (username) {
                    this.http.post('/server/user/addUser', { username }, { responseType: 'text' }).subscribe(
                        () => this.alert.addAlert('success', 'User created'),
                        () => this.alert.addAlert('danger', 'Cannot create user. Does it already exist?')
                    );
                }
            });
    }

    searchUsers() {
        this.isLoadingResults = true;
        this.http
            .get<FullUser[]>(
                '/server/user/searchUsers/' +
                    ((typeof this.search.username === 'object' && this.search.username.username) ||
                        this.search.username)
            )
            .subscribe({
                next: users => (this.foundUsers = users),
                complete: () => (this.isLoadingResults = false),
            });
    }

    updateAvatar(user: FullUser) {
        user.isLoadingResults = true;
        this.http
            .post('/server/user/updateUserAvatar', user)
            .pipe(
                tap({
                    complete: () => (user.isLoadingResults = false),
                })
            )
            .subscribe(() => this.alert.addAlert('success', 'Saved.'));
    }

    updateRoles(user: User) {
        this.http
            .post('/server/user/updateUserRoles', user)
            .subscribe(() => this.alert.addAlert('success', 'Roles saved.'));
    }
}
