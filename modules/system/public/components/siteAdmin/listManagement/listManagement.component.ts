import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { AlertService } from '_app/alert/alert.service';
import { OrgHelperService } from 'core/orgHelper.service';

@Component({
    selector: 'cde-list-management',
    templateUrl: './listManagement.component.html'
})
export class ListManagementComponent implements OnInit {
    orgs: any[];
    allPropertyKeys: String[] = [];
    allTags: String[] = [];
    public options: Select2Options;

    ngOnInit () {
        this.getOrgs();
        this.options = {
            multiple: true,
            tags: true
        };
    }

    constructor(
        private http: HttpClient,
        private Alert: AlertService,
        private orgHelperService: OrgHelperService
    ) {}

    getOrgs () {
        this.http.get<any>('/managedOrgs').subscribe(response => {
            this.orgs = response.orgs;
            this.orgs.forEach(o => {
                if (o.propertyKeys) {
                    this.allPropertyKeys = this.allPropertyKeys.concat(o.propertyKeys);
                    o.currentPropertyKeys = o.propertyKeys.map(r => r);
                }
                if (o.nameTags) {
                    this.allTags = this.allTags.concat(o.nameTags);
                    o.currentTags = o.nameTags.map(r => r);
                }
            });
            this.orgs.sort((a, b) => a.name - b.name);
            this.allPropertyKeys = this.allPropertyKeys.filter((item, pos, self) => self.indexOf(item) === pos);
            this.allTags = this.allTags.filter((item, pos, self) => self.indexOf(item) === pos);
        });
    }

    propsChanged(o, data: {value: string[]}) {
        if (!data.value) data.value = [];
        o.propertyKeys = data.value;
        this.saveOrg(o);
    }

    saveOrg (org) {
        this.http.post('/updateOrg', org).subscribe(() => {
            this.orgHelperService.reload().then(() => this.Alert.addAlert('success', 'Org Updated'));
        }, () => this.Alert.addAlert('danger', 'Error. Unable to save.'));
    }

    tagsChanged(o, data: {value: string[]}) {
        if (!data.value) data.value = [];
        o.nameTags = data.value;
        this.saveOrg(o);
    }
}
