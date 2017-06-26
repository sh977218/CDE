import { Component, OnInit } from "@angular/core";
import {Http} from "@angular/http";

@Component({
    selector: "cde-classification-audit-log",
    templateUrl: "./classificationAuditLog.component.html"
})

export class ClassificationAuditLogComponent implements OnInit {

    constructor(private http: Http) {}

    currentPage: number = 1;
    records: any[] = [];

    ngOnInit () {
        this.gotoPage(0);
    }

    gotoPage (page) {
        this.http.post("/getClassificationAuditLog", {
            skip: (page - 1) * 50,
            limit: 50
        }).map(r => r.json()).subscribe(response => {
            this.records = response;
        });
    };

}