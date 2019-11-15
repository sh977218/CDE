import { HttpClient } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import _noop from 'lodash/noop';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { Organization, StatusValidationRules, StatusValidationRulesByOrg } from 'shared/models.model';
import { updateTag } from 'shared/system/util';

@Component({
    templateUrl: './statusValidationRules.component.html'
})
export class StatusValidationRulesComponent implements OnInit {
    @ViewChild('removeRuleModal', {static: false}) removeRuleModal!: TemplateRef<any>;
    @ViewChild('addNewRuleModal', {static: false}) addNewRuleModal!: TemplateRef<any>;
    dialogRef!: MatDialogRef<TemplateRef<any>>;
    fields: string[] = [
        'ids.source',
        'ids.version',
        'dataElementConcept.concepts.name',
        'dataElementConcept.concepts.origin',
        'dataElementConcept.concepts.originId',
        'dataElementConcept.conceptualDomain.vsac.id',
        'dataElementConcept.conceptualDomain.vsac.name',
        'dataElementConcept.conceptualDomain.vsac.version',
        'objectClass.concepts.name',
        'objectClass.concepts.origin',
        'objectClass.concepts.originId',
        'origin',
        'properties.key',
        'property.concepts.name',
        'property.concepts.origin',
        'property.concepts.originId',
        'referenceDocuments.document',
        'referenceDocuments.referenceDocumentId',
        'referenceDocuments.title',
        'referenceDocuments.uri',
        'source',
        'stewardOrg.name',
        'valueDomain.datatype',
        'valueDomain.ids.source',
        'valueDomain.ids.id',
        'valueDomain.ids.version',
        'valueDomain.permissibleValues',
        'valueDomain.permissibleValues.codeSystemName',
        'valueDomain.permissibleValues.permissibleValue',
        'valueDomain.permissibleValues.valueMeaningName',
        'valueDomain.permissibleValues.valueMeaningCode',
        'valueDomain.uom',
        'version'
    ];
    newRule: StatusValidationRules = {field: '', id: Math.random(), rule: {}, ruleName: '', targetStatus: 'Incomplete'};
    newRuleCustomValidationPvUmls = false;
    newRuleOrg = '';
    orgNames: string[] = [];
    userOrgs: StatusValidationRulesByOrg = {};
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
               this.http.post<Organization>('/disableRule', {orgName, rule}).subscribe(response => {
                   this.userOrgs[orgName] = response.cdeStatusValidationRules || [];
               });
           }
       }, _noop);
    }

    saveRule() {
        if (this.newRule.field === 'valueDomain.permissibleValues') {
            this.newRule.rule.customValidations = updateTag(this.newRule.rule.customValidations,
                this.newRuleCustomValidationPvUmls, 'permissibleValuesUMLS');
        }
        this.http.post<Organization>('/enableRule', {
            orgName: this.newRuleOrg,
            rule: this.newRule
        }).subscribe(org => {
            this.userOrgs[this.newRuleOrg] = org.cdeStatusValidationRules || [];
        }, () => {});
        this.dialogRef.close();
    }

    openAddRuleModal() {
        this.dialogRef = this.dialog.open(this.addNewRuleModal, {width: '800px'});
    }
}
