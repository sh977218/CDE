import { Http } from "@angular/http";
import { Component, Inject, OnInit } from "@angular/core";
import "rxjs/add/operator/map";
import * as moment from "moment";

const SORT_MAP = {
    date: {
        title: "Date",
        sort: "desc",
        class: "fa fa-fw fa-sort"
    }, ip: {
        title: "IP",
        sort: "desc",
        class: "fa fa-fw fa-sort"
    }, url: {
        title: "URL",
        sort: "desc",
        class: "fa fa-fw fa-sort"
    }, method: {
        title: "Method",
        sort: "desc",
        class: "fa fa-fw fa-sort"
    }, status: {
        title: "Status",
        sort: "desc",
        class: "fa fa-fw fa-sort"
    }, respTime: {
        title: "Resp. Time",
        sort: "desc",
        class: "fa fa-fw fa-sort"
    }
};

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
    sortMap = SORT_MAP;

    constructor(private http: Http,
                @Inject("Alert") private Alert) {
    }

    setOppositeSort(m) {
        if (m.sort === "desc") {
            m.sort = "asc";
            m.class = "fa fa-fw fa-sort-asc";
        } else {
            m.sort = "desc";
            m.class = "fa fa-fw fa-sort-desc";
        }
    }

    sort(p) {
        let sort = {};
        sort[p] = this.sortMap[p].sort;
        if (sort[p] === "desc") sort[p] = "asc";
        if (sort[p] === "asc") sort[p] = "desc";
        this.searchLogs(sort, ()=> {
            this.currentPage = 1;
            this.sortMap = SORT_MAP;
            this.setOppositeSort(this.sortMap[p]);
        });
    }

    parseDate(inDate) {
        if (inDate) return moment(inDate + moment().format("Z")).toISOString();
        else return;
    }

    searchLogs(sort, cb) {
        let postBody = {
            currentPage: this.currentPage,
            ipAddress: this.ipAddress,
            totalItems: this.totalItems,
            itemsPerPage: this.itemsPerPage,
            fromDate: this.parseDate(this.fromDate),
            toDate: this.parseDate(this.toDate),
            sort: sort
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
                    }
                });
                if (cb) cb();
            });
    };
}
