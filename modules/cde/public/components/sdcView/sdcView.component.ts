import { Component, Input, OnInit } from "@angular/core";
import { Http } from "@angular/http";
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: "cde-sdc-view",
    templateUrl: "./sdcView.component.html"
})


export class SdcViewComponent implements OnInit {

    constructor(private http: Http,
                private route: ActivatedRoute) {}

    sdcCde: any;

    ngOnInit () {
        let cdeId = this.route.snapshot.queryParams['cdeId'];
        this.http.get("/sdc/" + cdeId).map(r => r.json()).subscribe(result => this.sdcCde = result);
    }

}