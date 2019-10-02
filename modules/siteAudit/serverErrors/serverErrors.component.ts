import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import { PageEvent } from '@angular/material';

type ServerErrorRecord = any;

@Component({
    selector: 'cde-server-errors',
    templateUrl: './serverErrors.component.html',
    styles: [
        `
        .error_cell {
            max-width: 440px;
            word-wrap: break-word;
        }
        `
    ]
})
export class ServerErrorsComponent {
    currentPage: number = 0;
    records: ServerErrorRecord[] = [];

    constructor(private http: HttpClient,
                private alert: AlertService) {
        this.gotoPage();
    }

    gotoPage(event?: PageEvent) {
        if (event) {
            this.currentPage = event.pageIndex;
        }

        this.http.post('/server/notification/updateNotificationDate', {serverLogDate: new Date()})
            .subscribe(() => {
                this.http.post<ServerErrorRecord[]>('/server/log/serverErrors', {
                    skip: this.currentPage * 50,
                    limit: 50
                }).subscribe(response => {
                    this.records = response;
                }, err => this.alert.httpErrorMessageAlert(err));
            }, err => this.alert.httpErrorMessageAlert(err));
    }
}
