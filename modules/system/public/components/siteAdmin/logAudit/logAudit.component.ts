import { Http } from "@angular/http";
import { Component, Inject, OnInit } from "@angular/core";
import "rxjs/add/operator/map";
import * as moment from "moment";
import { AlertService } from "../../alert/alert.service";

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
            css: "fa fa-fw fa-sort"
        },
        ip: {
            title: "IP",
            property: "remoteAddr",
            sort: "desc",
            css: "fa fa-fw fa-sort"
        },
        url: {
            title: "URL",
            property: "url",
            css: "fa fa-fw fa-sort"
        },
        method: {
            title: "Method",
            property: "method",
            css: "fa fa-fw fa-sort"
        },
        status: {
            title: "Status",
            property: "httpStatus",
            css: "fa fa-fw fa-sort"
        },
        respTime: {
            title: "Resp. Time",
            property: "responseTime",
            css: "fa fa-fw fa-sort"
        }
    };

    constructor(private http: Http,
                private Alert: AlertService) {
    }

    getSortObj() {
        let sort = {};
        for (let p in this.sortMap) {
            if (this.sortMap.hasOwnProperty(p) && this.sortMap[p].sort)
                sort[this.sortMap[p].property] = this.sortMap[p].sort;
        }

        return sort;
    }

    sort(p) {
        if (this.sortMap[p].sort === "asc") {
            this.sortMap[p].sort = "desc";
            this.sortMap[p].css = "fa fa-fw fa-sort-desc";
        } else {
            this.sortMap[p].sort = "asc";
            this.sortMap[p].css = "fa fa-fw fa-sort-asc";
        }
        this.currentPage = 1;
        this.searchLogs(false);
    }

    searchLogs(newSearch = false) {
        if (newSearch) {
            this.currentPage = 1;
            for (let p in this.sortMap) {
                if (this.sortMap.hasOwnProperty(p)) {
                    this.sortMap[p].sort = null;
                    this.sortMap[p].css = 'fa fa-fw fa-sort';
                }
            }
        }

        let postBody = {
            currentPage: this.currentPage,
            ipAddress: this.ipAddress,
            totalItems: this.totalItems,
            itemsPerPage: this.itemsPerPage,
            fromDate: LogAuditComponent.parseDate(this.fromDate),
            toDate: LogAuditComponent.parseDate(this.toDate),
            sort: this.getSortObj()
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

    static parseDate(inDate) {
        if (inDate) return moment(inDate + moment().format("Z")).toISOString();
        else return;
    }
}
