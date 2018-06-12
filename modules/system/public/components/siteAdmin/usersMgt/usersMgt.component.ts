import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { AlertService } from '_app/alert/alert.service';
import { UserService } from '_app/user.service';
import { rolesEnum } from 'shared/system/authorizationShared';


@Component({
    selector: 'cde-users-mgt',
    providers: [NgbActiveModal],
    templateUrl: './usersMgt.component.html'
})
export class UsersMgtComponent {
    @ViewChild('newUserContent') public newUserContent: NgbModalModule;
    foundUsers: any[] = [];
    modalRef: NgbModalRef;
    newUsername: string;
    search: any = {username: ''};
    rolesEnum = rolesEnum;

    constructor(private Alert: AlertService,
                private http: HttpClient,
                public modalService: NgbModal,
                public userService: UserService) {
    }

    addNewUser() {
        this.http.put('/user', {username: this.newUsername}, {responseType: 'text'}).subscribe(
            () => this.Alert.addAlert('success', 'User created'),
            () => this.Alert.addAlert('danger', 'Cannot create user. Does it already exist?')
        );
        this.modalRef.close();
    }

    openNewUserModal() {
        this.modalRef = this.modalService.open(this.newUserContent, {size: 'lg'});
    }

    searchUsers() {
        let uname = this.search.username.username ? this.search.username.username : this.search.username;
        this.http.get<any>('/server/user/searchUsers/' + uname).subscribe(
            result => {
                this.foundUsers = result.users;
            });
    }

    updateAvatar(user) {
        this.http.post('/updateUserAvatar', user).subscribe(
            () => this.Alert.addAlert('success', 'Saved.'));
    }

    updateRoles(user) {
        this.http.post('/updateUserRoles', user)
            .subscribe(() => this.Alert.addAlert('success', 'Roles saved.'));
    }

}
