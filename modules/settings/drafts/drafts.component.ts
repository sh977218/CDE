import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { Drafts } from 'shared/models.model';
import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm } from 'shared/form/form.model';

@Component({
    templateUrl: './drafts.component.html'
})
export class DraftsComponent {
    draftColumns: string[] = ['name', 'id', 'updatedBy', 'updatedDate', 'organization'];
    deTableData: MatTableDataSource<DataElement>;
    formTableData: MatTableDataSource<CdeForm>;
    title: string = 'Drafts';
    draftCdes: DataElement[] = [];
    draftForms: CdeForm[] = [];
    organizations: string[];
    selectedOrganization: string = '';

    constructor(private route: ActivatedRoute) {
        this.title = this.route.snapshot.data.title;

        this.draftCdes = this.route.snapshot.data.drafts.draftCdes;
        this.draftForms = this.route.snapshot.data.drafts.draftForms;

        this.deTableData = new MatTableDataSource(this.draftCdes);
        this.formTableData = new MatTableDataSource(this.draftForms);
        const organizationSet = new Set<string>();
        const addOrgSet = (elt: DataElement | CdeForm) => organizationSet.add(elt.stewardOrg && elt.stewardOrg.name ? elt.stewardOrg.name : '');

        this.draftCdes.forEach(addOrgSet);
        this.draftForms.forEach(addOrgSet);
        this.organizations = Array.from(organizationSet.values());
    }

    filterByOrganization() {
        this.deTableData.data = this.draftCdes.filter(d => {
            if (this.selectedOrganization === 'all organizations') return true;
            else return d.stewardOrg.name === this.selectedOrganization;
        });
        this.formTableData.data = this.draftForms.filter(d => {
            if (this.selectedOrganization === 'all organizations') return true;
            else return d.stewardOrg.name === this.selectedOrganization;
        });
    }
}
