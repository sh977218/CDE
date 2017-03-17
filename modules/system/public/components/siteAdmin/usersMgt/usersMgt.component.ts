import { Http } from "@angular/http";
import { Component, Inject, ViewChild } from "@angular/core";
import { ModalDirective } from "ng2-bootstrap/modal";

import "rxjs/add/operator/map";

import * as authShared from "../../../../shared/authorizationShared";

@Component({
    selector: "cde-users-mgt",
    templateUrl: "./usersMgt.component.html"
})

export class UsersMgtComponent {

    @ViewChild("childModal") public childModal: ModalDirective;

    constructor(private http: Http, @Inject ("Alert") private Alert,
        @Inject ("AccountManagement") private AccountManagement) {

        this.AccountManagement.getAllUsernames(usernames => {
            this.allUsernames = usernames.map(u => u.username);
        });
    }

    search: any = {username: ""};
    foundUsers: any[] = [];
    allUsernames: string[] = [];
    comments: any = {currentCommentsPage: 1, totalItems: 10000};
    rolesEnum: any = authShared.rolesEnum;

    searchUsers () {
        this.http.get("/searchUsers/" + this.search.username).map(res => res.json()).subscribe(result => {
            this.foundUsers = result.users;
            if (this.foundUsers.length === 1) this.getComments(1);
            else delete this.comments.latestComments;
        });
    }

    updateAvatar (user) {
        this.http.post("/updateUserAvatar", user).subscribe(() => {
            this.Alert.addAlert("success", "Saved.");
        });
    }

    updateTesterStatus (user) {
        this.http.post("/updateTesterStatus", user).subscribe(() => {
            this.Alert.addAlert("success", "Saved.");
        });
    }

    updateRoles (user) {
        this.http.post("/updateUserRoles", user).subscribe(() => {
            this.Alert.addAlert("success", "Roles saved.");
        });
    }

    newUser (username) {
        this.http.put("/user", {username: username}).subscribe(() => this.Alert.addAlert("success", "User created"));
        this.childModal.hide();
    };

    getComments (page) {
        if (this.foundUsers && this.foundUsers[0]) {
            this.http.get("/commentsFor/" + this.foundUsers[0].username + "/" + (page - 1) * 30 + "/30")
                .map(res => res.json())
                .subscribe(result => {
                    this.comments.latestComments = result;
                    if (this.comments.latestComments.length === 0) {
                        this.comments.totalItems = (page - 2) * 30;
                    } else if (this.comments.latestComments.length < 30) {
                        this.comments.totalItems = (page - 1) * 30 + this.comments.latestComments.length;
                    }
            });
        }
    };

//     $scope.$watch("comments.currentCommentsPage", function () {
//         $scope.getComments($scope.comments.currentCommentsPage);
// }   );

    getEltLink (c) {
        return {
                'cde': "/deview?tinyId=",
                'form': "/formView?tinyId=",
                'board': "/board/"
            }[c.element.eltType] + c.element.eltId;
    }
}
