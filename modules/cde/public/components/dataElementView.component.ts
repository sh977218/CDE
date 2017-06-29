import { Component, Inject, Input, OnInit, ViewChild } from "@angular/core";
import * as _ from "lodash";

import { Observable } from "rxjs/Rx";
import "rxjs/add/observable/forkJoin";
import { AlertService } from "../../../system/public/components/alert/alert.service";
import { DataElementService } from "../dataElement.service";


@Component({
    selector: "cde-data-element-view",
    templateUrl: "dataElementView.component.html"
})
export class DataElementViewComponent implements OnInit {
    @Input() elt: any;


    eltLoaded: boolean = true;

    constructor(@Inject("isAllowedModel") public isAllowedModel,
                private dataElementService: DataElementService,
                private alert: AlertService) {
    }

    // remove it once has angular2 route
    getParameterByName(name, url = null) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    ngOnInit(): void {
        let tinyId = this.getParameterByName("tinyId");

        this.dataElementService.get(tinyId).subscribe(res => {
            this.elt = res;
        }, err => {
            this.alert.addAlert("danger", "Sorry, we are unable to retrieve this element.");
        });
    }
}