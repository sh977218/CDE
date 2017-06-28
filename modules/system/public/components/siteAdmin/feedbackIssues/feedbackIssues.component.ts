import { Http } from "@angular/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import "rxjs/add/operator/map";
import { NgbModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: "cde-feedback-issues",
    templateUrl: "./feedbackIssues.component.html"
})

export class FeedbackIssuesComponent implements OnInit {

    constructor(private http: Http,
                public modalService: NgbModal) {}

    @ViewChild("rawHtmlModal") public rawHtmlModal: NgbModalModule;
    @ViewChild("screenshotModal") public screenshotModal: NgbModalModule;
    currentPage: number = 1;
    records: any[] = [];
    screenshot: string;
    rawHtml: string;

    ngOnInit () {
        this.gotoPage();
    }

    gotoPage () {
        this.http.post("/getFeedbackIssues", {
            skip: (this.currentPage - 1) * 50,
            limit: 50
        }).map(r => r.json()).subscribe(response => {
            this.records = response;
        });
    }

    showScreenshot (sc) {
        this.screenshot = sc;
        this.modalService.open(this.screenshotModal, {size: 'lg'});
    }

    showRawHtml (raw) {
        this.rawHtml = raw;
        this.modalService.open(this.rawHtmlModal, {size: 'lg'});
    }




}