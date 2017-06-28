import { Component, Inject, Input, OnInit, ViewChild } from "@angular/core";
import { Router, ActivatedRoute, Params } from '@angular/router';
import * as _ from "lodash";

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { DataElementService } from "../dataElement.service";


@Component({
    selector: "cde-data-element-view",
    providers: [DataElementService],
    templateUrl: "dataElementView.component.html"
})
export class DataElementViewComponent implements OnInit {
    @Input() elt: any;

    loaded: boolean = true;

    constructor(private activatedRoute: ActivatedRoute,
                @Inject("isAllowedModel") public isAllowedModel) {
    }

    ngOnInit(): void {
        this.activatedRoute.params.subscribe((params: Params) => {
            let userId = params['tinyId'];
            console.log(userId);
        });
    }
}