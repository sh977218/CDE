import { HttpClient } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';

type FeedbackErrorRecord = any;

@Component({
    selector: 'cde-feedback-issues',
    templateUrl: './feedbackIssues.component.html'
})
export class FeedbackIssuesComponent implements OnInit {
    @ViewChild('rawHtmlModal') rawHtmlModal!: TemplateRef<any>;
    @ViewChild('screenshotModal') screenshotModal!: TemplateRef<any>;
    currentPage: number = 1;
    records: FeedbackErrorRecord[] = [];
    screenshot?: string;
    rawHtml?: string;

    ngOnInit () {
        this.gotoPage();
    }

    constructor(private http: HttpClient,
                public dialog: MatDialog) {}

    gotoPage() {
        this.http.post<FeedbackErrorRecord[]>('/server/log/feedbackIssues', {
            skip: (this.currentPage - 1) * 5,
            limit: 5
        }).subscribe(response => this.records = response);
    }

    showRawHtml(raw: string) {
        this.rawHtml = raw;
        this.dialog.open(this.rawHtmlModal, {width: '1000px'});
    }

    showScreenshot(sc: string) {
        this.screenshot = sc;
        this.dialog.open(this.screenshotModal, {width: '1000px'});
    }
}
