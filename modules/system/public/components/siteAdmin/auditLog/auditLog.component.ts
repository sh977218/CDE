import { Http } from "@angular/http";
import { Component, OnInit } from "@angular/core";
import "rxjs/add/operator/map";
import { CdeDiffPopulateService } from "./cdeDiffPopulate.service";

@Component({
    selector: "cde-audit-log",
    templateUrl: "./auditLog.component.html"
})

export class AuditLogComponent implements OnInit {

    constructor(private http: Http,
                private cdeDiff: CdeDiffPopulateService) {
    }

    records: any[] = [];
    currentPage: number = 1;

    ngOnInit() {
        this.gotoPageLocal();
    }

    gotoPageLocal() {
        this.http.post("/getCdeAuditLog", {
            skip: (this.currentPage - 1) * 50,
            limit: 50
        }).map(r => r.json()).subscribe(response => {
            this.records = response;
            this.records.forEach(rec => {
                if (rec.diff) rec.diff.forEach(d => this.cdeDiff.makeHumanReadable(d));
            });
        });
    };

}