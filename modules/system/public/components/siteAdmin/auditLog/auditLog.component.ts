import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

import { CdeDiffPopulateService } from 'system/public/components/siteAdmin/auditLog/cdeDiffPopulate.service';

type AuditLogRecord = any;

@Component({
    selector: 'cde-audit-log',
    templateUrl: './auditLog.component.html'
})
export class AuditLogComponent {
    records: AuditLogRecord[] = [];
    currentPage: number = 1;

    constructor(private http: HttpClient,
                private cdeDiff: CdeDiffPopulateService) {
        this.gotoPageLocal();
    }

    gotoPageLocal() {
        this.http.post<AuditLogRecord[]>('/getCdeAuditLog', {
            skip: (this.currentPage - 1) * 50,
            limit: 50
        }).subscribe(response => {
            this.records = response;
            this.records.forEach(rec => {
                if (rec.diff) rec.diff.forEach((d: any) => this.cdeDiff.makeHumanReadable(d));
            });
        });
    }
}
