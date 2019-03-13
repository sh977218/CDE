import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { PageEvent } from '@angular/material';
import { ignoredDiff, makeHumanReadable } from 'siteAudit/itemLog/cdeDiffPopulate.service';
import { EltLog } from 'shared/models.model';

@Component({
    selector: 'cde-de-log',
    templateUrl: './dataElementLog.component.html',
    styles: [`
        :host >>> ins {
            color: black;
            background: #bbffbb;
        }
        :host >>> del {
            color: black;
            background: #ffbbbb;
        }
        :host >>> label {
            margin-bottom: 0;
        }
    `]
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

        this.http.post<EltLog[]>('/getCdeAuditLog', {
            includeBatch: this.includeBatch,
            skip: this.currentPage * this.pageSize,
            limit: this.pageSize
        }).subscribe(response => {
            this.records = response;
            this.records.forEach(rec => {
                if (rec.diff) rec.diff.forEach(d => makeHumanReadable(d));
            });
        });
    }
}
