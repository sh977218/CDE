import { Http } from "@angular/http";
import { Component, Inject, ViewChild } from "@angular/core";
import { Select2OptionData } from "ng2-select2";

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
    newUsername: string;
    foundUsers: any[] = [];
    allUsernames: string[] = [];
    rolesEnum: Array<Select2OptionData> = authShared.rolesEnum.map(r => {
        return {"id": r, "text": r};
    });
    s2Options: Select2Options = {
        multiple: true
    };

    searchUsers () {
        this.http.get("/searchUsers/" + this.search.username).map(res => res.json()).subscribe(result => {
            this.foundUsers = result.users;
            // if (this.foundUsers.length === 1) this.user = this.foundUsers[0];
            // else delete this.comments.latestComments;
        });
    }

    updateAvatar (user) {
        this.http.post("/updateUserAvatar", user).subscribe(() => {
            this.Alert.addAlert("success", "Saved.");
        });
    }

    updateTesterStatus (user, newValue) {
        user.tester = newValue;
        this.http.post("/updateTesterStatus", user).subscribe(() => {
            this.Alert.addAlert("success", "Saved.");
        });
    }

    updateRoles (user, data: {value: string[]}) {
        user.roles = data.value;
        this.http.post("/updateUserRoles", user).subscribe(() => {
            this.Alert.addAlert("success", "Roles saved.");
        });
    }

    newUser (username) {
        this.http.put("/user", {username: username}).subscribe(() => this.Alert.addAlert("success", "User created"));
        this.childModal.hide();
    }

    getEltLink (c) {
        return {
                cde: "/deview?tinyId=",
                form: "/formView?tinyId=",
                board: "/board/"
            }[c.element.eltType] + c.element.eltId;
    }
}
