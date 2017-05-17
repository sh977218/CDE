import { Component, Inject, Input, OnInit } from "@angular/core";
import { Http } from '@angular/http';

import "rxjs/add/operator/map";

@Component({
    selector: "cde-admin-item-history",
    templateUrl: "./history.component.html"
})
export class HistoryComponent implements OnInit {
    @Input() public elt: any;
    showVersioned: boolean = false;
    public priorCdes = [];

    constructor(@Inject("Alert") private alert,
                private http: Http,
                @Inject("isAllowedModel") public isAllowedModel) {
    }

    ngOnInit(): void {
        if (this.elt.history && this.elt.history.length > 0) {
            this.http.get('/priorcdes/' + this.elt._id).map(res => res.json())
                .subscribe(res => {
                    this.priorCdes = res.reverse();
                    this.priorCdes.splice(0, 0, this.elt);
                }, err => this.alert.addAlert("danger", "Error retrieving history: " + err));
        }

    }
}
