import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';


@Component({
    selector: 'cde-log-audit',
    templateUrl: './logAudit.component.html',
    styles: [`
        :host >>> .fa.fa-fw.fa-sort{
            color:lightgrey;
        }
    `]
})
export class LogAuditComponent {
    currentPage: number = 1;
    gridLogEvents: any[] = [];
    ipAddress: any;
    itemsPerPage: number;
    fromDate: any;
    totalItems: number;
    toDate: any;
    sortingBy: any = {date: 'desc'};
    sortMap = {
        date: {
            title: 'Date',
            property: 'date',
        },
        ip: {
            title: 'IP',
            property: 'remoteAddr',
        },
        url: {
            title: 'URL',
            property: 'url',
        },
        method: {
            title: 'Method',
            property: 'method',
        },
        status: {
            title: 'Status',
            property: 'httpStatus',
        },
        respTime: {
            title: 'Resp. Time',
            property: 'responseTime',
        }
    };
    propertiesArray = ['date', 'ip', 'url', 'method', 'status', 'respTime'];

    constructor(
        private http: HttpClient
    ) {}

    searchLogs(newSearch = false) {
        let postBody = {
            currentPage: this.currentPage,
            ipAddress: this.ipAddress,
            totalItems: this.totalItems,
            itemsPerPage: this.itemsPerPage,
            fromDate: this.fromDate,
            toDate: this.toDate,
            sort: this.sortingBy
        };
        //noinspection TypeScriptValidateTypes
        this.http.post<any>('/server/log/httpLogs', postBody)
            .subscribe(res => {
                if (res.totalItems) this.totalItems = res.totalItems;
                if (res.itemsPerPage) this.itemsPerPage = res.itemsPerPage;
                this.gridLogEvents = res.logs.map(log => {
                    return {
                        date: new Date(log.date).toLocaleString(),
                        ip: log.remoteAddr,
                        url: log.url,
                        method: log.method,
                        status: log.httpStatus,
                        respTime: log.responseTime
                    };
                });
            });
    }

    sort(p) {
        p = this.sortMap[p].property;
        if (this.sortingBy[p] === 'desc') {
            this.sortingBy[p] = 'asc';
        } else if (this.sortingBy[p] === 'desc') {
            this.sortingBy[p] = 'desc';
        } else {
            this.sortingBy = {};
            this.sortingBy[p] = 'desc';
        }
        this.currentPage = 1;
        this.searchLogs();
    }
}
