import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
    selector: 'cde-app-log',
    templateUrl: './appLog.component.html',
})
export class AppLogComponent {
    currentPage: number = 1;
    fromDate: any;
    gridLogEvents: any[] = [];
    itemsPerPage: number;
    totalItems: number;
    toDate: any;

    constructor(
        private http: HttpClient
    ) {}

    searchLogs() {
        let postBody = {
            currentPage: this.currentPage,
            itemsPerPage: this.itemsPerPage,
            fromDate: this.fromDate,
            toDate: this.toDate
        };
        this.http.post<any>('/server/log/appLogs', postBody).subscribe(res => {
            if (res.totalItems) this.totalItems = res.totalItems;
            if (res.itemsPerPage) this.itemsPerPage = res.itemsPerPage;
            this.gridLogEvents = res.logs.map(log => {
                return {
                    date: new Date(log.date).toLocaleString(),
                    level: log.level,
                    message: log.message
                };
            });
        });
    }
}
