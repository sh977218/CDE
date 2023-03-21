import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

import { ignoredDiff, makeHumanReadable } from 'siteAudit/itemLog/cdeDiffPopulate.service';
import { EltLog } from 'shared/models.model';
import { PageEvent } from '@angular/material/paginator';

@Component({
    selector: 'cde-de-log',
    templateUrl: './dataElementLog.component.html',
})
export class DataElementLogComponent {
    records: EltLog[] = [];
    currentPage: number = 0;
    ignoredDiff = ignoredDiff;
    includeBatch = true;
    readonly pageSize = 50;

    constructor(private http: HttpClient) {
        this.gotoPageLocal();
    }

    gotoPageLocal(event?: PageEvent) {
        if (event) {
            this.currentPage = event.pageIndex;
        }

        this.http
            .post<EltLog[]>('/server/de/getAuditLog', {
                includeBatch: this.includeBatch,
                skip: this.currentPage * this.pageSize,
                limit: this.pageSize,
            })
            .subscribe(response => {
                if (Array.isArray(response)) {
                    this.records = response;
                    this.records.forEach(rec => {
                        if (rec.diff) {
                            rec.diff.forEach(d => makeHumanReadable(d));
                        }
                    });
                }
            });
    }
}
