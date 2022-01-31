import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PageEvent } from '@angular/material/paginator';
import { ClassificationAudit } from 'shared/audit/classificationAudit';
import { noop } from 'shared/util';

@Component({
    selector: 'cde-classification-audit-log',
    templateUrl: './classificationAuditLog.component.html'
})
export class ClassificationAuditLogComponent {
    currentPage: number = 0;
    records: ClassificationAudit[] = [];

    constructor(private http: HttpClient) {
        this.gotoPage();
    }

    gotoPage(event?: PageEvent) {
        if (event) {
            this.currentPage = event.pageIndex;
        }
        this.http.post<ClassificationAudit[]>('/server/system/getClassificationAuditLog', {
            skip: this.currentPage * 50,
            limit: 50
        }).subscribe(response => {
            this.records = response;
        }, noop);
    }
}
