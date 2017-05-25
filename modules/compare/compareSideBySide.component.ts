import { Component, Inject, Input, OnInit, ViewChild } from "@angular/core";
import { Http } from '@angular/http';

import "rxjs/add/operator/map";

@Component({
    selector: "cde-compare-side-by-side",
    templateUrl: "./compareSideBySide.component.html"
})
export class CompareSideBySideComponent implements OnInit {

    constructor(@Inject("Alert") private alert,
                private http: Http,
                @Inject("isAllowedModel") public isAllowedModel) {
    }

    ngOnInit(): void {
    }

    openCdesModal() {

    }
}
