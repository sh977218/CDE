import { Http } from "@angular/http";
import { Component, Inject, OnInit } from "@angular/core";
import "rxjs/add/operator/map";

//import moment = require("moment");
import * as moment from "moment";

@Component({
    selector: "cde-log-audit",
    templateUrl: "./logAudit.component.html"
})

export class LogAuditComponent implements OnInit {
    gridLogEvents: any[] = [];
    search: any = {
        currentPage: 0
    };
    table: any;
    totalItems: number;
    itemsPerPage: number;

    constructor(private http: Http,
                @Inject("Alert") private Alert) {
    }

    ngOnInit(): void {
        this.searchLogs();
    }

    searchLogs() {
        this.gridLogEvents = [];
        let fromDate, toDate;
        if (this.search.fromDate) {
            fromDate = moment(this.search.fromDate + moment().format("Z")).toISOString();
        }
        if (this.search.toDate) {
            toDate = moment(this.search.toDate + moment().format("Z")).toISOString();
        }
        //noinspection TypeScriptValidateTypes
        this.http.post("/logs", {
            query: this.search,
            fromDate: fromDate,
            toDate: toDate
        }).map(res => res.json()).subscribe(
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
