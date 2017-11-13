import { Http } from "@angular/http";
import { Component } from "@angular/core";
import "rxjs/add/operator/map";

@Component({
    selector: "cde-log-audit",
    templateUrl: "./logAudit.component.html",
    styles: [`
        :host >>> .fa.fa-fw.fa-sort{
            color:lightgrey;
        }
    `]
})
export class LogAuditComponent {
    gridLogEvents: any[] = [];
    currentPage: number = 1;
    ipAddress: any;
    toDate: any;
    fromDate: any;
    totalItems: number;
    itemsPerPage: number;
    propertiesArray = ["date", "ip", "url", "method", "status", "respTime"];
    sortMap = {
        date: {
            title: "Date",
            property: "date",
        },
        ip: {
            title: "IP",
            property: "remoteAddr",
        },
        url: {
            title: "URL",
            property: "url",
        },
        method: {
            title: "Method",
            property: "method",
        },
        status: {
            title: "Status",
            property: "httpStatus",
        },
        respTime: {
            title: "Resp. Time",
            property: "responseTime",
        }
    };
    sortingBy: any = {date: "desc"};

    constructor(private http: Http) {}

    sort(p) {
        p = this.sortMap[p].property;
        if (this.sortingBy[p] === "desc") {
            this.sortingBy[p] = "asc";
        } else if (this.sortingBy[p] === "desc") {
            this.sortingBy[p] = "desc";
        } else {
            this.sortingBy = {};
            this.sortingBy[p] = "desc";
        }
        this.currentPage = 1;
        this.searchLogs();
    }

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
        this.http.post("/logs", postBody).map(res => res.json())
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
    };

}
