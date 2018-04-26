import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import _noop from 'lodash/noop';

import { OrgHelperService } from 'core/orgHelper.service';


@Component({
    selector: 'cde-status-validation-rules',
    templateUrl: './statusValidationRules.component.html'
})
export class StatusValidationRulesComponent implements OnInit {
    @ViewChild('removeRuleModal') public removeRuleModal: NgbModalModule;
    @ViewChild('addNewRuleModal') public addNewRuleModal: NgbModalModule;
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
    orgNames: string[] = [];
    newRule: any = {id: Math.random(), rule: {}};
    userOrgs: any = {};
    userOrgsArray: string[] = [];

    ngOnInit() {
        this.orgHelperService.then(orgsDetailedInfo => {
            this.orgNames = Object.keys(orgsDetailedInfo);
            Object.keys(orgsDetailedInfo).forEach(orgName => {
                this.userOrgs[orgName] = orgsDetailedInfo[orgName].cdeStatusValidationRules;
            });
            this.userOrgsArray = Object.keys(this.userOrgs).sort();
        }, _noop);
    }

    constructor(
        private http: HttpClient,
        public modalService: NgbModal,
        private orgHelperService: OrgHelperService,
    ) {}

    disableRule(orgName, rule) {
        // @TODO does not refresh page
       this.modalService.open(this.removeRuleModal, {size: 'lg'}).result.then(() => {
           this.http.post<any>('/disableRule', {orgName: orgName, rule: rule}).subscribe(response => {
               this.userOrgs[orgName] = response.cdeStatusValidationRules;
           });
       }, () => {});
    }

    openAddRuleModal() {
        this.modalService.open(this.addNewRuleModal, {size: 'lg'}).result.then(() => {
            this.http.post<any>('/enableRule', {
                orgName: this.newRule.org,
                rule: this.newRule
            }).subscribe(response => {
                this.userOrgs[this.newRule.org] = response.cdeStatusValidationRules;
            }, () => {
            });
        });
    }
}
