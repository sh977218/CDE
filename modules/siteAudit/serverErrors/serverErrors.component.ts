import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
    selector: 'cde-server-errors',
    templateUrl: './serverErrors.component.html',
    styles: []
})
export class ServerErrorsComponent {
    currentPage: number = 0;
    records: any[] = [];
    badInput = false;

    constructor(private http: HttpClient,
                private alert: AlertService) {
        this.gotoPage();
    }

    badInputChanged(checked: boolean) {
        const pagination = {
            skip: this.currentPage * 50,
            badInput: checked,
            limit: 50
        }
        this.loadErrorByPagination(pagination);

    }

    gotoPage(event?: PageEvent) {
        if (event) {
            this.currentPage = event.pageIndex;
        }

        const pagination = {
            skip: this.currentPage * 50,
            badInput: this.badInput,
            limit: 50
        }
        this.loadErrorByPagination(pagination);
    }

    loadErrorByPagination(pagination: any) {
        this.http.post('/server/notification/updateNotificationDate', {serverLogDate: new Date()})
            .subscribe(() => {
                this.http.post<any[]>('/server/log/serverErrors', pagination).subscribe(response => {
                    this.records = response;
                }, err => this.alert.httpErrorMessageAlert(err));
            }, err => this.alert.httpErrorMessageAlert(err));

    }
}
