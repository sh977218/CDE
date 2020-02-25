import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PageEvent } from '@angular/material/paginator';
import _noop from 'lodash/noop';

type ClassificationAuditLogRecord = any;

@Component({
    selector: 'cde-classification-audit-log',
    templateUrl: './classificationAuditLog.component.html'
})
export class ClassificationAuditLogComponent {
    currentPage: number = 0;
    records: ClassificationAuditLogRecord[] = [];

    constructor(private http: HttpClient) {
        this.gotoPage();
    }

    gotoPage(event?: PageEvent) {
        if (event) {
            this.currentPage = event.pageIndex;
        }
        this.http.post<ClassificationAuditLogRecord[]>('/server/system/getClassificationAuditLog', {
            skip: this.currentPage * 50,
            limit: 50
        }).subscribe(response => {
            this.records = response;
        }, _noop);
    }
}
