import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { PageEvent } from '@angular/material';

type AppLogEntry = any;

@Component({
    selector: 'cde-app-log',
    templateUrl: './appLog.component.html',
})
export class AppLogComponent {
    currentPage: number = 0;
    fromDate: any;
    gridLogEvents: any[] = [];
    itemsPerPage?: number;
    totalItems?: number;
    toDate: any;

    constructor(
        private http: HttpClient
    ) {}

    searchLogs(event?: PageEvent) {
        if (event) {
            this.currentPage = event.pageIndex;
        }

        let postBody = {
            currentPage: this.currentPage,
            itemsPerPage: this.itemsPerPage,
            fromDate: this.fromDate,
            toDate: this.toDate
        };
        this.http.post<any>('/server/log/appLogs', postBody).subscribe(res => {
            if (res.totalItems) this.totalItems = res.totalItems;
            if (res.itemsPerPage) this.itemsPerPage = res.itemsPerPage;
            this.gridLogEvents = res.logs.map((log: AppLogEntry) => {
                return {
                    date: new Date(log.date).toLocaleString(),
                    level: log.level,
                    message: log.message
                };
            });
        });
    }
}
