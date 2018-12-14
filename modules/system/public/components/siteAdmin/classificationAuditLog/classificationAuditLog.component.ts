import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import _noop from 'lodash/noop';

type ClassificationAuditLogRecord = any;


@Component({
    selector: 'cde-classification-audit-log',
    templateUrl: './classificationAuditLog.component.html'
})
export class ClassificationAuditLogComponent implements OnInit {
    currentPage: number = 1;
    records: ClassificationAuditLogRecord[] = [];

    ngOnInit () {
        this.gotoPage();
    }

    constructor(
        private http: HttpClient
    ) {}

    gotoPage () {
        this.http.post<ClassificationAuditLogRecord[]>('/getClassificationAuditLog', {
            skip: (this.currentPage - 1) * 50,
            limit: 50
        }).subscribe(response => {
            this.records = response;
        }, _noop);
    }
}
