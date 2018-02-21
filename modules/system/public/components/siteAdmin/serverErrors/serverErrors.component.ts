import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

type ServerErrorRecord = any;


@Component({
    selector: 'cde-server-errors',
    templateUrl: './serverErrors.component.html'
})
export class ServerErrorsComponent implements OnInit {
    currentPage: number = 1;
    excludeFilters: any[] = [];
    records: ServerErrorRecord[] = [];
    error: any = {};
    excludeFilterToAdd: any[] = [];

    ngOnInit () {
        this.gotoPage();
    }

    constructor(
        private http: HttpClient
    ) {}

    addExcludeFilter (toAdd) {
        if (toAdd.length > 0 && this.excludeFilters.indexOf(toAdd) === -1) {
            this.excludeFilters.push(toAdd.trim());
            this.gotoPage();
        }
    }

    gotoPage () {
        this.http.post<ServerErrorRecord[]>('/getServerErrors', {
            skip: (this.currentPage - 1) * 50,
            limit: 50
        }).subscribe(response => {
            this.records = response;
        });
    }
}
