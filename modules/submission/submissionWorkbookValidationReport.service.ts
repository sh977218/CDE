import { Injectable } from '@angular/core';
import { VerifySubmissionFileReport } from 'shared/boundaryInterfaces/API/submission';
import { ErrorTypes } from 'shared/node/io/excel';
import { orderedSetAdd } from 'shared/array';
import { assertUnreachable } from 'shared/models.model';
import { saveAs } from 'file-saver';
import { AlertService } from 'alert/alert.service';

export interface ReportCategory {
    message: string;
    rows: (number | string)[];
}

@Injectable({ providedIn: 'root' })
export class SubmissionWorkbookValidationReportService {
    report?: VerifySubmissionFileReport;
    reportCdeCodes: ReportCategory[] = [];
    reportCdeColumn: ReportCategory[] = [];
    reportCdeColumnExtra: string[] = [];
    reportCdeColumnOptional: string[] = [];
    reportCdeColumnRequired: string[] = [];
    reportCdeExtra: ReportCategory[] = [];
    reportCdeLength: ReportCategory[] = [];
    reportCdeManual: ReportCategory[] = [];
    reportCdeRequired: ReportCategory[] = [];
    reportCdeSpellcheck: ReportCategory[] = [];
    reportDuplicatedCDEs: ReportCategory[] = [];
    reportCdeSuggestion: ReportCategory[] = [];
    reportCdeTemplate: ReportCategory[] = [];

    constructor(private alert: AlertService) {}

    addCategorizedReportError(errorType: ErrorTypes, errorMessage: string, errorRow: number | string) {
        const reportCategory = this.errorTypeToReportCategory(errorType);
        const reportCategoryByMessage = reportCategory.find(r => r.message === errorMessage);
        if (reportCategoryByMessage) {
            orderedSetAdd(reportCategoryByMessage.rows, errorRow);
        } else {
            reportCategory.push({ message: errorMessage, rows: [errorRow] });
        }
    }

    createCategorizedReport(): Promise<void> {
        this.reportCdeCodes.length = 0;
        this.reportCdeColumn.length = 0;
        this.reportCdeExtra.length = 0;
        this.reportCdeLength.length = 0;
        this.reportCdeManual.length = 0;
        this.reportCdeRequired.length = 0;
        this.reportCdeSpellcheck.length = 0;
        this.reportCdeTemplate.length = 0;
        if (!this.report) {
            return Promise.reject();
        }
        // DO NOT DISPLAY COVER PAGE ERRORS CDE-2654
        // this.report.validationErrors.cover.forEach(errorLog => {
        //     this.addCategorizedReportError('Template', errorLog, 'on cover page');
        // });
        this.report.validationErrors.CDEs.forEach(errorLog => {
            const errorMessageParts = errorLog.split(':');
            const errorRow = errorMessageParts[1];
            const errorType = errorMessageParts[2] as ErrorTypes;
            const errorMessage = errorMessageParts.slice(3).join(':');
            this.addCategorizedReportError(errorType, errorMessage, errorRow);
        });
        this.createHeadingColumnReport();
        return Promise.resolve();
    }

    createHeadingColumnReport() {
        this.reportCdeColumnExtra.length = 0;
        this.reportCdeColumnOptional.length = 0;
        this.reportCdeColumnRequired.length = 0;
        this.reportCdeColumn.forEach(m => {
            let match = /Worksheet Column "(.*)" is incorrect. Please remove to continue\./.exec(m.message);
            if (match && match.length > 1) {
                this.reportCdeColumnExtra.push(match[1]);
            }
            match = /Optional Column "(.*)" not used yet in the worksheet. This is okay\./.exec(m.message);
            if (match && match.length > 1) {
                this.reportCdeColumnOptional.push(match[1]);
            }
            match = /Required Column "(.*)" was not found in the worksheet. Add this column to continue\./.exec(
                m.message
            );
            if (match && match.length > 1) {
                this.reportCdeColumnRequired.push(match[1]);
            }
        });
    }

    displayError(e: ReportCategory) {
        return `${e.message} Row(s) ${e.rows.join(', ')}`;
    }

    downloadCdes() {
        let report = '';
        this.report?.data.dataElements.forEach(de => {
            report += '\t' + JSON.stringify(de) + '\n';
        });
        this.report?.data.forms.forEach(form => {
            report += '\t' + JSON.stringify(form) + '\n';
        });
        const blob = new Blob([report], {
            type: 'text/text',
        });
        saveAs(blob, 'SubmissionDataElements.txt');
        this.alert.addAlert('success', 'Data Elements saved. Check downloaded files.');
    }

