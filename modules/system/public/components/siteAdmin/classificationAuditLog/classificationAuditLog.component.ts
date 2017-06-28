import { Component, OnInit } from "@angular/core";
import { Http } from "@angular/http";

import "rxjs/add/operator/map";

@Component({
    selector: "cde-classification-audit-log",
    templateUrl: "./classificationAuditLog.component.html"
})

export class ClassificationAuditLogComponent implements OnInit {

    constructor(private http: Http) {}

    currentPage: number = 1;
    records: any[] = [];

    ngOnInit () {
        this.gotoPage();
    }

    gotoPage () {
        this.http.post("/getClassificationAuditLog", {
            skip: (this.currentPage - 1) * 50,
            limit: 50
        }).map(r => r.json()).subscribe(response => {
            this.records = response;
        });
    };

}