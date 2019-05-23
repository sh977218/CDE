import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { PageEvent } from '@angular/material';
import { ignoredDiff, makeHumanReadable } from 'siteAudit/itemLog/cdeDiffPopulate.service';
import { EltLog } from 'shared/models.model';

@Component({
    selector: 'cde-form-log',
    templateUrl: './formLog.component.html',
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
export class FormLogComponent {
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

        this.http.post<EltLog[]>('/getFormAuditLog', {
            includeBatch: this.includeBatch,
            skip: this.currentPage * this.pageSize,
            limit: this.pageSize
        }).subscribe(response => {
            if (Array.isArray(response)) {
                this.records = response;
                this.records.forEach(rec => {
                    if (rec.diff) rec.diff.forEach(makeHumanReadable);
                });
            }
        });
    }
}
