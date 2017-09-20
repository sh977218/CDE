import { Component } from "@angular/core";
import { Http } from "@angular/http";

@Component({
    selector: "cde-app-log",
    templateUrl: "./appLog.component.html",
})
export class AppLogComponent {

    gridLogEvents: any[] = [];
    currentPage: number = 1;
    toDate: any;
    fromDate: any;
    totalItems: number;
    itemsPerPage: number;

    constructor(private http: Http) {}

    searchLogs() {
        let postBody = {
            currentPage: this.currentPage,
            itemsPerPage: this.itemsPerPage,
            fromDate: this.fromDate,
            toDate: this.toDate
        };
        this.http.post("/applogs", postBody).map(res => res.json()).subscribe(res => {
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
    };
}