import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


@Component({
    selector: 'cde-sdc-view',
    templateUrl: './sdcView.component.html'
})
export class SdcViewComponent implements OnInit {
    sdcCde: any;

    ngOnInit () {
        if (this.route.snapshot.queryParams['triggerClientError']) throw new Error('An exception has been thown');

        let cdeId = this.route.snapshot.queryParams['cdeId'];
        this.http.get('/sdc/' + cdeId).subscribe(result => this.sdcCde = result);
    }

    constructor(
        private http: HttpClient,
        private route: ActivatedRoute
    ) {}
}
