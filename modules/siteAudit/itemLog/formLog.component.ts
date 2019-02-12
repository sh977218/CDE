import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { PageEvent } from '@angular/material';
import _isEmpty from 'lodash/isEmpty';
import { makeHumanReadable } from 'siteAudit/itemLog/cdeDiffPopulate.service';

type FormLogRecord = any;

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
    records: FormLogRecord[] = [];
    currentPage: number = 0;
    includeBatch = true;
    readonly pageSize = 50;

    constructor(private http: HttpClient) {
        this.gotoPageLocal();
    }

    gotoPageLocal(event?: PageEvent) {
        if (event) {
            this.currentPage = event.pageIndex;
        }

        this.http.post<FormLogRecord[]>('/getFormAuditLog', {
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

    ignoredDiff(d) {
        switch (d.kind) {
            case 'E':
                return !d.previousValue && !d.newValue;
            case 'D':
                return !d.previousValue;
            case 'N':
                return !d.newValue || typeof d.newValue === 'object' && _isEmpty(d.newValue);
            default:
                return false;
        }
    }
}
