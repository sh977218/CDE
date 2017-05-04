import { Http } from "@angular/http";
import { Component, Inject, OnInit } from "@angular/core";
import "rxjs/add/operator/map";
import * as moment from "moment";

@Component({
    selector: "cde-log-audit",
    templateUrl: "./logAudit.component.html",
    styles: [`
        :host >>> .fa.fa-fw.fa-sort{
            color:lightgrey;
        }
    `]
})

export class LogAuditComponent implements OnInit {
    gridLogEvents: any[] = [];
    search: any = {
        currentPage: 0
    };
    totalItems: number;
    itemsPerPage: number;

    propertiesArray = ["date", "ip", "url", "method", "status", "respTime"];

    public sortMap = {
        date: {
            title: "Date",
            sort: {
                sortBy: "date",
                sortDir: 1
            },
            class: "fa fa-fw fa-sort"
        },
        ip: {
            title: "IP",
            sort: {
                sortBy: "ip",
                sortDir: 0
            },
            class: "fa fa-fw fa-sort"
        },
        url: {
            title: "URL", sort: {
                sortBy: "url",
                sortDir: 0
            },
            class: "fa fa-fw fa-sort-desc"
        },
        method: {
            title: "Method",
            sort: {
                sortBy: "method",
                sortDir: 0
            },
            class: "fa fa-fw fa-sort-asc"
        }
        ,
        status: {
            title: "Status",
            sort: {
                sortBy: "status",
                sortDir: 0
            },

            class: "fa fa-fw fa-sort"
        }
        ,
        respTime: {
            title: "Resp. Time",
            sort: {
                sortBy: "respTime",
                sortDir: 0
            },
            class: "fa fa-fw fa-sort"
        }
    };

    constructor(private http: Http,
                @Inject("Alert") private Alert) {
    }

    sort(p) {
        this.searchLogs(sort);
    }

    ngOnInit(): void {
        this.searchLogs(null);
    }

    searchLogs(sort) {
        this.gridLogEvents = [];
        let fromDate, toDate;
        if (this.search.fromDate) fromDate = moment(this.search.fromDate + moment().format("Z")).toISOString();
        if (this.search.toDate) toDate = moment(this.search.toDate + moment().format("Z")).toISOString();
        let inQuery = {
            query: this.search,
            fromDate: fromDate,
            toDate: toDate
        };
        if (sort) inQuery["sort"] = sort;
        //noinspection TypeScriptValidateTypes
        this.http.post("/logs", inQuery).map(res => res.json()).subscribe(
            res => {
                this.totalItems = res.count;
                this.itemsPerPage = res.itemsPerPage;
                if (res.logs)
                    res.logs.forEach(log => {
                        if (log !== undefined) {
                            this.gridLogEvents.push({
                                date: new Date(log.date).toLocaleString(),
                                ip: log.remoteAddr,
                                url: log.url,
                                method: log.method,
                                status: log.httpStatus,
                                respTime: log.responseTime
                            });
                        }
                    });
            });
    };
}
