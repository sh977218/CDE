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
    totalItems?: number;
    toDate: any;

    constructor(
        private http: HttpClient
    ) {}

    searchLogs(event?: PageEvent) {
        if (event) {
            this.currentPage = event.pageIndex;
        }
        this.http.post<any>('/server/log/appLogs', {
            currentPage: this.currentPage,
            fromDate: this.fromDate,
            toDate: this.toDate
        }).subscribe(res => {
            if (res.totalItems) {
                this.totalItems = res.totalItems;
            }
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
