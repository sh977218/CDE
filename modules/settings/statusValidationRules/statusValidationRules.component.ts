import { HttpClient } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import _noop from 'lodash/noop';

import { OrgHelperService } from 'non-core/orgHelper.service';
import { Organization, StatusValidationRules, StatusValidationRulesOrgs } from 'shared/models.model';
import { MatDialog, MatDialogRef } from '@angular/material';


@Component({
    selector: 'cde-status-validation-rules',
    templateUrl: './statusValidationRules.component.html'
})
export class StatusValidationRulesComponent implements OnInit {
    @ViewChild('removeRuleModal') removeRuleModal!: TemplateRef<any>;
    @ViewChild('addNewRuleModal') addNewRuleModal!: TemplateRef<any>;
    dialogRef?: MatDialogRef<TemplateRef<any>>;
    fields: string[] = [
        'stewardOrg.name'
        , 'properties.key'
        , 'valueDomain.permissibleValues.codeSystemName'
        , 'valueDomain.permissibleValues.permissibleValue'
        , 'valueDomain.permissibleValues.valueMeaningName'
        , 'valueDomain.permissibleValues.valueMeaningCode'
        , 'version'
        , 'ids.version'
        , 'ids.source'
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
    newRule: StatusValidationRules = {id: Math.random(), rule: {}};
    newRuleOrg = '';
    userOrgs: StatusValidationRulesOrgs = {};
    userOrgsArray: string[] = [];

    constructor(
        private http: HttpClient,
        public dialog: MatDialog,
        private orgHelperService: OrgHelperService,
    ) {}

    ngOnInit() {
        this.orgHelperService.then(orgsDetailedInfo => {
            this.orgNames = Object.keys(orgsDetailedInfo);
            Object.keys(orgsDetailedInfo).forEach(orgName => {
                this.userOrgs[orgName] = orgsDetailedInfo[orgName].cdeStatusValidationRules || [];
            });
            this.userOrgsArray = Object.keys(this.userOrgs).sort();
        }, _noop);
    }

    disableRule(orgName: string, rule: StatusValidationRules) {
        // @TODO does not refresh page
       this.dialog.open(this.removeRuleModal).afterClosed().subscribe(res => {
           if (res) {
               this.http.post<Organization>('/disableRule', {orgName: orgName, rule: rule}).subscribe(response => {
                   this.userOrgs[orgName] = response.cdeStatusValidationRules || [];
               });
           }
       }, () => {});
    }

    saveRule() {
        this.http.post<Organization>('/enableRule', {
            orgName: this.newRuleOrg,
            rule: this.newRule
        }).subscribe(response => {
            this.userOrgs[this.newRuleOrg] = response.cdeStatusValidationRules || [];
        }, () => {});
        this.dialogRef!.close();
    }

    openAddRuleModal() {
        this.dialogRef = this.dialog.open(this.addNewRuleModal, {width: '800px'});
    }
}
