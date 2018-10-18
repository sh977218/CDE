import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AlertService } from 'alert/alert.service';

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
export class ServerErrorsComponent implements OnInit {
    currentPage: number = 1;
    excludeFilters: string[] = [];
    excludeFilterToAdd = '';
    records: ServerErrorRecord[] = [];

    ngOnInit() {
        this.gotoPage();
    }

    constructor(private http: HttpClient,
                private alert: AlertService) {
    }

    addExcludeFilter(toAdd: string) {
        if (toAdd.length > 0 && this.excludeFilters.indexOf(toAdd) === -1) {
            this.excludeFilters.push(toAdd.trim());
            this.gotoPage();
        }
    }

    gotoPage() {
        this.http.post('/server/user/updateNotificationDate', {serverLogDate: new Date()})
            .subscribe(() => {
                this.http.post<ServerErrorRecord[]>('/server/log/serverErrors', {
                    skip: (this.currentPage - 1) * 50,
                    limit: 50
                }).subscribe(response => {
                    this.records = response;
                }, err => this.alert.httpErrorMessageAlert(err));
            }, err => this.alert.httpErrorMessageAlert(err));
    }
}
