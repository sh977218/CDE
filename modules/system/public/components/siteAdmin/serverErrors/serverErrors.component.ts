import { Http } from "@angular/http";
import { Component, OnInit } from "@angular/core";
import "rxjs/add/operator/map";

@Component({
    selector: "cde-server-errors",
    templateUrl: "./serverErrors.component.html"
})

export class ServerErrorsComponent implements OnInit {

    constructor(private http: Http) {}

    currentPage: number = 1;
    excludeFilters: any[] = [];
    records: any[] = [];
    error: any = {};
    excludeFilterToAdd: any[] = [];

    ngOnInit () {
        this.gotoPage();
    }

    gotoPage () {
        this.http.post("/getServerErrors", {
            skip: (this.currentPage - 1) * 50,
            limit: 50
        }).map(r => r.json()).subscribe(response => {
            this.records = response;
        });
    };

    addExcludeFilter (toAdd) {
        if (toAdd.length > 0 && this.excludeFilters.indexOf(toAdd) === -1) {
            this.excludeFilters.push(toAdd.trim());
            this.gotoPage();
        }
    };
}