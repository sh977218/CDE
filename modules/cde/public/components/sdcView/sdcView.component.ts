import { Component, Input, OnInit } from "@angular/core";
import { Http } from "@angular/http";

@Component({
    selector: "cde-sdc-view",
    templateUrl: "./sdcView.component.html"
})

export class SdcViewComponent implements OnInit {

    constructor(private http: Http) {}

    // @TODO Routing
    @Input() cdeId;
    eltLoaded = false;

    sdcCde: any;

    ngOnInit () {
        if (this.cdeId) {
            this.http.get("/sdc/" + this.cdeId).map(r => r.json()).subscribe(result => this.sdcCde = result);
        }
    }

}