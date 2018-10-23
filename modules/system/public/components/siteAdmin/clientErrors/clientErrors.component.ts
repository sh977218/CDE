import { HttpClient } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import { MatDialog } from '@angular/material';

type ClientErrorRecord = any;

@Component({
    selector: 'cde-client-errors',
    templateUrl: './clientErrors.component.html'
})
export class ClientErrorsComponent implements OnInit {
    @ViewChild('errorDetailModal') errorDetailModal!: TemplateRef<any>;
    currentPage: number = 1;
    records: ClientErrorRecord[] = [];
    filteredRecords: ClientErrorRecord[] = [];
    error?: ClientErrorRecord;
    browserInclude: {[browser: string]: boolean} = {
        chrome: true,
        firefox: true,
        ie: false,
        edge: true
    };

    ngOnInit() {
        this.gotoPage();
    }

    constructor(private http: HttpClient,
                public dialog: MatDialog,
                private alert: AlertService) {
    }

    gotoPage() {
        this.http.post('/server/user/updateNotificationDate', {clientLogDate: new Date()})
            .subscribe(() => {
                this.http.post<ClientErrorRecord[]>('/server/log/clientErrors', {
                    skip: (this.currentPage - 1) * 50,
                    limit: 50
                }).subscribe(response => {
                    this.records = response;
                    this.records.forEach(r => {
                        if (r.url) {
                            r.url = r.url.substr(8);
                            r.url = r.url.substr(r.url.indexOf("/"));
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
                return this.browserInclude[r.agent.substr(0, r.agent.indexOf(" ")).toLowerCase()];
            } catch (e) {
                return true;
            }
        });
    }
}
