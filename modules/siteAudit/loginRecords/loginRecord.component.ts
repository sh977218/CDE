import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { LoginRecord } from 'shared/log/audit';
import { PageEvent } from '@angular/material/paginator';

@Component({
    selector: 'cde-login-records',
    templateUrl: './loginRecord.component.html',
})
export class LoginRecordComponent {
    loginRecords: LoginRecord[] = [];
    currentPage: number = 0;

    constructor(private http: HttpClient) {
        this.refresh();
    }

    refresh() {
        this.http
            .post<LoginRecord[]>(`/server/system/loginRecords`, { page: this.currentPage })
            .subscribe((result: LoginRecord[]) => (this.loginRecords = result));
    }

    gotoPage(event?: PageEvent) {
        if (event) {
            this.currentPage = event.pageIndex;
        }

        this.refresh();
    }
}
