import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { AlertService } from '_app/alert.service';
import { OrgHelperService } from 'core/orgHelper.service';
import { Organization } from 'shared/models.model';
import { ENTER } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent, MatChipInputEvent } from '@angular/material';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';


@Component({
    selector: 'cde-list-management',
    templateUrl: './listManagement.component.html'
})
export class ListManagementComponent implements OnInit {
    orgs?: any[];
    allPropertyKeys: string[] = [];
    allTags: string[] = [];
    readonly separatorKeysCodes: number[] = [ENTER];
    pkControl = new FormControl();
    tagControl = new FormControl();
    filteredPropertyKeys: Observable<string[]>;
    filteredTags: Observable<string[]>;
    @ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;

    constructor(private http: HttpClient,
                private Alert: AlertService,
                private orgHelperService: OrgHelperService) {
    }

    ngOnInit() {
        this.getOrgs();

        this.filteredPropertyKeys = this.pkControl.valueChanges
            .pipe(
                startWith(''),
                map(value => this._filter(this.allPropertyKeys, value))
            );

        this.filteredTags = this.tagControl.valueChanges
            .pipe(
                startWith(''),
                map(value => this._filter(this.allTags, value))
            );
    }

    _filter (options: string[], value: string): string[] {
        if (!value) return [];
        return options.filter(option => option.toLowerCase().includes(value.toLowerCase()));
    }

    getOrgs() {
        this.http.get<Organization[]>('/managedOrgs').subscribe(orgs => {
            this.orgs = orgs;
            this.orgs.forEach(o => {
                if (o.propertyKeys) {
                    this.allPropertyKeys = this.allPropertyKeys.concat(o.propertyKeys);
                }
                if (o.nameTags) {
                    this.allTags = this.allTags.concat(o.nameTags);
                }
            });
            this.orgs.sort((a, b) => a.name - b.name);
            this.allPropertyKeys = this.allPropertyKeys.filter((item, pos, self) => self.indexOf(item) === pos);
            this.allTags = this.allTags.filter((item, pos, self) => self.indexOf(item) === pos);
        });
    }

    removePropertyKey (org: Organization, key: string) {
        org.propertyKeys.splice(org.propertyKeys.indexOf(key), 1);
        this.saveOrg(org);
    }

    removeTag (org: Organization, key: string) {
        org.nameTags.splice(org.nameTags.indexOf(key), 1);
        this.saveOrg(org);
    }

    saveOrg(org: Organization) {
        this.http.post('/updateOrg', org)
            .subscribe(() => this.orgHelperService.reload().then(() => this.Alert.addAlert('success', 'Org Updated')),
                () => this.Alert.addAlert('danger', 'Error. Unable to save.'));
    }

    addPropertyKey(org: Organization, key: MatChipInputEvent) {
        org.propertyKeys.push(key.value);
        if (key.input) key.input.value = '';
        this.saveOrg(org);
    }

    autoSelectedPk(org: Organization, key: MatAutocompleteSelectedEvent) {
        org.propertyKeys.push(key.option.viewValue);
        this.pkControl.setValue(null);
        this.saveOrg(org);
    }

    addTag(org: Organization, key: MatChipInputEvent) {
        org.nameTags.push(key.value);
        if (key.input) key.input.value = '';
        this.saveOrg(org);
    }

}
