import { HttpClient } from '@angular/common/http';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

type FeedbackErrorRecord = any;

@Component({
    selector: 'cde-feedback-issues',
    templateUrl: './feedbackIssues.component.html'
})
export class FeedbackIssuesComponent {
    @ViewChild('rawHtmlModal', {static: true}) rawHtmlModal!: TemplateRef<any>;
    @ViewChild('screenshotModal', {static: true}) screenshotModal!: TemplateRef<any>;
    currentPage: number = 0;
    records: FeedbackErrorRecord[] = [];
    screenshot?: string;
    rawHtml?: string;

    constructor(private http: HttpClient,
                public dialog: MatDialog) {
        this.gotoPage();
    }

    gotoPage(event?: PageEvent) {
        if (event) {
            this.currentPage = event.pageIndex;
        }
        this.http.post<FeedbackErrorRecord[]>('/server/log/feedbackIssues', {
            skip: this.currentPage * 5,
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
