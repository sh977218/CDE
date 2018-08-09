import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

type FeedbackErrorRecord = any;


@Component({
    selector: 'cde-feedback-issues',
    templateUrl: './feedbackIssues.component.html'
})
export class FeedbackIssuesComponent implements OnInit {
    @ViewChild('rawHtmlModal') public rawHtmlModal: NgbModalModule;
    @ViewChild('screenshotModal') public screenshotModal: NgbModalModule;
    currentPage: number = 1;
    records: FeedbackErrorRecord[] = [];
    screenshot: string;
    rawHtml: string;

    ngOnInit () {
        this.gotoPage();
    }

    constructor(private http: HttpClient,
                public modalService: NgbModal) {}

    gotoPage () {
        this.http.post<FeedbackErrorRecord[]>('/server/log/feedbackIssues', {
            skip: (this.currentPage - 1) * 5,
            limit: 5
        }).subscribe(response => {
            this.records = response;
        });
    }

    showRawHtml (raw) {
        this.rawHtml = raw;
        this.modalService.open(this.rawHtmlModal, {size: 'lg'});
    }

    showScreenshot (sc) {
        this.screenshot = sc;
        this.modalService.open(this.screenshotModal, {size: 'lg'});
    }
}
