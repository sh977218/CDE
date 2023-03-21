import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import { saveAs } from 'file-saver';
import { PageEvent } from '@angular/material/paginator';

@Component({
    selector: 'cde-data-validation',
    templateUrl: './dataValidation.component.html',
})
export class DataValidationComponent {
    fileValidating: boolean = false;
    fileDownloading: boolean = false;
    fileErrors: string[] = [];
    dataErrors: {
        row: number;
        name: string;
        logs: string[];
    }[] = [];

    currentErrorPage: {
        row: number;
        name: string;
        logs: string[];
    }[] = [];
    pageIndex: number = 0;
    pageSize: number = 10;

    constructor(private alert: AlertService, private http: HttpClient) {}

    openFileDialog(id: string) {
        const open = document.getElementById(id) as HTMLInputElement;
        if (open && !this.fileValidating) {
            open.value = '';
            open.click();
        }
    }

    downloadReport() {
        this.fileDownloading = true;
        let report = 'Row numbers are based on CSV file.\n\n';
        for (const e of this.dataErrors) {
            report += `Row ${e.row}\nCDE: ${e.name}\nIssue(s): ${e.logs.join('\n')}\n\n`;
        }
        const blob = new Blob([report], {
            type: 'text/text',
        });
        saveAs(blob, 'DataValidation.txt');
        this.alert.addAlert('success', 'Validation downloaded.');
        this.fileDownloading = false;
    }

    validateCSV(event: Event) {
        const files = (event.target as HTMLInputElement).files;
        if (files && files.length > 0) {
            const formData = new FormData();
            formData.append('uploadedFile', files[0]);
            this.fileValidating = true;
            this.http.post<any>('/server/loader/validateCSVLoad', formData).subscribe(
                response => {
                    this.fileValidating = false;
                    this.fileErrors = response.fileErrors;
                    this.dataErrors = response.dataErrors;
                    this.pageIndex = 0;
                    this.setCurrentErrorPage();
                    if (this.fileErrors.length === 0 && this.dataErrors.length === 0) {
                        this.alert.addAlert('success', 'No issues found');
                    }
                },
                error => {
                    this.fileValidating = false;
                    this.alert.httpErrorMessageAlert(error);
                }
            );
        }
    }

    pageChange(event: PageEvent) {
        this.pageIndex = event.pageIndex;
        this.setCurrentErrorPage();
    }

    setCurrentErrorPage() {
        const start = this.pageIndex * this.pageSize;
        this.currentErrorPage = this.dataErrors.slice(start, start + this.pageSize);
    }
}
