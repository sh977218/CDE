import { Http } from "@angular/http";
import { Component, Inject, OnInit } from "@angular/core";
import "rxjs/add/operator/map";

@Component({
    selector: "cde-list-management",
    templateUrl: "./listManagement.component.html"
})

export class ListManagementComponent implements OnInit {

    orgs: [any];

    constructor(
        private http: Http,
        @Inject("Alert") private Alert,
        @Inject("userResource") private userService,
    ) {
    }

    ngOnInit () {
        this.http.get("/managedOrgs").map(r => r.json()).subscribe(response => {
            this.orgs = response.orgs;
            // $scope.orgNames = $scope.orgs.map(function(o) {return o.name;});
            // $scope.orgs.forEach(function (o) {
            //     if (o.propertyKeys) {
            //         allPropertyKeys = allPropertyKeys.concat(o.propertyKeys);
            //     }
            //     if (o.nameTags) {
            //         allTags = allTags.concat(o.nameTags);
            //     }
            // });
            // allPropertyKeys = allPropertyKeys.filter(function(item, pos, self) {
            //     return self.indexOf(item) === pos;
            // });
            // allTags = allTags.filter(function(item, pos, self) {
            //     return self.indexOf(item) === pos;
            // });
        });
    }


    $scope.addOrgProperty = function(org) {
        $modal.open({
            animation: false,
            templateUrl: '/system/public/html/addValueModal.html',
            controller: function () {}
        }).result.then(function (newValue) {
            org.propertyKeys.push(newValue);
            $scope.updateOrg(org);
        }, function () {});
    };

}