import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AlertService } from 'alert/alert.service';
import { ValidationWhitelist } from 'shared/models.model';
import { PageEvent } from '@angular/material/paginator';
import { EditWhiteListModalComponent } from 'settings/spellcheck/edit-white-list-modal/edit-white-list-modal.component';
import { DeleteWhiteListModalComponent } from 'settings/spellcheck/delete-white-list-modal/delete-white-list-modal.component';
import { AddWhiteListModalComponent } from 'settings/spellcheck/add-white-list-modal/add-white-list-modal.component';
import { remove as _remove } from 'lodash';

type SpellingErrors = Record<
    string,
    {
        row: number;
        name: string;
        error: string;
        field: string;
    }[]
>;

@Component({
    selector: 'cde-spellcheck',
    templateUrl: './spellcheck.component.html',
    styles: [
        `
            .checkBoxCell {
                cursor: pointer;
                text-align: center;
                vertical-align: middle;
            }
        `,
    ],
})
export class SpellCheckComponent {
    whiteList: ValidationWhitelist[] = [];
    checkingFile = false;
    retrievingWhitelists = false;
    updatingWhitelists = false;
    fileErrors: string[] = [];
    selectedErrors: Set<string> = new Set();
    spellingErrors: SpellingErrors = {};
    showAllTermErrors: Record<string, boolean> = {};
    errorLimit = 5;
    currentErrorPage: string[] = [];
    pageIndex = 0;
    pageSize = 10;

    selectedWhiteList: ValidationWhitelist;

    constructor(private alert: AlertService, private http: HttpClient, public dialog: MatDialog) {
        this.getWhiteLists();
    }

    openFileDialog(id: string) {
        const open = document.getElementById(id) as HTMLInputElement;
        if (open && !this.checkingFile) {
            open.value = '';
            open.click();
        }
    }

    getWhiteLists() {
        this.http.get<ValidationWhitelist[]>('/server/loader/whitelists').subscribe(
            res => (this.whiteList = res),
            error => this.alert.httpErrorMessageAlert(error)
        );
    }

    whiteListSelectedErrors() {
        if (this.selectedErrors.size > 0) {
            this.selectedWhiteList.terms = this.selectedWhiteList.terms.concat(Array.from(this.selectedErrors));
            this.updateWhiteList(this.selectedWhiteList, res => {
                this.selectedErrors.clear();
                if (this.getMisspelledTerms().length > 0) {
                    for (const t of res.terms) {
                        delete this.spellingErrors[t];
                    }
                    this.setCurrentErrorPage();
                }
            });
        }
    }

    updateWhiteList(whiteList, cb?) {
        this.http.post<any>('/server/loader/updatewhitelist', whiteList).subscribe(
            res => {
                if (res) {
                    this.alert.addAlert('success', 'Whitelist updated');
                }
                if (cb) cb(res);
            },
            err => this.alert.httpErrorMessageAlert(err)
        );
    }

    spellcheckCSV(event: Event) {
        const files = (event.target as HTMLInputElement).files;
        if (files && files.length > 0 && this.selectedWhiteList) {
            const formData = new FormData();
            formData.append('uploadedFile', files[0]);
            formData.append('whitelist', this.selectedWhiteList.collectionName);
            this.checkingFile = true;
            this.http.post<any>('/server/loader/spellcheckCSVLoad', formData).subscribe(
                response => {
                    this.checkingFile = false;
                    this.fileErrors = response.fileErrors;
                    this.spellingErrors = response.spellingErrors;
                    this.currentErrorPage = this.getMisspelledTerms().splice(0, this.pageSize);
                    this.showAllTermErrors = {};
                    this.pageIndex = 0;
                    if (this.fileErrors.length === 0 && this.getMisspelledTerms().length === 0) {
                        this.alert.addAlert('success', 'No issues found');
                    }
                },
                error => {
                    this.checkingFile = false;
                    this.alert.httpErrorMessageAlert(error);
                }
            );
        }
    }

    addOrRemoveSpellingError(add: boolean, term: string) {
        if (add && !this.selectedErrors.has(term)) {
            this.selectedErrors.add(term);
        } else if (!add) {
            this.selectedErrors.delete(term);
        }
    }

    openAddWhitelistModal() {
        this.dialog
            .open(AddWhiteListModalComponent, { width: '800px' })
            .afterClosed()
            .subscribe(newWhiteList => {
                if (newWhiteList) {
                    this.addNewWhiteList(newWhiteList);
                    this.whiteList.push(newWhiteList);
                    this.selectedWhiteList = newWhiteList;
                }
            });
    }

    openCopyWhitelistModal() {
        const data = this.selectedWhiteList;
        this.dialog
            .open(AddWhiteListModalComponent, { width: '800px', data })
            .afterClosed()
            .subscribe(newWhiteList => {
                if (newWhiteList) {
                    this.addNewWhiteList(newWhiteList);
                    this.whiteList.push(newWhiteList);
                }
            });
    }

    addNewWhiteList(newWhiteList) {
        this.http.post('/server/loader/addNewWhitelist', newWhiteList, { responseType: 'text' }).subscribe(
            () => this.alert.addAlert('success', 'New Whitelist added'),
            () => this.alert.addAlert('danger', 'Cannot create new whitelist. Does it already exist?')
        );
    }

    openEditWhitelistModal() {
        this.dialog
            .open(EditWhiteListModalComponent, { width: '800px', data: this.selectedWhiteList })
            .afterClosed()
            .subscribe(res => {
                if (res) {
                    this.updateWhiteList(res);
                }
            });
    }

    openDeleteWhitelistModal() {
        this.dialog
            .open(DeleteWhiteListModalComponent, { data: this.selectedWhiteList })
            .afterClosed()
            .subscribe(res => {
                if (res) {
                    this.deleteWhiteList(this.selectedWhiteList.collectionName);
                    _remove(this.whiteList, o => o.collectionName === this.selectedWhiteList.collectionName);
                    this.selectedWhiteList = null;
                }
            });
    }

    deleteWhiteList(collectionName) {
        this.http.delete(`/server/loader/deletewhitelist/${collectionName}`).subscribe(
            () => this.alert.addAlert('success', 'Whitelist deleted'),
            err => this.alert.addAlert('danger', `Could not remove whitelist. ${err} `)
        );
    }

    getMisspelledTerms(): string[] {
        return Object.keys(this.spellingErrors).sort();
    }

    pageChange(event: PageEvent) {
        this.pageIndex = event.pageIndex;
        this.setCurrentErrorPage();
    }

    setCurrentErrorPage() {
        const errorTerms = this.getMisspelledTerms();
        const errorsSize = errorTerms.length;
        if (this.pageIndex * this.pageSize > errorsSize - 1) {
            this.pageIndex = Math.ceil(errorsSize / this.pageSize) - 1;
        }
        this.currentErrorPage = errorTerms.splice(this.pageIndex * this.pageSize, this.pageSize);
    }

    getErrorDisplayText(text: string, term: string, row: number, field: string): string {
        const regEx = new RegExp(term, 'ig');
        text = text.replace(regEx, '<strong>$&</strong>');
        return `Row ${row} - ${field}: ${text}`;
    }
}
