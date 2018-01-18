import { Http } from "@angular/http";
import { Component } from "@angular/core";
import "rxjs/add/operator/map";
import { CdeDiffPopulateService } from "./cdeDiffPopulate.service";

@Component({
    selector: "cde-audit-log",
    templateUrl: "./auditLog.component.html"
})

export class AuditLogComponent {

    constructor(private http: Http,
                private cdeDiff: CdeDiffPopulateService) {
        this.gotoPageLocal();
    }

    records: any[] = [];
    currentPage: number = 1;

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