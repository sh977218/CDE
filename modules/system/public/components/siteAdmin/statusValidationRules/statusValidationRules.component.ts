import { Http } from "@angular/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import "rxjs/add/operator/map";
import { OrgHelperService } from 'core/public/orgHelper.service';
import { NgbModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: "cde-status-validation-rules",
    templateUrl: "./statusValidationRules.component.html"
})

export class StatusValidationRulesComponent implements OnInit {

    constructor(
        private http: Http,
        private orgHelperService: OrgHelperService,
        public modalService: NgbModal
    ) {}

    @ViewChild("removeRuleModal") public removeRuleModal: NgbModalModule;
    @ViewChild("addNewRuleModal") public addNewRuleModal: NgbModalModule;

    userOrgs: any = {};
    orgNames: string[] = [];
    newRule: any = {id: Math.random(), rule: {}};
    userOrgsArray: string[] = [];
    fields: [string] = [
        'stewardOrg.name'
        , 'properties.key'
        , 'valueDomain.permissibleValues.codeSystemName'
        , 'valueDomain.permissibleValues.permissibleValue'
        , 'valueDomain.permissibleValues.valueMeaningName'
        , 'valueDomain.permissibleValues.valueMeaningCode'
        , 'version'
        , 'ids.version'
        , 'ids.source'
        , 'naming.context.contextName'
        , 'source'
        , 'origin'

        , 'objectClass.concepts.name'
        , 'objectClass.concepts.origin'
        , 'objectClass.concepts.originId'

        , 'property.concepts.name'
        , 'property.concepts.origin'
        , 'property.concepts.originId'

        , 'dataElementConcept.concepts.name'
        , 'dataElementConcept.concepts.origin'
        , 'dataElementConcept.concepts.originId'

        , 'dataElementConcept.conceptualDomain.vsac.id'
        , 'dataElementConcept.conceptualDomain.vsac.name'
        , 'dataElementConcept.conceptualDomain.vsac.version'

        , 'valueDomain.datatype'
        , 'valueDomain.uom'
        , 'valueDomain.ids.source'
        , 'valueDomain.ids.id'
        , 'valueDomain.ids.version'

        , 'referenceDocuments.referenceDocumentId'
        , 'referenceDocuments.document'
        , 'referenceDocuments.uri'
        , 'referenceDocuments.title'
    ];

    ngOnInit () {
        this.orgHelperService.then(() => {
            this.orgNames = Object.keys(this.orgHelperService.orgsDetailedInfo);
            Object.keys(this.orgHelperService.orgsDetailedInfo).forEach(orgName => {
                this.userOrgs[orgName] = this.orgHelperService.orgsDetailedInfo[orgName].cdeStatusValidationRules;
            });
            this.userOrgsArray = Object.keys(this.userOrgs).sort();
        });
    }

    disableRule (orgName, rule) {
        // @TODO does not refresh page
       this.modalService.open(this.removeRuleModal, {size: "lg"}).result.then(() => {
           this.http.post("/disableRule", {orgName: orgName, rule: rule}).map(r => r.json()).subscribe(response => {
               this.userOrgs[orgName] = response.cdeStatusValidationRules;
           });
       }, () => {});
    };

    openAddRuleModal () {
        this.modalService.open(this.addNewRuleModal, {size: "lg"}).result.then(() => {
            this.http.post("/enableRule", {
                orgName: this.newRule.org,
                rule: this.newRule
            }).map(r => r.json()).subscribe(response => {
                this.userOrgs[this.newRule.org] = response.cdeStatusValidationRules;
            }, () => {
            });
        });
    };

}