    downloadReport() {
        let report = '';

        function addLine(str: string): void {
            report += str + '\n';
        }

        addLine('Row numbers are based on the Workbook.');
        addLine('');

        addLine(`Submission: ${this.report?.data.metadata.name}`);
        addLine(`Version: ${this.report?.data.metadata.version}`);
        addLine('');

        addLine('Critical Errors');
        addLine(
            this.reportCdeManual.length ||
                this.reportCdeColumn.length ||
                this.reportCdeLength.length ||
                this.reportCdeRequired.length ||
                this.reportCdeTemplate.length
                ? 'These must be fixed before your submission can be accepted for review.'
                : '\tNo critical errors found.'
        );
        addLine('');
        if (this.reportCdeManual.length) {
            addLine('Assistance Required');
            for (const e of this.reportCdeManual) {
                addLine(`\t${this.displayError(e)}`);
            }
            addLine('');
        }
        if (this.reportCdeColumn.length) {
            addLine('Column Heading');
            addLine(
                'Incorrect Worksheet Column Headings: Please do not change the column headers, or insert new columns in the middle of the form. If you need to add additional properties, add them to the right of the columns.'
            );
            for (const e of this.reportCdeColumnExtra) {
                addLine(`\t${e}`);
            }
            if (this.reportCdeColumnRequired.length) {
                addLine('Required Column Heading missing the worksheet: (Add these columns to continue.)');
                for (const e of this.reportCdeColumnRequired) {
                    addLine(`\t${e}`);
                }
            }
            if (this.reportCdeColumnOptional.length) {
                addLine('Optional Column Headings not used yet: (For your reference.)');
                for (const e of this.reportCdeColumnOptional) {
                    addLine(`\t${e}`);
                }
            }
            addLine('');
        }
        if (this.reportCdeLength.length) {
            addLine('Length of Lists');
            for (const e of this.reportCdeLength) {
                addLine(`\t${this.displayError(e)}`);
            }
            addLine('');
        }
        if (this.reportCdeRequired.length) {
            addLine('Required Field');
            for (const e of this.reportCdeRequired) {
                addLine(`\t${this.displayError(e)}`);
            }
            addLine('');
        }
        if (this.reportCdeTemplate.length) {
            addLine('Workbook Template');
            for (const e of this.reportCdeTemplate) {
                addLine(`\t${this.displayError(e)}`);
            }
            addLine('');
        }

        addLine('');
        addLine('');

        addLine('Suggestions to Review');
        addLine(
            this.reportCdeCodes.length ||
                this.reportCdeExtra.length ||
                this.reportCdeSpellcheck.length ||
                this.reportCdeSuggestion.length
                ? 'We recommend that you review the following, but you may submit without changing anything.'
                : '\tNo suggestions to review.'
        );
        addLine('');
        if (this.reportCdeCodes.length) {
            addLine('Code Validation');
            for (const e of this.reportCdeCodes) {
                addLine(`\t${this.displayError(e)}`);
            }
            addLine('');
        }
        if (this.reportCdeExtra.length) {
            addLine('Extra Unused Data');
            for (const e of this.reportCdeExtra) {
                addLine(`\t${this.displayError(e)}`);
            }
            addLine('');
        }
        if (this.reportCdeSuggestion.length) {
            addLine('More Suggestions');
            for (const e of this.reportCdeSuggestion) {
                addLine(`\t${this.displayError(e)}`);
            }
            addLine('');
        }
        if (this.reportCdeSpellcheck.length) {
            addLine('Spellcheck');
            for (const e of this.reportCdeSpellcheck) {
                addLine(`\t${this.displayError(e)}`);
            }
            addLine('');
        }
        if (this.reportDuplicatedCDEs.length) {
            addLine('DuplicatedCDEsCheck');
            for (const e of this.reportDuplicatedCDEs) {
                addLine(`\t${this.displayError(e)}`);
            }
            addLine('');
        }

        const blob = new Blob([report], {
            type: 'text/text',
        });
        const time = new Date();
        saveAs(blob, `CDE_validation_${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}.txt`);
        this.alert.addAlert('success', 'Report saved. Check downloaded files.');
    }

    errorTypeToReportCategory(errorType: ErrorTypes): ReportCategory[] {
        switch (errorType) {
            case 'Code':
                return this.reportCdeCodes;
            case 'Column Heading':
                return this.reportCdeColumn;
            case 'Extra':
                return this.reportCdeExtra;
            case 'Length':
                return this.reportCdeLength;
            case 'Manual Intervention':
                return this.reportCdeManual;
            case 'Required':
                return this.reportCdeRequired;
            case 'Spellcheck':
                return this.reportCdeSpellcheck;
            case 'Suggestion':
                return this.reportCdeSuggestion;
            case 'Duplicated CDEs':
                return this.reportDuplicatedCDEs;
            case 'Template':
                return this.reportCdeTemplate;
            default:
                throw assertUnreachable(errorType);
        }
    }
}
