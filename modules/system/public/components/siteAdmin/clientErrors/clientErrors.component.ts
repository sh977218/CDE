import { Http } from "@angular/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import "rxjs/add/operator/map";
import { NgbModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: "cde-client-errors",
    templateUrl: "./clientErrors.component.html"
})

export class ClientErrorsComponent implements OnInit {

    constructor(private http: Http,
                public modalService: NgbModal) {}

    @ViewChild("errorDetailModal") public errorDetailModal: NgbModalModule;
    currentPage: number = 1;
    records: any[] = [];
    error: any = {};

    ngOnInit () {
        this.gotoPage();
    }

    gotoPage () {
        this.http.post("/getClientErrors", {
            skip: (this.currentPage - 1) * 50,
            limit: 50
        }).map(r => r.json()).subscribe(response => {
            this.records = response;
        });
    }

    openErrorDetail (error) {
        this.error = error;
        this.modalService.open(this.errorDetailModal, {size: 'lg'});
    }




}