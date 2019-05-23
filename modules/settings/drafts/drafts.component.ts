import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from 'alert/alert.service';
import { Drafts } from 'shared/models.model';
import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm } from 'shared/form/form.model';

@Component({
    templateUrl: './drafts.component.html'
})
export class DraftsComponent {
    @ViewChild('deTable', { read: MatSort }) deSort: MatSort;
    @ViewChild('formTable', { read: MatSort }) formSort: MatSort;
    @ViewChild('dePage') dePaginator: MatPaginator;
    @ViewChild('formPage') formPaginator: MatPaginator;
    deTableData?: MatTableDataSource<DataElement>;
    draftColumns: string[] = ['name', 'id', 'updatedBy', 'updatedDate', 'organization'];
    formTableData?: MatTableDataSource<CdeForm>;
    title: string = 'Drafts';
    deOrgs?: string[];
    deFilterOrgs?: string[];
    formOrgs?: string[];
    formFilterOrgs?: string[];

    constructor(private alert: AlertService,
                private http: HttpClient,
                protected route: ActivatedRoute) {
        this.route.data.subscribe(event => {
            this.title = event.title;
            this.http.get<Drafts>(event.draftsUrl).subscribe(
                res => {
                    this.deTableData = new MatTableDataSource(res.draftCdes);
                    this.formTableData = new MatTableDataSource(res.draftForms);
                    setTimeout(() => {
                        this.deTableData.sort = this.deSort;
                        this.formTableData.sort = this.formSort;
                        this.deTableData.paginator = this.dePaginator;
                        this.formTableData.paginator = this.formPaginator;
                    }, 0);

                    this.deTableData.filterPredicate = (data: DataElement, filter: string) =>
                        this.deFilterOrgs.includes(data.stewardOrg ? data.stewardOrg.name : '');
                    const deOrgs = new Set<string>();
                    res.draftCdes.forEach(elt => deOrgs.add(elt.stewardOrg ? elt.stewardOrg.name : ''));
                    this.deOrgs = Array.from(deOrgs.values());
                    this.deFilterOrgs = this.deOrgs.concat();

                    this.formTableData.filterPredicate = (data: CdeForm, filter: string) =>
                        this.formFilterOrgs.includes(data.stewardOrg ? data.stewardOrg.name : '');
                    const formOrgs = new Set<string>();
                    res.draftForms.forEach(elt => formOrgs.add(elt.stewardOrg ? elt.stewardOrg.name : ''));
                    this.formOrgs = Array.from(formOrgs.values());
                    this.formFilterOrgs = this.formOrgs.concat();
                },
                err => this.alert.httpErrorMessageAlert(err)
            );
        });
    }

    onDeFilter() {
        this.deTableData.filter = 'filter: ' + this.deFilterOrgs.join();

        if (this.deTableData.paginator) {
            this.deTableData.paginator.firstPage();
        }
    }

    onFormFilter() {
        this.formTableData.filter = 'filter: ' + this.formFilterOrgs.join();

        if (this.formTableData.paginator) {
            this.formTableData.paginator.firstPage();
        }
    }
}
