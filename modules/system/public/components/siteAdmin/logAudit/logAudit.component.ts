import { Http } from "@angular/http";
import { Component, Inject } from "@angular/core";
import "rxjs/add/operator/map";


@Component({
    selector: "cde-log-audit",
    templateUrl: "./logAudit.component.html"
})

export class LogAuditComponent {

    gridLogEvents: any[];
    gridOptions: any;
    search: any;
    table: any;
    totalItems: number;
    itemsPerPage: number;

    constructor(private http: Http, @Inject ("Alert") private Alert) {
        this.gridLogEvents = [];
        this.search = {currentPage: 0};
    }

    searchLogs () {
        this.gridLogEvents = [];
        this.search = {currentPage: 0};

        this.http.post("/logs", {query: this.search}).map(res => res.json()).subscribe((res) => {
            this.totalItems = res.count;
            this.itemsPerPage = res.itemsPerPage;
            res.logs.forEach(log => {
                if (log !== undefined) {
                    this.gridLogEvents.push({
                        date: new Date(log.date).toLocaleString()
                        , ip: log.remoteAddr
                        , url: log.url
                        , method: log.method
                        , status: log.httpStatus
                        , respTime: log.responseTime
                    });
                }
            });
        });
    };

}
