import { Component, Inject } from "@angular/core";
import { Http } from "@angular/http";
import "rxjs/add/operator/map";

@Component({
    selector: "cde-profile",
    templateUrl: "profile.component.html"
})
export class ProfileComponent {
    cdes: any;
    hasQuota: any;
    orgCurator: string;
    orgAdmin: string;
    user: any;

    constructor(private http: Http,
                @Inject("Alert") private alert,
                @Inject("userResource") private userService,
                @Inject("ViewingHistory") private viewingHistoryService) {
        viewingHistoryService.getViewingHistory();
        viewingHistoryService.getPromise().then((response) => {
            this.cdes = [];
            if (Array.isArray(response))
                this.cdes = response;
        });
        this.reloadUser();
    }

    saveProfile() {
        this.http.post("/user/me", this.user)
            .subscribe(
                (data) => {
                    this.reloadUser();
                    this.alert.addAlert("success", "Saved");
                },
                (err) => this.alert.addAlert("danger", "Error, unable to save")
            );
    }

    reloadUser() {
        this.userService.getRemoteUser();
        this.userService.getPromise().then(() => {
            if (this.userService.user.username) {
                this.hasQuota = this.userService.user.quota;
                this.orgCurator = this.userService.user.orgCurator.toString().replace(/,/g, ", ");
                this.orgAdmin = this.userService.user.orgAdmin.toString().replace(/,/g, ", ");
                this.user = this.userService.user;
            }
        });
    }

    removePublishedForm(pf) {
        this.user.publishedForms = this.user.publishedForms.filter(function (p) {
            return p._id !== pf._id;
        });
        this.saveProfile();
    }
}
