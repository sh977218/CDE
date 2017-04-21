import { Http } from "@angular/http";
import { Component, Inject } from "@angular/core";
import "rxjs/add/operator/map";
import "rxjs/add/operator/debounceTime";

import { Observable } from "rxjs/Rx";

@Component({
    selector: "cde-org-admin",
    templateUrl: "./orgAdmin.component.html"
})

export class OrgAdminComponent {

    newOrgAdmin: any = {};

    constructor(
        private http: Http,
        @Inject("userResource") private userService,
        @Inject("isAllowedModel") public isAllowedModel
    ) {}

    searchTypeahead = (text$: Observable<string>) =>
        text$.debounceTime(300).distinctUntilChanged().switchMap(term => term.length < 3 ? [] :
            this.http.get("/searchUsers/" + term).map(r => r.json()).map(r => r.users)
                .catch(() => {
                    //noinspection TypeScriptUnresolvedFunction
                    return Observable.of([]);
                })
        )

    getOrgAdmins(): Observable<any[]> {
        if (this.isAllowedModel.isSiteAdmin()) {
            return this.http.get("/orgAdmins").map(r => r.json().orgs);
        } else {
            return this.http.get("/myOrgAdmins").map(r => r.json().orgs);
        }

        // // Retrieve orgs user is admin of
        // $scope.getMyOrgAdmins = function() {
        //     $http.get("/myOrgsAdmins").then(function(response) {
        //         $scope.myOrgAdmins = response.data.orgs;
        //         if ($scope.myOrgAdmins && $scope.myOrgAdmins.length > 0)
        //             $scope.admin.orgName = $scope.myOrgAdmins[0].name;
        //     }, function () {});
        // };
    }

}