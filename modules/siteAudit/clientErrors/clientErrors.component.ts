import { HttpClient } from '@angular/common/http';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, PageEvent } from '@angular/material';
import { AlertService } from 'alert/alert.service';

type ClientErrorRecord = any;

@Component({
    selector: 'cde-client-errors',
    templateUrl: './clientErrors.component.html'
})
export class ClientErrorsComponent {
    @ViewChild('errorDetailModal', {static: false}) errorDetailModal!: TemplateRef<any>;
    currentPage: number = 0;
    records: ClientErrorRecord[] = [];
    filteredRecords: ClientErrorRecord[] = [];
    error?: ClientErrorRecord;
    browserInclude: {[browser: string]: boolean} = {
        chrome: true,
        firefox: true,
        ie: false,
        edge: true
    };

    constructor(private http: HttpClient,
                public dialog: MatDialog,
                private alert: AlertService) {
        this.gotoPage();
    }

    gotoPage(event?: PageEvent) {
        if (event) {
            this.currentPage = event.pageIndex;
        }

        this.http.post('/server/notification/updateNotificationDate', {clientLogDate: new Date()})
            .subscribe(() => {
                this.http.post<ClientErrorRecord[]>('/server/log/clientErrors', {
                    skip: this.currentPage * 50,
                    limit: 50
                }).subscribe(response => {
                    this.records = response;
                    this.records.forEach(r => {
                        if (r.url) {
                            r.url = r.url.substr(8);
                            r.url = r.url.substr(r.url.indexOf('/'));
                        }
                    });
                    this.filter();
                }, err => this.alert.httpErrorMessageAlert(err));
            }, err => this.alert.httpErrorMessageAlert(err));
    }

    openErrorDetail(error: ClientErrorRecord) {
        this.error = error;
        this.dialog.open(this.errorDetailModal, {width: '800px'});
    }

    filter() {
        this.filteredRecords = this.records.filter(r => {
            try {
                return this.browserInclude[r.agent.substr(0, r.agent.indexOf(' ')).toLowerCase()];
            } catch (e) {
                return true;
            }
        });
    }
}
