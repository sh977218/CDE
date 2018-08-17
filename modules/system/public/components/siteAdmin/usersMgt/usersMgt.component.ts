import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { AlertService } from '_app/alert.service';
import { UserService } from '_app/user.service';
import { User } from 'shared/models.model';
import { rolesEnum } from 'shared/system/authorizationShared';


@Component({
    selector: 'cde-users-mgt',
    providers: [NgbActiveModal],
    templateUrl: './usersMgt.component.html'
})
export class UsersMgtComponent {
    @ViewChild('newUserContent') newUserContent!: NgbModalModule;
    foundUsers: any[] = [];
    modalRef?: NgbModalRef;
    newUsername = '';
    search: any = {username: ''};
    rolesEnum = rolesEnum;

    constructor(private Alert: AlertService,
                private http: HttpClient,
                public modalService: NgbModal,
                public userService: UserService) {
    }

    addNewUser() {
        this.http.post('/server/user/addUser', {username: this.newUsername}, {responseType: 'text'}).subscribe(
            () => this.Alert.addAlert('success', 'User created'),
            () => this.Alert.addAlert('danger', 'Cannot create user. Does it already exist?')
        );
        this.modalRef!.close();
    }

    openNewUserModal() {
        this.modalRef = this.modalService.open(this.newUserContent, {size: 'lg'});
    }

    searchUsers() {
        let uname = this.search.username.username ? this.search.username.username : this.search.username;
        this.http.get<User[]>('/server/user/searchUsers/' + uname).subscribe(users => this.foundUsers = users);
    }

    updateAvatar(user: User) {
        this.http.post('/updateUserAvatar', user).subscribe(() => this.Alert.addAlert('success', 'Saved.'));
    }

    updateRoles(user: User) {
        this.http.post('/updateUserRoles', user).subscribe(() => this.Alert.addAlert('success', 'Roles saved.'));
    }
}
