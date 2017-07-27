import { Http } from "@angular/http";
import { Component, OnInit } from "@angular/core";
import "rxjs/add/operator/map";
import { AlertService } from "../../alert/alert.service";
import { OrgHelperService } from "../../../../../core/public/orgHelper.service";

@Component({
    selector: "cde-status-validation-rules",
    templateUrl: "./statusValidationRules.component.html"
})

export class StatusValidationRulesComponent implements OnInit {

    constructor(
        private http: Http,
        private Alert: AlertService,
        public orgHelper: OrgHelperService
    ) {}

    userOrgs: any;


    ngOnInit () {
        Object.keys(this.orgHelper.orgsDetailedInfo).forEach(orgName => {
            this.userOrgs[orgName] = this.orgHelper.orgsDetailedInfo[orgName].cdeStatusValidationRules;
        });
    }

    removeRule(o, i) {
        let key = this.userOrgs[o][i].field.replace(/[^\w]/g, "") +
            this.userOrgs[o][i].rule.regex.replace(/[^\w]/g, "");
        this.http.post('/removeRule', {orgName: o, rule: key}).subscribe(() => {});
    };

    ruleEnabled (orgName, rule) {
        return this.userOrgs[orgName].map(rule => rule.id).indexOf(rule.id) > -1;
    };


    disableRule (orgName, rule) {
        // $modal.open({
        //     templateUrl: '/system/public/html/statusRules/removeRule.html',
        //     controller: function () {}
        // }).result.then(function () {
        //     $http.post("/disableRule", {orgName: orgName, rule: rule}).then(function(response){
        //         $scope.userOrgs[orgName] = response.data.cdeStatusValidationRules;
        //     });
        // }, function () {});
    };

    enableRule (orgName, rule) {
        this.http.post("/enableRule", {orgName: orgName, rule: rule}).map(r => r.json()).subscribe(response => {
            this.userOrgs[orgName] = response.cdeStatusValidationRules;
        }, () => {});
    };

    openAddRuleModal () {
        // $modal.open({
        //     animation: false,
        //     templateUrl: '/system/public/html/statusRules/addNewRule.html',
        //     controller: 'AddNewRuleCtrl',
        //     resolve: {
        //         userOrgs: function(){return $scope.userOrgs;}
        //     }
        // }).result.then(function (rule) {
        //     $scope.enableRule(rule.org, rule);
        // }, function () {});
    };

}